package store

import (
	"context"
	"errors"

	storedb "github.com/babit/nal/db/sqlc"
	coreauth "github.com/babit/nal/internal/core/auth"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"google.golang.org/protobuf/types/known/timestamppb"
)

func ctxUserUUID(ctx context.Context) pgtype.UUID {
	var id pgtype.UUID
	if uid := coreauth.UserID(ctx); uid != "" {
		_ = id.Scan(uid)
	}
	return id
}

func toUUID(s string) pgtype.UUID {
	var id pgtype.UUID
	if s != "" {
		_ = id.Scan(s)
	}
	return id
}

func lookupErr(err error, entity, id string) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return errs.New(errs.NotFound, "%s %s not found", entity, id)
	}
	return errs.Wrap(errs.Internal, err, "%s %s", entity, id)
}

func opErr(err error, op string) error {
	return errs.Wrap(errs.Internal, err, "%s", op)
}

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
