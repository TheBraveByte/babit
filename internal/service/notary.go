package service

import (
	"context"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/ports"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type NotaryCore struct {
	events ports.EventStore
	sealer ports.Sealer
}

func NewNotaryCore(events ports.EventStore, sealer ports.Sealer) *NotaryCore {
	return &NotaryCore{events: events, sealer: sealer}
}

func (n *NotaryCore) Notarize(ctx context.Context, draft *ledgerv1.ActionEvent) (*ledgerv1.ActionEvent, error) {
	prev, err := n.events.Last(ctx, draft.GetSessionId())
	if err != nil {
		prev = nil
	}
	sealed, err := n.sealer.Seal(draft, prev)
	if err != nil {
		return nil, err
	}
	if err := n.events.Append(ctx, sealed); err != nil {
		return nil, err
	}
	return sealed, nil
}

type Notary struct {
	ledgerv1.UnimplementedNotaryServiceServer
	core   ports.Notarizer
	anchor ports.Anchor
}

func NewNotary(core ports.Notarizer, anchor ports.Anchor) *Notary {
	return &Notary{core: core, anchor: anchor}
}

func (s *Notary) Notarize(ctx context.Context, req *ledgerv1.NotarizeRequest) (*ledgerv1.NotarizeResponse, error) {
	sealed, err := s.core.Notarize(ctx, req.GetEvent())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "notarize: %v", err)
	}
	return &ledgerv1.NotarizeResponse{Event: sealed}, nil
}

func (s *Notary) GetAnchor(ctx context.Context, req *ledgerv1.GetAnchorRequest) (*ledgerv1.GetAnchorResponse, error) {
	a, err := s.anchor.Get(ctx, req.GetSequence())
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "anchor: %v", err)
	}
	return &ledgerv1.GetAnchorResponse{Anchor: a}, nil
}
