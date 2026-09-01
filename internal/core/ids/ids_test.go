package ids

import (
	"strings"
	"testing"
)

func TestNewFormat(t *testing.T) {
	g := New()
	cases := []string{"grant", "evt", "sess"}
	for _, prefix := range cases {
		t.Run(prefix, func(t *testing.T) {
			id := g.New(prefix)
			if !strings.HasPrefix(id, prefix+"_") {
				t.Fatalf("id %q missing prefix %q", id, prefix)
			}
			hexPart := strings.TrimPrefix(id, prefix+"_")
			if len(hexPart) != 12 {
				t.Fatalf("hex len = %d want 12", len(hexPart))
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
