package store

import (
	"context"

	storedb "github.com/babit/nal/db/sqlc"
	"github.com/babit/nal/internal/ports"
)

type analyticsStore struct {
	q *storedb.Queries
}

func (s *Store) Analytics() ports.AnalyticsStore {
	return &analyticsStore{q: s.q}
}

func (s *analyticsStore) Overview(ctx context.Context, days int32) (*ports.Overview, error) {
	if days <= 0 {
		days = 14
	}
	o := &ports.Overview{}
	var err error
	if o.TotalEvents, err = s.q.CountEvents(ctx); err != nil {
		return nil, opErr(err, "count events")
	}
	if o.TotalSessions, err = s.q.CountSessions(ctx); err != nil {
		return nil, opErr(err, "count sessions")
	}
	if o.TotalGrants, err = s.q.CountGrants(ctx); err != nil {
		return nil, opErr(err, "count grants")
	}
	if o.RevokedGrants, err = s.q.CountRevocations(ctx); err != nil {
		return nil, opErr(err, "count revocations")
	}
	surfaces, err := s.q.EventsBySurface(ctx)
	if err != nil {
		return nil, opErr(err, "events by surface")
	}
	for _, r := range surfaces {
		o.BySurface = append(o.BySurface, ports.SurfaceCount{Surface: r.Surface, Count: r.N})
	}
	daily, err := s.q.EventsByDay(ctx, days)
	if err != nil {
		return nil, opErr(err, "events by day")
	}
	for _, r := range daily {
		o.OverTime = append(o.OverTime, ports.DayCount{Day: r.Day.Time, Count: r.N})
	}
	return o, nil
}
