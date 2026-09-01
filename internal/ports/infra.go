package ports

import (
	"context"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
)

type Anchor interface {
	Anchor(ctx context.Context, sessionID string, root []byte) (*ledgerv1.Anchor, error)
	Get(ctx context.Context, sessionID string) (*ledgerv1.Anchor, error)
}

type Solari interface {
	Recording(ctx context.Context, ref string) ([]byte, error)
}

type Clock interface {
	Now() time.Time
}

type IDGen interface {
	New() string
}
