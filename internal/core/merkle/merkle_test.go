package merkle

import (
	"bytes"
	"crypto/sha256"
	"testing"
)

func TestRootKnown(t *testing.T) {
	m := New()
	cases := []struct {
		name   string
		leaves [][]byte
		want   []byte
	}{
		{"empty", nil, make([]byte, sha256.Size)},
		{"single", [][]byte{[]byte("a")}, leafHash([]byte("a"))},
		{"pair", [][]byte{[]byte("a"), []byte("b")}, nodeHash(leafHash([]byte("a")), leafHash([]byte("b")))},
		{"odd", [][]byte{[]byte("a"), []byte("b"), []byte("c")},
			nodeHash(
				nodeHash(leafHash([]byte("a")), leafHash([]byte("b"))),
				nodeHash(leafHash([]byte("c")), leafHash([]byte("c"))),
			)},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := m.Root(tc.leaves); !bytes.Equal(got, tc.want) {
				t.Fatalf("root mismatch")
			}
		})
	}
}

func TestPathVerifyRoundTrip(t *testing.T) {
	m := New()
	for _, n := range []int{1, 2, 3, 4, 5, 8, 9} {
		leaves := make([][]byte, n)
		for i := range leaves {
			leaves[i] = []byte{byte(i), byte(i * 7)}
		}
		root := m.Root(leaves)
		for i := 0; i < n; i++ {
			path, err := m.Path(leaves, i)
			if err != nil {
				t.Fatalf("n=%d i=%d path: %v", n, i, err)
			}
			if !m.Verify(leaves[i], path, root, i) {
				t.Fatalf("n=%d i=%d verify failed", n, i)
			}
			tampered := append([]byte(nil), leaves[i]...)
			tampered = append(tampered, 0xFF)
			if m.Verify(tampered, path, root, i) {
				t.Fatalf("n=%d i=%d tampered leaf verified", n, i)
			}
		}
	}
}

func TestPathOutOfRange(t *testing.T) {
	m := New()
	leaves := [][]byte{[]byte("a"), []byte("b")}
	if _, err := m.Path(leaves, 5); err == nil {
		t.Fatal("expected out of range error")
	}
}
