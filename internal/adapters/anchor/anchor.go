package anchor

import (
	"context"
	"encoding/hex"
	"sync"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type inMemory struct {
	mu      sync.RWMutex
	clock   ports.Clock
	entries map[string]*ledgerv1.Anchor
}

func NewInMemory(clock ports.Clock) ports.Anchor {
	return &inMemory{clock: clock, entries: make(map[string]*ledgerv1.Anchor)}
}

func (a *inMemory) Anchor(ctx context.Context, sessionID string, root []byte) (*ledgerv1.Anchor, error) {
	a.mu.Lock()
	defer a.mu.Unlock()
	anchor := &ledgerv1.Anchor{
		Kind:          ledgerv1.Anchor_KIND_TRANSPARENCY_LOG,
		Root:          root,
		AnchorReceipt: []byte("txl:" + hex.EncodeToString(root)),
		AnchoredAt:    timestamppb.New(a.clock.Now()),
	}
	a.entries[sessionID] = anchor
	return anchor, nil
}

func (a *inMemory) Get(ctx context.Context, sessionID string) (*ledgerv1.Anchor, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	anchor, ok := a.entries[sessionID]
	if !ok {
		return nil, errs.New(errs.NotFound, "anchor for session %s not found", sessionID)
	}
	return anchor, nil
}
