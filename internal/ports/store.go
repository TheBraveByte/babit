package ports

import (
	"context"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
)

type EventStore interface {
	Append(ctx context.Context, event *ledgerv1.ActionEvent) error
	Get(ctx context.Context, eventID string) (*ledgerv1.ActionEvent, error)
	Last(ctx context.Context, sessionID string) (*ledgerv1.ActionEvent, error)
	BySession(ctx context.Context, sessionID string) ([]*ledgerv1.ActionEvent, error)
	Range(ctx context.Context, fromSeq, toSeq int64) ([]*ledgerv1.ActionEvent, error)
	List(ctx context.Context, limit int32) ([]*ledgerv1.ActionEvent, error)
}

type GrantStore interface {
	Put(ctx context.Context, grant *ledgerv1.Grant) error
	Get(ctx context.Context, grantID string) (*ledgerv1.Grant, error)
	Chain(ctx context.Context, grantID string) ([]*ledgerv1.Grant, error)
	Revoke(ctx context.Context, grantID, reason string) error
	IsRevoked(ctx context.Context, grantID string) (bool, error)
	List(ctx context.Context, limit int32) ([]*ledgerv1.Grant, error)
}

type SessionStore interface {
	Create(ctx context.Context, session *ledgerv1.Session) error
	Get(ctx context.Context, sessionID string) (*ledgerv1.Session, error)
	End(ctx context.Context, sessionID string, at time.Time) (*ledgerv1.Session, error)
	NextSequence(ctx context.Context, sessionID string) (int64, error)
	List(ctx context.Context, limit int32) ([]*ledgerv1.Session, error)
}
