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

// Overview returns aggregates scoped to the authenticated user (from ctx).
func (s *analyticsStore) Overview(ctx context.Context, days int32) (*ports.Overview, error) {
	if days <= 0 {
		days = 14
	}
	uid := ctxUserUUID(ctx)
	o := &ports.Overview{}
	var err error
	if o.TotalEvents, err = s.q.CountEventsByUser(ctx, uid); err != nil {
		return nil, opErr(err, "count events")
	}
	if o.TotalSessions, err = s.q.CountSessionsByUser(ctx, uid); err != nil {
		return nil, opErr(err, "count sessions")
	}
	if o.TotalGrants, err = s.q.CountGrantsByUser(ctx, uid); err != nil {
		return nil, opErr(err, "count grants")
	}
	if o.RevokedGrants, err = s.q.CountRevocationsByUser(ctx, uid); err != nil {
		return nil, opErr(err, "count revocations")
	}
	surfaces, err := s.q.EventsBySurfaceForUser(ctx, uid)
	if err != nil {
		return nil, opErr(err, "events by surface")
	}
	for _, r := range surfaces {
		o.BySurface = append(o.BySurface, ports.SurfaceCount{Surface: r.Surface, Count: r.N})
	}
	daily, err := s.q.EventsByDayForUser(ctx, storedb.EventsByDayForUserParams{UserID: uid, Column2: days})
	if err != nil {
		return nil, opErr(err, "events by day")
	}
	for _, r := range daily {
		o.OverTime = append(o.OverTime, ports.DayCount{Day: r.Day.Time, Count: r.N})
	}
	links, err := s.q.TopRecordingRefsForUser(ctx, storedb.TopRecordingRefsForUserParams{UserID: uid, Column2: days, Limit: 10})
	if err != nil {
		return nil, opErr(err, "top recording refs")
	}
	for _, r := range links {
		o.TopLinks = append(o.TopLinks, ports.TopLink{URL: r.Url, Count: r.N})
	}
	return o, nil
}
