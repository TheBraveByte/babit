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

func (generator) New() string {
	var b [8]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	return "BAL-" + hex.EncodeToString(b[:])
}
