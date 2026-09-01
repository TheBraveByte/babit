package service_test

import (
	"context"
	"fmt"
	"os"
	"testing"

	"github.com/babit/nal/db"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/adapters/anchor"
	"github.com/babit/nal/internal/adapters/store"
	"github.com/babit/nal/internal/core/clock"
	"github.com/babit/nal/internal/core/graph"
	"github.com/babit/nal/internal/core/ids"
	"github.com/babit/nal/internal/core/merkle"
	"github.com/babit/nal/internal/core/seal"
	"github.com/babit/nal/internal/core/sign"
	"github.com/babit/nal/internal/service"
	"google.golang.org/protobuf/proto"
)

type rig struct {
	delegation *service.Delegation
	capture    *service.Capture
	ledger     *service.Ledger
	verify     *service.Verify
}

func newRig(t *testing.T) rig {
	t.Helper()
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		t.Skip("DATABASE_URL not set")
	}
	if err := db.Init(context.Background(), dsn); err != nil {
		t.Fatalf("init db: %v", err)
	}
	st := store.New(db.Q)
	signer, err := sign.NewEd25519()
	if err != nil {
		t.Fatalf("signer: %v", err)
	}
	clk := clock.System()
	verifier := graph.New(signer)
	tree := merkle.New()
	core := service.NewNotaryCore(st.Events(), seal.New(signer))
	return rig{
		delegation: service.NewDelegation(st.Grants(), signer, verifier, ids.New(), clk),
		capture:    service.NewCapture(st.Sessions(), st.Grants(), verifier, core, ids.New(), clk),
		ledger:     service.NewLedger(st.Events(), st.Grants(), tree, anchor.NewInMemory(clk)),
		verify:     service.NewVerify(signer, tree, verifier, clk),
	}
}

func TestEndToEndNotarizeVerifyAndTamper(t *testing.T) {
	ctx := context.Background()
	r := newRig(t)

	root, err := r.delegation.IssueRootGrant(ctx, &ledgerv1.IssueRootGrantRequest{PrincipalId: "usr_alice", Scope: &ledgerv1.Scope{MaxDepth: 3}})
	if err != nil {
		t.Fatalf("issue root: %v", err)
	}
	child, err := r.delegation.Delegate(ctx, &ledgerv1.DelegateRequest{ParentGrantId: root.GetGrant().GetGrantId(), SubjectId: "agt_shopper", Capabilities: []string{"browser.click"}, Scope: &ledgerv1.Scope{}})
	if err != nil {
		t.Fatalf("delegate: %v", err)
	}
	sess, err := r.capture.BeginSession(ctx, &ledgerv1.BeginSessionRequest{RootGrantId: root.GetGrant().GetGrantId(), Surface: ledgerv1.Surface_SURFACE_BROWSER})
	if err != nil {
		t.Fatalf("begin session: %v", err)
	}

	var lastEvent string
	for i := 0; i < 3; i++ {
		rec, rerr := r.capture.RecordAction(ctx, &ledgerv1.RecordActionRequest{
			SessionId:    sess.GetSession().GetSessionId(),
			GrantId:      child.GetGrant().GetGrantId(),
			ActionType:   "browser.click",
			RecordingRef: fmt.Sprintf("slr://rec/%s/frame/%d", sess.GetSession().GetSessionId(), i+1),
		})
		if rerr != nil {
			t.Fatalf("record action %d: %v", i, rerr)
		}
		lastEvent = rec.GetEvent().GetEventId()
	}

	pr, err := r.ledger.GetInclusionProof(ctx, &ledgerv1.GetInclusionProofRequest{EventId: lastEvent})
	if err != nil {
		t.Fatalf("inclusion proof: %v", err)
	}
	good, err := r.verify.VerifyProof(ctx, &ledgerv1.VerifyProofRequest{Proof: pr.GetProof()})
	if err != nil {
		t.Fatalf("verify: %v", err)
	}
	if !good.GetValid() || !good.GetChainIntact() || !good.GetSignatureValid() || !good.GetAuthorityValid() {
		t.Fatalf("expected valid proof, got %+v", good)
	}

	tampered := proto.Clone(pr.GetProof()).(*ledgerv1.Proof)
	tampered.Event.ActionType = "browser.evil"
	bad, err := r.verify.VerifyProof(ctx, &ledgerv1.VerifyProofRequest{Proof: tampered})
	if err != nil {
		t.Fatalf("verify tampered: %v", err)
	}
	if bad.GetChainIntact() || bad.GetValid() {
		t.Fatalf("tamper not detected: %+v", bad)
	}
}

func TestRecordActionDeniesUngrantedCapability(t *testing.T) {
	ctx := context.Background()
	r := newRig(t)
	root, _ := r.delegation.IssueRootGrant(ctx, &ledgerv1.IssueRootGrantRequest{PrincipalId: "usr_bob", Scope: &ledgerv1.Scope{MaxDepth: 3}})
	child, _ := r.delegation.Delegate(ctx, &ledgerv1.DelegateRequest{ParentGrantId: root.GetGrant().GetGrantId(), SubjectId: "agt_x", Capabilities: []string{"browser.click"}, Scope: &ledgerv1.Scope{}})
	sess, _ := r.capture.BeginSession(ctx, &ledgerv1.BeginSessionRequest{RootGrantId: root.GetGrant().GetGrantId(), Surface: ledgerv1.Surface_SURFACE_BROWSER})
	_, err := r.capture.RecordAction(ctx, &ledgerv1.RecordActionRequest{SessionId: sess.GetSession().GetSessionId(), GrantId: child.GetGrant().GetGrantId(), ActionType: "sandbox.exec"})
	if err == nil {
		t.Fatal("expected permission denied for ungranted capability")
	}
}
