package service

import (
	"context"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/auth"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
)

type AnalyticsSvc struct {
	ledgerv1.UnimplementedAnalyticsServiceServer
	store ports.AnalyticsStore
}

func NewAnalyticsService(store ports.AnalyticsStore) *AnalyticsSvc {
	return &AnalyticsSvc{store: store}
}

func (s *AnalyticsSvc) GetOverview(ctx context.Context, req *ledgerv1.GetOverviewRequest) (*ledgerv1.GetOverviewResponse, error) {
	if auth.UserID(ctx) == "" {
		return nil, errs.New(errs.Unauthenticated, "not authenticated")
	}
	o, err := s.store.Overview(ctx, req.GetDays())
	if err != nil {
		return nil, err
	}
	resp := &ledgerv1.GetOverviewResponse{
		TotalEvents:   o.TotalEvents,
		TotalSessions: o.TotalSessions,
		TotalGrants:   o.TotalGrants,
		RevokedGrants: o.RevokedGrants,
	}
	for _, sc := range o.BySurface {
		resp.BySurface = append(resp.BySurface, &ledgerv1.SurfaceCount{
			Surface: surfaceName(sc.Surface),
			Count:   sc.Count,
		})
	}
	for _, dc := range o.OverTime {
		resp.OverTime = append(resp.OverTime, &ledgerv1.DayCount{
			Date:  dc.Day.Format("2006-01-02"),
			Count: dc.Count,
		})
	}
	return resp, nil
}

func surfaceName(v int32) string {
	switch ledgerv1.Surface(v) {
	case ledgerv1.Surface_SURFACE_BROWSER:
		return "browser"
	case ledgerv1.Surface_SURFACE_SANDBOX:
		return "sandbox"
	case ledgerv1.Surface_SURFACE_DESKTOP:
		return "desktop"
	default:
		return "unspecified"
	}
}
