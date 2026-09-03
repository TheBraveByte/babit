package store

import (
	"context"
	"time"

	storedb "github.com/babit/nal/db/sqlc"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/pagination"
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
		UserID:      ctxUserUUID(ctx),
	}); err != nil {
		return opErr(err, "create session")
	}
	return nil
}

func (s *sessionStore) Get(ctx context.Context, sessionID string) (*ledgerv1.Session, error) {
	row, err := s.q.GetSession(ctx, sessionID)
	if err != nil {
		return nil, lookupErr(err, "session", sessionID)
	}
	return sessionFromRow(row), nil
}

func (s *sessionStore) End(ctx context.Context, sessionID string, at time.Time) (*ledgerv1.Session, error) {
	row, err := s.q.EndSession(ctx, storedb.EndSessionParams{
		SessionID: sessionID,
		EndedAt:   pgtype.Timestamptz{Time: at, Valid: true},
	})
	if err != nil {
		return nil, lookupErr(err, "session", sessionID)
	}
	return sessionFromRow(row), nil
}

func (s *sessionStore) NextSequence(ctx context.Context, sessionID string) (int64, error) {
	seq, err := s.q.NextSequence(ctx, sessionID)
	if err != nil {
		return 0, lookupErr(err, "session", sessionID)
	}
	return seq, nil
}

func (s *sessionStore) List(ctx context.Context, pageSize int32, pageToken string) ([]*ledgerv1.Session, string, error) {
	pageSize = pagination.ClampPageSize(pageSize, 100)
	cur, err := pagination.Decode(pageToken)
	if err != nil {
		return nil, "", opErr(err, "list sessions")
	}
	rows, err := s.q.ListSessionsByUser(ctx, storedb.ListSessionsByUserParams{
		UserID:  ctxUserUUID(ctx),
		Column2: cur.Value,
		Limit:   pageSize + 1,
	})
	if err != nil {
		return nil, "", opErr(err, "list sessions")
	}
	var next string
	if len(rows) > int(pageSize) {
		next = pagination.Cursor{Value: rows[pageSize-1].SessionID}.Encode()
		rows = rows[:pageSize]
	}
	out := make([]*ledgerv1.Session, 0, len(rows))
	for _, row := range rows {
		out = append(out, sessionFromRow(row))
	}
	return out, next, nil
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
