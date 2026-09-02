package store

import (
	"context"
	"errors"

	storedb "github.com/babit/nal/db/sqlc"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func parseUUID(s string) (pgtype.UUID, error) {
	var id pgtype.UUID
	if err := id.Scan(s); err != nil {
		return id, errs.New(errs.Invalid, "invalid id %q", s)
	}
	return id, nil
}

type projectStore struct {
	q *storedb.Queries
}

func (s *Store) Projects() ports.ProjectStore {
	return &projectStore{q: s.q}
}

func (s *projectStore) Create(ctx context.Context, userID, name string) (*ports.Project, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	row, err := s.q.CreateProject(ctx, storedb.CreateProjectParams{UserID: uid, Name: name})
	if err != nil {
		return nil, opErr(err, "create project")
	}
	return &ports.Project{ID: uuidString(row.ID), Name: row.Name, CreatedAt: row.CreatedAt.Time}, nil
}

func (s *projectStore) ListByUser(ctx context.Context, userID string) ([]*ports.Project, error) {
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	rows, err := s.q.ListProjectsByUser(ctx, uid)
	if err != nil {
		return nil, opErr(err, "list projects")
	}
	out := make([]*ports.Project, 0, len(rows))
	for _, r := range rows {
		out = append(out, &ports.Project{
			ID:         uuidString(r.ID),
			Name:       r.Name,
			ActiveKeys: r.ActiveKeys,
			CreatedAt:  r.CreatedAt.Time,
		})
	}
	return out, nil
}

func (s *projectStore) GetForUser(ctx context.Context, id, userID string) (*ports.Project, error) {
	pid, err := parseUUID(id)
	if err != nil {
		return nil, err
	}
	uid, err := parseUUID(userID)
	if err != nil {
		return nil, err
	}
	row, err := s.q.GetProjectForUser(ctx, storedb.GetProjectForUserParams{ID: pid, UserID: uid})
	if err != nil {
		return nil, lookupErr(err, "project", id)
	}
	return &ports.Project{ID: uuidString(row.ID), Name: row.Name, CreatedAt: row.CreatedAt.Time}, nil
}

type apiKeyStore struct {
	q *storedb.Queries
}

func (s *Store) ApiKeys() ports.APIKeyStore {
	return &apiKeyStore{q: s.q}
}

func (s *apiKeyStore) Create(ctx context.Context, in ports.APIKeyCreate) (*ports.APIKey, error) {
	pid, err := parseUUID(in.ProjectID)
	if err != nil {
		return nil, err
	}
	uid, err := parseUUID(in.UserID)
	if err != nil {
		return nil, err
	}
	row, err := s.q.CreateApiKey(ctx, storedb.CreateApiKeyParams{
		ProjectID: pid,
		UserID:    uid,
		Name:      in.Name,
		Prefix:    in.Prefix,
		Last4:     in.Last4,
		KeyHash:   in.KeyHash,
	})
	if err != nil {
		return nil, opErr(err, "create api key")
	}
	return apiKeyFromRow(row), nil
}

func (s *apiKeyStore) ListByProject(ctx context.Context, projectID string) ([]*ports.APIKey, error) {
	pid, err := parseUUID(projectID)
	if err != nil {
		return nil, err
	}
	rows, err := s.q.ListApiKeysByProject(ctx, pid)
	if err != nil {
		return nil, opErr(err, "list api keys")
	}
	out := make([]*ports.APIKey, 0, len(rows))
	for _, r := range rows {
		out = append(out, apiKeyFromRow(r))
	}
	return out, nil
}

func (s *apiKeyStore) GetByHash(ctx context.Context, keyHash string) (*ports.APIKey, error) {
	row, err := s.q.GetApiKeyByHash(ctx, keyHash)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, opErr(err, "lookup api key")
	}
	return apiKeyFromRow(row), nil
}

func (s *apiKeyStore) Revoke(ctx context.Context, id, userID string) (bool, error) {
	kid, err := parseUUID(id)
	if err != nil {
		return false, err
	}
	uid, err := parseUUID(userID)
	if err != nil {
		return false, err
	}
	_, err = s.q.RevokeApiKey(ctx, storedb.RevokeApiKeyParams{ID: kid, UserID: uid})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return false, nil
		}
		return false, opErr(err, "revoke api key")
	}
	return true, nil
}

func apiKeyFromRow(r storedb.ApiKey) *ports.APIKey {
	return &ports.APIKey{
		ID:        uuidString(r.ID),
		ProjectID: uuidString(r.ProjectID),
		UserID:    uuidString(r.UserID),
		Name:      r.Name,
		Prefix:    r.Prefix,
		Last4:     r.Last4,
		Revoked:   r.RevokedAt.Valid,
		CreatedAt: r.CreatedAt.Time,
	}
}
