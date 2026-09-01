package store

import (
	"context"
	"errors"
	"fmt"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	storedb "github.com/babit/nal/db/sqlc"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type sessionStore struct {
	q *storedb.Queries
}

func (s *sessionStore) Create(ctx context.Context, session *ledgerv1.Session) error {
	if err := s.q.CreateSession(ctx, storedb.CreateSessionParams{
		SessionID:   session.SessionId,
		RootGrantID: session.RootGrantId,
		Surface:     int32(session.Surface),
		StartedAt:   toTimestamptz(session.StartedAt),
		EndedAt:     toTimestamptz(session.EndedAt),
		EventCount:  session.EventCount,
	}); err != nil {
		return fmt.Errorf("create session: %w", err)
	}
	return nil
}

func (s *sessionStore) Get(ctx context.Context, sessionID string) (*ledgerv1.Session, error) {
	row, err := s.q.GetSession(ctx, sessionID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("get session %s: %w", sessionID, ErrNotFound)
		}
		return nil, fmt.Errorf("get session: %w", err)
	}
	return sessionFromRow(row), nil
}

func (s *sessionStore) End(ctx context.Context, sessionID string, at time.Time) (*ledgerv1.Session, error) {
	row, err := s.q.EndSession(ctx, storedb.EndSessionParams{
		SessionID: sessionID,
		EndedAt:   pgtype.Timestamptz{Time: at, Valid: true},
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("end session %s: %w", sessionID, ErrNotFound)
		}
		return nil, fmt.Errorf("end session: %w", err)
	}
	return sessionFromRow(row), nil
}

func (s *sessionStore) NextSequence(ctx context.Context, sessionID string) (int64, error) {
	seq, err := s.q.NextSequence(ctx, sessionID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return 0, fmt.Errorf("next sequence %s: %w", sessionID, ErrNotFound)
		}
		return 0, fmt.Errorf("next sequence: %w", err)
	}
	return seq, nil
}

func sessionFromRow(row storedb.Session) *ledgerv1.Session {
	return &ledgerv1.Session{
		SessionId:   row.SessionID,
		RootGrantId: row.RootGrantID,
		Surface:     ledgerv1.Surface(row.Surface),
		StartedAt:   fromTimestamptz(row.StartedAt),
		EndedAt:     fromTimestamptz(row.EndedAt),
		EventCount:  row.EventCount,
	}
}
