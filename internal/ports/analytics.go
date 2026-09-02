package ports

import (
	"context"
	"time"
)

type SurfaceCount struct {
	Surface int32
	Count   int64
}

type DayCount struct {
	Day   time.Time
	Count int64
}

type Overview struct {
	TotalEvents   int64
	TotalSessions int64
	TotalGrants   int64
	RevokedGrants int64
	BySurface     []SurfaceCount
	OverTime      []DayCount
}

type AnalyticsStore interface {
	Overview(ctx context.Context, days int32) (*Overview, error)
}
