package seal

import (
	"testing"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/sign"
)

func newEvent(id string, seq int64) *ledgerv1.ActionEvent {
	return &ledgerv1.ActionEvent{
		EventId:    id,
		SessionId:  "sess",
		Sequence:   seq,
		ActionType: "act",
	}
}

func TestSealChainVerify(t *testing.T) {
	signer, err := sign.NewEd25519()
	if err != nil {
		t.Fatalf("signer: %v", err)
	}
	s := New(signer)
	var prev *ledgerv1.ActionEvent
	events := []*ledgerv1.ActionEvent{
		newEvent("e1", 1), newEvent("e2", 2), newEvent("e3", 3),
	}
	for i, e := range events {
		sealed, err := s.Seal(e, prev)
		if err != nil {
			t.Fatalf("seal %d: %v", i, err)
		}
		if err := s.VerifyLink(sealed, prev); err != nil {
			t.Fatalf("verify %d: %v", i, err)
		}
		prev = sealed
	}
}

func TestVerifyLinkTampered(t *testing.T) {
	signer, err := sign.NewEd25519()
	if err != nil {
		t.Fatalf("signer: %v", err)
	}
	s := New(signer)
	e1, _ := s.Seal(newEvent("e1", 1), nil)
	e2, _ := s.Seal(newEvent("e2", 2), e1)

	cases := []struct {
		name   string
		mutate func(*ledgerv1.ActionEvent)
	}{
		{"action_type", func(e *ledgerv1.ActionEvent) { e.ActionType = "changed" }},
		{"content_hash", func(e *ledgerv1.ActionEvent) { e.ContentHash = make([]byte, 32) }},
		{"prev_hash", func(e *ledgerv1.ActionEvent) { e.PrevHash = make([]byte, 32) }},
		{"signature", func(e *ledgerv1.ActionEvent) { e.NotarySignature = make([]byte, 64) }},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			sealed, _ := s.Seal(newEvent("e2", 2), e1)
			tc.mutate(sealed)
			if err := s.VerifyLink(sealed, e1); err == nil {
				t.Fatalf("expected error for %s", tc.name)
			}
		})
	}
	_ = e2
}
