package ids

import (
	"crypto/rand"
	"encoding/binary"
	"fmt"

	"github.com/babit/nal/internal/ports"
)

type generator struct{}

func New() ports.IDGen {
	return generator{}
}

func (generator) New() string {
	var b [4]byte
	if _, err := rand.Read(b[:]); err != nil {
		panic(err)
	}
	return fmt.Sprintf("BAL-%06d", binary.BigEndian.Uint32(b[:])%1000000)
}
