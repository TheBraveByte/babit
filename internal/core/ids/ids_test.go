package ids

import (
	"strings"
	"testing"

	"github.com/google/uuid"
)

func TestNewFormat(t *testing.T) {
	g := New()
	for _, prefix := range []string{"grn", "evt", "ses"} {
		t.Run(prefix, func(t *testing.T) {
			id := g.New(prefix)
			rest, ok := strings.CutPrefix(id, prefix+"_")
			if !ok {
				t.Fatalf("id %q missing prefix %q", id, prefix)
			}
			if _, err := uuid.Parse(rest); err != nil {
				t.Fatalf("id %q suffix is not a uuid: %v", id, err)
			}
		})
	}
}

func TestNewUniqueness(t *testing.T) {
	g := New()
	seen := make(map[string]struct{})
	for i := 0; i < 10000; i++ {
		id := g.New("x")
		if _, ok := seen[id]; ok {
			t.Fatalf("duplicate id %q", id)
		}
		seen[id] = struct{}{}
	}
}
