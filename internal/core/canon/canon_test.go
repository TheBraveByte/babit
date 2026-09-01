package canon

import (
	"bytes"
	"testing"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func sampleEvent() *ledgerv1.ActionEvent {
	return &ledgerv1.ActionEvent{
		EventId:         "evt_1",
		SessionId:       "sess_1",
		Sequence:        7,
		Surface:         ledgerv1.Surface(2),
		ActionType:      "click",
		ActionPayload:   []byte("payload"),
		GrantId:         "grant_1",
		PreStateHash:    []byte("pre"),
		PostStateHash:   []byte("post"),
		RecordingRef:    "rec_1",
		OccurredAt:      timestamppb.New(time.Unix(100, 200)),
		ContentHash:     []byte("content"),
		PrevHash:        []byte("prev"),
		NotarySignature: []byte("sig"),
	}
}

func sampleGrant() *ledgerv1.Grant {
	return &ledgerv1.Grant{
		GrantId:       "g1",
		ParentGrantId: "",
		PrincipalId:   "p1",
		SubjectId:     "s1",
		Capabilities:  []string{"read", "write"},
		Scope: &ledgerv1.Scope{
			ResourceGlobs: []string{"a/*", "b"},
			MaxValueCents: 500,
			MaxDepth:      3,
		},
		ExpiresAt:       timestamppb.New(time.Unix(999, 0)),
		ParentSignature: []byte("psig"),
	}
}

func TestEventDeterministic(t *testing.T) {
	e := sampleEvent()
	if !bytes.Equal(Event(e), Event(e)) {
		t.Fatal("event encoding not deterministic")
	}
}

func TestEventExcludesSealFields(t *testing.T) {
	base := Event(sampleEvent())
	cases := []struct {
		name   string
		mutate func(*ledgerv1.ActionEvent)
		change bool
	}{
		{"content_hash", func(e *ledgerv1.ActionEvent) { e.ContentHash = []byte("x") }, false},
		{"prev_hash", func(e *ledgerv1.ActionEvent) { e.PrevHash = []byte("x") }, false},
		{"notary_signature", func(e *ledgerv1.ActionEvent) { e.NotarySignature = []byte("x") }, false},
		{"event_id", func(e *ledgerv1.ActionEvent) { e.EventId = "other" }, true},
		{"sequence", func(e *ledgerv1.ActionEvent) { e.Sequence = 99 }, true},
		{"surface", func(e *ledgerv1.ActionEvent) { e.Surface = ledgerv1.Surface(5) }, true},
		{"occurred_at", func(e *ledgerv1.ActionEvent) { e.OccurredAt = timestamppb.New(time.Unix(1, 0)) }, true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			e := sampleEvent()
			tc.mutate(e)
			changed := !bytes.Equal(base, Event(e))
			if changed != tc.change {
				t.Fatalf("field %s changed=%v want %v", tc.name, changed, tc.change)
			}
		})
	}
}

func TestGrantDeterministicAndExclusions(t *testing.T) {
	base := Grant(sampleGrant())
	if !bytes.Equal(base, Grant(sampleGrant())) {
		t.Fatal("grant encoding not deterministic")
	}
	cases := []struct {
		name   string
		mutate func(*ledgerv1.Grant)
		change bool
	}{
		{"parent_signature", func(g *ledgerv1.Grant) { g.ParentSignature = []byte("z") }, false},
		{"grant_id", func(g *ledgerv1.Grant) { g.GrantId = "other" }, true},
		{"capabilities", func(g *ledgerv1.Grant) { g.Capabilities = []string{"read"} }, true},
		{"max_value_cents", func(g *ledgerv1.Grant) { g.Scope.MaxValueCents = 1 }, true},
		{"max_depth", func(g *ledgerv1.Grant) { g.Scope.MaxDepth = 1 }, true},
		{"resource_globs", func(g *ledgerv1.Grant) { g.Scope.ResourceGlobs = []string{"z"} }, true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			g := sampleGrant()
			tc.mutate(g)
			changed := !bytes.Equal(base, Grant(g))
			if changed != tc.change {
				t.Fatalf("field %s changed=%v want %v", tc.name, changed, tc.change)
			}
		})
	}
}
