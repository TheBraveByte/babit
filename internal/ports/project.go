package ports

import (
	"context"
	"time"
)

type Project struct {
	ID         string
	Name       string
	ActiveKeys int64
	CreatedAt  time.Time
}

type APIKey struct {
	ID        string
	ProjectID string
	UserID    string
	Name      string
	Prefix    string
	Last4     string
	Revoked   bool
	CreatedAt time.Time
}

type APIKeyCreate struct {
	ProjectID string
	UserID    string
	Name      string
	Prefix    string
	Last4     string
	KeyHash   string
}

type ProjectStore interface {
	Create(ctx context.Context, userID, name string) (*Project, error)
	ListByUser(ctx context.Context, userID string, pageSize int32, pageToken string) ([]*Project, string, error)
	GetForUser(ctx context.Context, id, userID string) (*Project, error)
}

type APIKeyStore interface {
	Create(ctx context.Context, in APIKeyCreate) (*APIKey, error)
	ListByProject(ctx context.Context, projectID string, pageSize int32, pageToken string) ([]*APIKey, string, error)
	GetByHash(ctx context.Context, keyHash string) (*APIKey, error)
	Revoke(ctx context.Context, id, userID string) (bool, error)
}
