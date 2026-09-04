package service

import (
	"context"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/sign"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
)

type NotaryCore struct {
	events ports.EventStore
	sealer ports.Sealer
	merkle ports.MerkleTree
	anchor ports.Anchor
}

func NewNotaryCore(events ports.EventStore, sealer ports.Sealer, merkle ports.MerkleTree, anchor ports.Anchor) *NotaryCore {
	return &NotaryCore{events: events, sealer: sealer, merkle: merkle, anchor: anchor}
}

func (n *NotaryCore) Notarize(ctx context.Context, draft *ledgerv1.ActionEvent) (*ledgerv1.ActionEvent, error) {
	prev, err := n.events.Last(ctx, draft.GetSessionId())
	if err != nil {
		prev = nil
	}
	sealed, err := n.sealer.Seal(draft, prev)
	if err != nil {
		return nil, err
	}
	if err := n.events.Append(ctx, sealed); err != nil {
		return nil, err
	}
	if _, err := n.Checkpoint(ctx, sealed.GetSessionId()); err != nil {
		return nil, err
	}
	return sealed, nil
}

func (n *NotaryCore) Checkpoint(ctx context.Context, sessionID string) (*ledgerv1.Anchor, error) {
	events, err := n.events.BySession(ctx, sessionID)
	if err != nil {
		return nil, err
	}
	leaves := make([][]byte, len(events))
	for i, e := range events {
		leaves[i] = e.GetContentHash()
	}
	root := n.merkle.Root(leaves)
	return n.anchor.Anchor(ctx, sessionID, root)
}

type Notary struct {
	ledgerv1.UnimplementedNotaryServiceServer
	core     ports.Notarizer
	anchor   ports.Anchor
	signer   ports.Signer
	sessions ports.SessionStore
	projects ports.ProjectStore
}

func NewNotary(core ports.Notarizer, anchor ports.Anchor, signer ports.Signer, sessions ports.SessionStore, projects ports.ProjectStore) *Notary {
	return &Notary{core: core, anchor: anchor, signer: signer, sessions: sessions, projects: projects}
}

func (s *Notary) Notarize(ctx context.Context, req *ledgerv1.NotarizeRequest) (*ledgerv1.NotarizeResponse, error) {
	if err := ensureProjectAccess(ctx, req.GetEvent().GetProjectId(), s.projects); err != nil {
		return nil, err
	}
	sealed, err := s.core.Notarize(ctx, req.GetEvent())
	if err != nil {
		return nil, err
	}
	return &ledgerv1.NotarizeResponse{Event: sealed}, nil
}

func (s *Notary) GetAnchor(ctx context.Context, req *ledgerv1.GetAnchorRequest) (*ledgerv1.GetAnchorResponse, error) {
	session, err := s.sessions.Get(ctx, req.GetSessionId())
	if err != nil {
		return nil, err
	}
	if err := ensureProjectAccess(ctx, session.GetProjectId(), s.projects); err != nil {
		return nil, err
	}
	a, err := s.anchor.Get(ctx, req.GetSessionId())
	if err != nil {
		return nil, err
	}
	return &ledgerv1.GetAnchorResponse{Anchor: a}, nil
}

func (s *Notary) GetPublicKey(ctx context.Context, req *ledgerv1.GetPublicKeyRequest) (*ledgerv1.GetPublicKeyResponse, error) {
	_ = ctx
	_ = req
	pub, ok := s.signer.PublicKey(sign.DefaultKeyID)
	if !ok {
		return nil, errs.New(errs.Internal, "notary public key unavailable")
	}
	return &ledgerv1.GetPublicKeyResponse{KeyId: sign.DefaultKeyID, PublicKey: pub}, nil
}
