package store

import (
	"context"
	"encoding/hex"
	"errors"
	"time"

	storedb "github.com/babit/nal/db/sqlc"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
	"github.com/jackc/pgx/v5"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type anchorStore struct {
	q *storedb.Queries
}

func (s *Store) Anchor() ports.Anchor {
	return &anchorStore{q: s.q}
}

func (s *anchorStore) Anchor(ctx context.Context, sessionID string, root []byte) (*ledgerv1.Anchor, error) {
	a := &ledgerv1.Anchor{
		Kind:          ledgerv1.Anchor_KIND_TRANSPARENCY_LOG,
		Root:          root,
		AnchorReceipt: []byte("txl:" + hex.EncodeToString(root)),
		AnchoredAt:    timestamppb.New(time.Now()),
	}
	if err := s.q.UpsertAnchor(ctx, storedb.UpsertAnchorParams{
		SessionID:     sessionID,
		Kind:          a.GetKind().String(),
		Root:          a.GetRoot(),
		AnchorReceipt: a.GetAnchorReceipt(),
		AnchoredAt:    toTimestamptz(a.GetAnchoredAt()),
	}); err != nil {
		return nil, opErr(err, "anchor session")
	}
	return a, nil
}

func (s *anchorStore) Get(ctx context.Context, sessionID string) (*ledgerv1.Anchor, error) {
	row, err := s.q.GetAnchor(ctx, sessionID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, errs.New(errs.NotFound, "anchor for session %s not found", sessionID)
		}
		return nil, opErr(err, "get anchor")
	}
	kind, ok := anchorKind(row.Kind)
	if !ok {
		kind = ledgerv1.Anchor_KIND_TRANSPARENCY_LOG
	}
	return &ledgerv1.Anchor{
		Kind:          kind,
		Root:          row.Root,
		AnchorReceipt: row.AnchorReceipt,
		AnchoredAt:    fromTimestamptz(row.AnchoredAt),
	}, nil
}

func anchorKind(s string) (ledgerv1.Anchor_Kind, bool) {
	switch s {
	case ledgerv1.Anchor_KIND_UNSPECIFIED.String():
		return ledgerv1.Anchor_KIND_UNSPECIFIED, true
	case ledgerv1.Anchor_KIND_RFC3161_TSA.String():
		return ledgerv1.Anchor_KIND_RFC3161_TSA, true
	case ledgerv1.Anchor_KIND_TRANSPARENCY_LOG.String():
		return ledgerv1.Anchor_KIND_TRANSPARENCY_LOG, true
	case ledgerv1.Anchor_KIND_PUBLIC_CHAIN.String():
		return ledgerv1.Anchor_KIND_PUBLIC_CHAIN, true
	}
	return ledgerv1.Anchor_KIND_UNSPECIFIED, false
}
