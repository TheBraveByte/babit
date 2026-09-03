package store_test

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/babit/nal/db"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/adapters/store"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func newStore(t *testing.T) *store.Store {
	t.Helper()
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		t.Skip("DATABASE_URL not set")
	}
	if err := db.Init(context.Background(), dsn); err != nil {
		t.Fatalf("init db: %v", err)
	}
	return store.New(db.Q)
}

func TestSessionsAndSequence(t *testing.T) {
	st := newStore(t)
	ctx := context.Background()
	s := &ledgerv1.Session{SessionId: "ses_test1", RootGrantId: "grn_root", Surface: ledgerv1.Surface_SURFACE_BROWSER, StartedAt: timestamppb.New(time.Now())}
	if err := st.Sessions().Create(ctx, s); err != nil {
		t.Fatalf("create: %v", err)
	}
	first, err := st.Sessions().NextSequence(ctx, "ses_test1")
	if err != nil {
		t.Fatalf("next: %v", err)
	}
	second, _ := st.Sessions().NextSequence(ctx, "ses_test1")
	if second != first+1 {
		t.Fatalf("sequence not monotonic: %d then %d", first, second)
	}
}

func TestGrantChainAndRevoke(t *testing.T) {
	st := newStore(t)
	ctx := context.Background()
	g := st.Grants()
	root := &ledgerv1.Grant{GrantId: "grn_r", PrincipalId: "usr", SubjectId: "usr", Scope: &ledgerv1.Scope{MaxDepth: 3}}
	child := &ledgerv1.Grant{GrantId: "grn_c", ParentGrantId: "grn_r", PrincipalId: "usr", SubjectId: "agt", Capabilities: []string{"browser.click"}, Scope: &ledgerv1.Scope{}}
	if err := g.Put(ctx, root); err != nil {
		t.Fatalf("put root: %v", err)
	}
	if err := g.Put(ctx, child); err != nil {
		t.Fatalf("put child: %v", err)
	}
	chain, err := g.Chain(ctx, "grn_c")
	if err != nil {
		t.Fatalf("chain: %v", err)
	}
	if len(chain) != 2 || chain[0].GetGrantId() != "grn_r" || chain[1].GetGrantId() != "grn_c" {
		t.Fatalf("unexpected chain: %+v", chain)
	}
	if revoked, _ := g.IsRevoked(ctx, "grn_c"); revoked {
		t.Fatal("should not be revoked yet")
	}
	if err := g.Revoke(ctx, "grn_c", "test"); err != nil {
		t.Fatalf("revoke: %v", err)
	}
	if revoked, _ := g.IsRevoked(ctx, "grn_c"); !revoked {
		t.Fatal("should be revoked")
	}
}

func TestEventsAppendAndWORM(t *testing.T) {
	st := newStore(t)
	ctx := context.Background()
	sess := &ledgerv1.Session{SessionId: "ses_worm", RootGrantId: "grn_root", Surface: ledgerv1.Surface_SURFACE_SANDBOX, StartedAt: timestamppb.New(time.Now())}
	_ = st.Sessions().Create(ctx, sess)
	ev := &ledgerv1.ActionEvent{
		EventId: "evt_worm1", SessionId: "ses_worm", Sequence: 1,
		Surface: ledgerv1.Surface_SURFACE_SANDBOX, ActionType: "exec", GrantId: "grn_c",
		OccurredAt:  timestamppb.New(time.Now()),
		ContentHash: []byte("c"), PrevHash: []byte("p"), NotarySignature: []byte("s"),
	}
	if err := st.Events().Append(ctx, ev); err != nil {
		t.Fatalf("append: %v", err)
	}
	got, err := st.Events().Get(ctx, "evt_worm1")
	if err != nil || got.GetEventId() != "evt_worm1" {
		t.Fatalf("get: %v %+v", err, got)
	}
	last, _ := st.Events().Last(ctx, "ses_worm")
	if last.GetSequence() != 1 {
		t.Fatalf("last sequence: %d", last.GetSequence())
	}
	if _, err := db.Pool.Exec(ctx, "UPDATE events SET action_type='x' WHERE event_id='evt_worm1'"); err == nil {
		t.Fatal("WORM violated: UPDATE succeeded")
	}
	if _, err := db.Pool.Exec(ctx, "DELETE FROM events WHERE event_id='evt_worm1'"); err == nil {
		t.Fatal("WORM violated: DELETE succeeded")
	}
}
