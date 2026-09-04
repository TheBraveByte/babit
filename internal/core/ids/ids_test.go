package ids

import (
	"regexp"
	"testing"
)

var ticket = regexp.MustCompile(`^BAL-[0-9a-f]{16}$`)

func TestNewFormat(t *testing.T) {
	g := New()
	for i := 0; i < 100; i++ {
		id := g.New()
		if !ticket.MatchString(id) {
			t.Fatalf("id %q does not match BAL-<hex>", id)
		}
	}
}

func TestNewVaries(t *testing.T) {
	g := New()
	seen := make(map[string]struct{})
	for i := 0; i < 500; i++ {
		seen[g.New()] = struct{}{}
	}
	if len(seen) < 400 {
		t.Fatalf("expected mostly-distinct ids, got %d unique of 500", len(seen))
	}
}
