package anchor

import (
	"context"
	"encoding/hex"
	"fmt"
	"sync"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/ports"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type inMemory struct {
	mu      sync.RWMutex
	clock   ports.Clock
	entries map[int64]*ledgerv1.Anchor
}

func NewInMemory(clock ports.Clock) ports.Anchor {
	return &inMemory{clock: clock, entries: make(map[int64]*ledgerv1.Anchor)}
}

func (a *inMemory) Anchor(ctx context.Context, sequence int64, root []byte) (*ledgerv1.Anchor, error) {
	a.mu.Lock()
	defer a.mu.Unlock()
	receipt := []byte("txl:" + hex.EncodeToString(root))
	anchor := &ledgerv1.Anchor{
		Kind:          ledgerv1.Anchor_KIND_TRANSPARENCY_LOG,
		Root:          root,
		AnchorReceipt: receipt,
		AnchoredAt:    timestamppb.New(a.clock.Now()),
	}
	a.entries[sequence] = anchor
	return anchor, nil
}

func (a *inMemory) Get(ctx context.Context, sequence int64) (*ledgerv1.Anchor, error) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	anchor, ok := a.entries[sequence]
	if !ok {
		return nil, fmt.Errorf("anchor for sequence %d not found", sequence)
	}
	return anchor, nil
}
