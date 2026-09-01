package clock

import (
	"time"

	"github.com/babit/nal/internal/ports"
)

type systemClock struct{}

func System() ports.Clock {
	return systemClock{}
}

func (systemClock) Now() time.Time {
	return time.Now()
}
