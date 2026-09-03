package service

import (
	"context"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/auth"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
)

type Ledger struct {
	ledgerv1.UnimplementedLedgerServiceServer
	events ports.EventStore
	grants ports.GrantStore
	merkle ports.MerkleTree
	anchor ports.Anchor
}

func NewLedger(events ports.EventStore, grants ports.GrantStore, merkle ports.MerkleTree, anchor ports.Anchor) *Ledger {
	return &Ledger{events: events, grants: grants, merkle: merkle, anchor: anchor}
}

func (l *Ledger) GetEvent(ctx context.Context, req *ledgerv1.GetEventRequest) (*ledgerv1.GetEventResponse, error) {
	ev, err := l.events.Get(ctx, req.GetEventId())
	if err != nil {
		return nil, err
	}
	return &ledgerv1.GetEventResponse{Event: ev}, nil
}

func (l *Ledger) GetInclusionProof(ctx context.Context, req *ledgerv1.GetInclusionProofRequest) (*ledgerv1.GetInclusionProofResponse, error) {
	ev, err := l.events.Get(ctx, req.GetEventId())
	if err != nil {
		return nil, err
	}
	events, err := l.events.BySession(ctx, ev.GetSessionId())
	if err != nil {
		return nil, err
	}
	leaves := make([][]byte, len(events))
	for i, e := range events {
		leaves[i] = e.GetContentHash()
	}
	index := int(ev.GetSequence() - 1)
	root := l.merkle.Root(leaves)
	path, err := l.merkle.Path(leaves, index)
	if err != nil {
		return nil, errs.Wrap(errs.Internal, err, "merkle path")
	}
	var anchor *ledgerv1.Anchor
	if a, aerr := l.anchor.Get(ctx, ev.GetSessionId()); aerr == nil {
		anchor = a
	}
	var chain []*ledgerv1.Grant
	if c, cerr := l.grants.Chain(ctx, ev.GetGrantId()); cerr == nil {
		chain = c
	}
	proof := &ledgerv1.Proof{
		Event:           ev,
		MerklePath:      path,
		MerkleRoot:      root,
		Anchor:          anchor,
		DelegationChain: chain,
	}
	return &ledgerv1.GetInclusionProofResponse{Proof: proof}, nil
}

func (l *Ledger) ListEvents(ctx context.Context, req *ledgerv1.ListEventsRequest) (*ledgerv1.ListEventsResponse, error) {
	if auth.UserID(ctx) == "" {
		return nil, errs.New(errs.Unauthenticated, "not authenticated")
	}
	events, next, err := l.events.List(ctx, req.GetPageSize(), req.GetPageToken())
	if err != nil {
		return nil, err
	}
	return &ledgerv1.ListEventsResponse{Events: events, NextPageToken: next}, nil
}
