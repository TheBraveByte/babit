package graph

import (
	"testing"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/canon"
	"github.com/babit/nal/internal/core/sign"
	"github.com/babit/nal/internal/ports"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func signGrant(t *testing.T, s ports.Signer, g *ledgerv1.Grant) {
	t.Helper()
	sig, _, err := s.Sign(canon.Grant(g))
	if err != nil {
		t.Fatalf("sign grant: %v", err)
	}
	g.ParentSignature = sig
}

func validChain(t *testing.T, s ports.Signer) []*ledgerv1.Grant {
	root := &ledgerv1.Grant{
		GrantId:      "g0",
		PrincipalId:  "p",
		SubjectId:    "s0",
		Capabilities: []string{"read", "write", "pay"},
		Scope:        &ledgerv1.Scope{ResourceGlobs: []string{"acct/*"}, MaxValueCents: 1000, MaxDepth: 3},
	}
	child := &ledgerv1.Grant{
		GrantId:       "g1",
		ParentGrantId: "g0",
		PrincipalId:   "p",
		SubjectId:     "s1",
		Capabilities:  []string{"read", "pay"},
		Scope:         &ledgerv1.Scope{ResourceGlobs: []string{"acct/1"}, MaxValueCents: 500, MaxDepth: 3},
	}
	signGrant(t, s, child)
	return []*ledgerv1.Grant{root, child}
}

func TestVerifyChainValid(t *testing.T) {
	s, _ := sign.NewEd25519()
	v := New(s)
	if err := v.VerifyChain(validChain(t, s), time.Now()); err != nil {
		t.Fatalf("expected valid: %v", err)
	}
}

func TestVerifyChainFailures(t *testing.T) {
	s, _ := sign.NewEd25519()
	v := New(s)
	now := time.Now()
	cases := []struct {
		name  string
		build func() []*ledgerv1.Grant
	}{
		{"broken linkage", func() []*ledgerv1.Grant {
			c := validChain(t, s)
			c[1].ParentGrantId = "wrong"
			signGrant(t, s, c[1])
			return c
		}},
		{"expired", func() []*ledgerv1.Grant {
			c := validChain(t, s)
			c[1].ExpiresAt = timestamppb.New(now.Add(-time.Hour))
			signGrant(t, s, c[1])
			return c
		}},
		{"too deep", func() []*ledgerv1.Grant {
			c := validChain(t, s)
			c[0].Scope.MaxDepth = 0
			c[0].Scope.MaxValueCents = 0
			deep := []*ledgerv1.Grant{c[0], c[1]}
			c[0].Scope.MaxDepth = 1
			extra := &ledgerv1.Grant{GrantId: "g2", ParentGrantId: "g1", Capabilities: []string{"read"}, Scope: &ledgerv1.Scope{}}
			signGrant(t, s, extra)
			return append(deep, extra)
		}},
		{"widened caps", func() []*ledgerv1.Grant {
			c := validChain(t, s)
			c[1].Capabilities = []string{"read", "admin"}
			signGrant(t, s, c[1])
			return c
		}},
		{"bad signature", func() []*ledgerv1.Grant {
			c := validChain(t, s)
			c[1].ParentSignature = make([]byte, 64)
			return c
		}},
		{"root has parent", func() []*ledgerv1.Grant {
			c := validChain(t, s)
			c[0].ParentGrantId = "x"
			return c
		}},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if err := v.VerifyChain(tc.build(), now); err == nil {
				t.Fatalf("expected error for %s", tc.name)
			}
		})
	}
}

func TestAuthorizes(t *testing.T) {
	s, _ := sign.NewEd25519()
	v := New(s)
	grant := &ledgerv1.Grant{
		Capabilities: []string{"read", "pay"},
		Scope:        &ledgerv1.Scope{ResourceGlobs: []string{"acct/*"}, MaxValueCents: 500},
	}
	cases := []struct {
		name       string
		capability string
		resource   string
		value      int64
		wantErr    bool
	}{
		{"allow", "pay", "acct/1", 100, false},
		{"no capability", "admin", "acct/1", 100, true},
		{"resource mismatch", "pay", "other/1", 100, true},
		{"value exceeds", "pay", "acct/1", 900, true},
		{"at value limit", "pay", "acct/1", 500, false},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			err := v.Authorizes(grant, tc.capability, tc.resource, tc.value)
			if (err != nil) != tc.wantErr {
				t.Fatalf("err=%v wantErr=%v", err, tc.wantErr)
			}
		})
	}
}
