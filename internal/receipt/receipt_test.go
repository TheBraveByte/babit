package receipt_test

import (
	"testing"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/canon"
	"github.com/babit/nal/internal/core/merkle"
	"github.com/babit/nal/internal/core/seal"
	"github.com/babit/nal/internal/core/sign"
	"github.com/babit/nal/internal/receipt"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/proto"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func buildProof(t *testing.T) (*ledgerv1.Proof, []byte) {
	t.Helper()
	signer, err := sign.NewEd25519()
	require.NoError(t, err)

	root := &ledgerv1.Grant{GrantId: "grn_root", PrincipalId: "usr", SubjectId: "usr", Scope: &ledgerv1.Scope{MaxDepth: 3}}
	rootSig, _, _ := signer.Sign(canon.Grant(root))
	root.ParentSignature = rootSig
	child := &ledgerv1.Grant{GrantId: "grn_child", ParentGrantId: "grn_root", PrincipalId: "usr", SubjectId: "agt", Capabilities: []string{"browser.click"}, Scope: &ledgerv1.Scope{}}
	childSig, _, _ := signer.Sign(canon.Grant(child))
	child.ParentSignature = childSig

	draft := &ledgerv1.ActionEvent{
		EventId: "evt_1", SessionId: "ses", Sequence: 1, ActionType: "browser.click",
		GrantId: "grn_child", RecordingRef: "slr://session/x",
		OccurredAt: timestamppb.New(time.Unix(1, 0)),
	}
	sealed, err := seal.New(signer).Seal(draft, nil)
	require.NoError(t, err)

	tree := merkle.New()
	leaves := [][]byte{sealed.GetContentHash()}
	rootHash := tree.Root(leaves)
	path, err := tree.Path(leaves, 0)
	require.NoError(t, err)

	proof := &ledgerv1.Proof{
		Event:           sealed,
		MerklePath:      path,
		MerkleRoot:      rootHash,
		Anchor:          &ledgerv1.Anchor{Root: rootHash},
		DelegationChain: []*ledgerv1.Grant{root, child},
	}
	pub, _ := signer.PublicKey(sign.DefaultKeyID)
	return proof, pub
}

func TestVerifyValidReceipt(t *testing.T) {
	proof, pub := buildProof(t)
	r, err := receipt.Build(proof, sign.DefaultKeyID, pub)
	require.NoError(t, err)

	res, _, err := receipt.Verify(r, time.Now())
	require.NoError(t, err)
	require.True(t, res.Verdict, "%+v", res)
	require.True(t, res.SignatureValid && res.ContentIntact && res.Included && res.Anchored && res.AuthorityValid)
}

func TestVerifyDetectsTamper(t *testing.T) {
	proof, pub := buildProof(t)
	tampered := proto.Clone(proof).(*ledgerv1.Proof)
	tampered.Event.ActionType = "browser.evil"
	r, err := receipt.Build(tampered, sign.DefaultKeyID, pub)
	require.NoError(t, err)

	res, _, err := receipt.Verify(r, time.Now())
	require.NoError(t, err)
	require.False(t, res.Verdict)
	require.False(t, res.ContentIntact)
}
