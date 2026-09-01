package store

import (
	"errors"

	storedb "github.com/babit/nal/db/sqlc"
	"github.com/babit/nal/internal/ports"
	"github.com/jackc/pgx/v5/pgtype"
	"google.golang.org/protobuf/types/known/timestamppb"
)

var ErrNotFound = errors.New("not found")

type Store struct {
	q *storedb.Queries
}

func New(q *storedb.Queries) *Store {
	return &Store{q: q}
}

func (s *Store) Events() ports.EventStore {
	return &eventStore{q: s.q}
}

func (s *Store) Grants() ports.GrantStore {
	return &grantStore{q: s.q}
}

func (s *Store) Sessions() ports.SessionStore {
	return &sessionStore{q: s.q}
}

func toTimestamptz(ts *timestamppb.Timestamp) pgtype.Timestamptz {
	if ts == nil {
		return pgtype.Timestamptz{}
	}
	return pgtype.Timestamptz{Time: ts.AsTime(), Valid: true}
}

func fromTimestamptz(ts pgtype.Timestamptz) *timestamppb.Timestamp {
	if !ts.Valid {
		return nil
	}
	return timestamppb.New(ts.Time)
}
