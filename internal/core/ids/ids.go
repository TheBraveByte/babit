package ids

import (
	"github.com/babit/nal/internal/ports"
	"github.com/google/uuid"
)

type generator struct{}

func New() ports.IDGen {
	return generator{}
}

func (generator) New(prefix string) string {
	return prefix + "_" + uuid.NewString()
}
