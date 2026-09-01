package store

import (
	"context"
	"errors"

	storedb "github.com/babit/nal/db/sqlc"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"
)

type userStore struct {
	q *storedb.Queries
}

func (s *Store) Users() ports.UserStore {
	return &userStore{q: s.q}
}

func (s *userStore) Create(ctx context.Context, u *ports.User) (*ports.User, error) {
	row, err := s.q.CreateUser(ctx, storedb.CreateUserParams{
		Email:        u.Email,
		PasswordHash: u.PasswordHash,
		AccountType:  u.AccountType,
		OrgName:      u.OrgName,
		OrgDomain:    u.OrgDomain,
		Industry:     u.Industry,
		BrandCompany: u.BrandCompany,
		BrandLogoUrl: u.BrandLogoURL,
		BrandColor:   u.BrandColor,
	})
	if err != nil {
		var pg *pgconn.PgError
		if errors.As(err, &pg) && pg.Code == "23505" {
			return nil, errs.New(errs.FailedPrecondition, "email already registered")
		}
		return nil, opErr(err, "create user")
	}
	return userFromRow(row), nil
}

func (s *userStore) GetByEmail(ctx context.Context, email string) (*ports.User, error) {
	row, err := s.q.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, lookupErr(err, "user", email)
	}
	return userFromRow(row), nil
}

func (s *userStore) GetByID(ctx context.Context, id string) (*ports.User, error) {
	var uid pgtype.UUID
	if err := uid.Scan(id); err != nil {
		return nil, errs.New(errs.NotFound, "user %s not found", id)
	}
	row, err := s.q.GetUserByID(ctx, uid)
	if err != nil {
		return nil, lookupErr(err, "user", id)
	}
	return userFromRow(row), nil
}

func userFromRow(r storedb.User) *ports.User {
	return &ports.User{
		ID:           uuidString(r.ID),
		Email:        r.Email,
		PasswordHash: r.PasswordHash,
		AccountType:  r.AccountType,
		OrgName:      r.OrgName,
		OrgDomain:    r.OrgDomain,
		Industry:     r.Industry,
		BrandCompany: r.BrandCompany,
		BrandLogoURL: r.BrandLogoUrl,
		BrandColor:   r.BrandColor,
		CreatedAt:    r.CreatedAt.Time,
	}
}

func uuidString(u pgtype.UUID) string {
	v, err := u.Value()
	if err != nil || v == nil {
		return ""
	}
	s, _ := v.(string)
	return s
}
