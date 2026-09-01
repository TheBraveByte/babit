package ids

import (
	"crypto/rand"
	"encoding/hex"

	"github.com/babit/nal/internal/ports"
)

type generator struct{}

func New() ports.IDGen {
	return generator{}
}

func (generator) New(prefix string) string {
	var b [6]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	return prefix + "_" + hex.EncodeToString(b[:])
}
