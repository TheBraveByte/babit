package merkle

import (
	"crypto/sha256"
	"fmt"

	"github.com/babit/nal/internal/ports"
)

type tree struct{}

func New() ports.MerkleTree {
	return tree{}
}

func leafHash(data []byte) []byte {
	h := sha256.New()
	h.Write([]byte{0x00})
	h.Write(data)
	return h.Sum(nil)
}

func nodeHash(left, right []byte) []byte {
	h := sha256.New()
	h.Write([]byte{0x01})
	h.Write(left)
	h.Write(right)
	return h.Sum(nil)
}

func (tree) Root(leaves [][]byte) []byte {
	if len(leaves) == 0 {
		return make([]byte, sha256.Size)
	}
	level := make([][]byte, len(leaves))
	for i, l := range leaves {
		level[i] = leafHash(l)
	}
	for len(level) > 1 {
		level = reduce(level)
	}
	return level[0]
}

func reduce(level [][]byte) [][]byte {
	next := make([][]byte, 0, (len(level)+1)/2)
	for i := 0; i < len(level); i += 2 {
		if i+1 < len(level) {
			next = append(next, nodeHash(level[i], level[i+1]))
		} else {
			next = append(next, nodeHash(level[i], level[i]))
		}
	}
	return next
}

func (tree) Path(leaves [][]byte, index int) ([][]byte, error) {
	if index < 0 || index >= len(leaves) {
		return nil, fmt.Errorf("build path: %w", fmt.Errorf("index %d out of range %d", index, len(leaves)))
	}
	level := make([][]byte, len(leaves))
	for i, l := range leaves {
		level[i] = leafHash(l)
	}
	var path [][]byte
	idx := index
	for len(level) > 1 {
		var sibling []byte
		if idx%2 == 0 {
			if idx+1 < len(level) {
				sibling = level[idx+1]
			} else {
				sibling = level[idx]
			}
		} else {
			sibling = level[idx-1]
		}
		path = append(path, append([]byte(nil), sibling...))
		level = reduce(level)
		idx /= 2
	}
	return path, nil
}

func (tree) Verify(leaf []byte, path [][]byte, root []byte, index int) bool {
	cur := leafHash(leaf)
	idx := index
	for _, sib := range path {
		if idx%2 == 0 {
			cur = nodeHash(cur, sib)
		} else {
			cur = nodeHash(sib, cur)
		}
		idx /= 2
	}
	if len(cur) != len(root) {
		return false
	}
	for i := range cur {
		if cur[i] != root[i] {
			return false
		}
	}
	return true
}
