package graph

import (
	"fmt"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/canon"
	"github.com/babit/nal/internal/ports"
)

const keyID = "nal-notary-1"

type verifier struct {
	signer ports.Signer
}

func New(s ports.Signer) ports.DelegationVerifier {
	return verifier{signer: s}
}

func (v verifier) VerifyChain(chain []*ledgerv1.Grant, now time.Time) error {
	if len(chain) == 0 {
		return fmt.Errorf("verify chain: %w", fmt.Errorf("empty chain"))
	}
	if chain[0].GetParentGrantId() != "" {
		return fmt.Errorf("verify root: %w", fmt.Errorf("root has parent %q", chain[0].GetParentGrantId()))
	}
	maxDepth := chain[0].GetScope().GetMaxDepth()
	if maxDepth > 0 && int32(len(chain)-1) > maxDepth {
		return fmt.Errorf("verify depth: %w", fmt.Errorf("depth %d exceeds max %d", len(chain)-1, maxDepth))
	}
	for i, g := range chain {
		if err := checkExpiry(g, now); err != nil {
			return fmt.Errorf("verify expiry at %d: %w", i, err)
		}
		if i == 0 {
			continue
		}
		if g.GetParentGrantId() != chain[i-1].GetGrantId() {
			return fmt.Errorf("verify linkage at %d: %w", i, fmt.Errorf("parent %q != %q", g.GetParentGrantId(), chain[i-1].GetGrantId()))
		}
		if err := checkNonWidening(chain[i-1], g); err != nil {
			return fmt.Errorf("verify capabilities at %d: %w", i, err)
		}
		if !v.signer.Verify(canon.Grant(g), g.GetParentSignature(), keyID) {
			return fmt.Errorf("verify signature at %d: %w", i, fmt.Errorf("invalid parent signature"))
		}
	}
	return nil
}

func checkExpiry(g *ledgerv1.Grant, now time.Time) error {
	ts := g.GetExpiresAt()
	if ts == nil {
		return nil
	}
	if ts.AsTime().Before(now) {
		return fmt.Errorf("grant %q expired", g.GetGrantId())
	}
	return nil
}

func checkNonWidening(parent, child *ledgerv1.Grant) error {
	if len(parent.GetCapabilities()) == 0 {
		return nil
	}
	set := make(map[string]struct{}, len(parent.GetCapabilities()))
	for _, c := range parent.GetCapabilities() {
		set[c] = struct{}{}
	}
	for _, c := range child.GetCapabilities() {
		if _, ok := set[c]; !ok {
			return fmt.Errorf("capability %q widens parent", c)
		}
	}
	return nil
}

func (v verifier) Authorizes(grant *ledgerv1.Grant, capability, resource string, valueCents int64) error {
	if len(grant.GetCapabilities()) > 0 && !hasCapability(grant, capability) {
		return fmt.Errorf("authorize capability: %w", fmt.Errorf("capability %q not granted", capability))
	}
	globs := grant.GetScope().GetResourceGlobs()
	if len(globs) > 0 && resource != "" && !matchesResource(globs, resource) {
		return fmt.Errorf("authorize resource: %w", fmt.Errorf("resource %q not in scope", resource))
	}
	max := grant.GetScope().GetMaxValueCents()
	if max > 0 && valueCents > max {
		return fmt.Errorf("authorize value: %w", fmt.Errorf("value %d exceeds max %d", valueCents, max))
	}
	return nil
}

func hasCapability(grant *ledgerv1.Grant, capability string) bool {
	for _, c := range grant.GetCapabilities() {
		if c == capability {
			return true
		}
	}
	return false
}

func matchesResource(globs []string, resource string) bool {
	for _, g := range globs {
		if matchGlob(g, resource) {
			return true
		}
	}
	return false
}

func matchGlob(pattern, s string) bool {
	if pattern == "*" {
		return true
	}
	if len(pattern) >= 2 && pattern[len(pattern)-2:] == "/*" {
		prefix := pattern[:len(pattern)-1]
		return len(s) >= len(prefix) && s[:len(prefix)] == prefix
	}
	if len(pattern) >= 1 && pattern[len(pattern)-1] == '*' {
		prefix := pattern[:len(pattern)-1]
		return len(s) >= len(prefix) && s[:len(prefix)] == prefix
	}
	return pattern == s
}
