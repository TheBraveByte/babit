package clock

import (
	"testing"
	"time"
)

func TestSystemNow(t *testing.T) {
	c := System()
	before := time.Now()
	got := c.Now()
	after := time.Now()
	if got.Before(before) || got.After(after) {
		t.Fatalf("now %v outside [%v, %v]", got, before, after)
	}
}
