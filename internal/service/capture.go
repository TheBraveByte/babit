package service

import (
	"context"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/ports"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type Capture struct {
	ledgerv1.UnimplementedCaptureServiceServer
	sessions   ports.SessionStore
	grants     ports.GrantStore
	verifier   ports.DelegationVerifier
	notary     ports.Notarizer
	checkpoint ports.Checkpointer
	ids        ports.IDGen
	clock      ports.Clock
}

func NewCapture(sessions ports.SessionStore, grants ports.GrantStore, verifier ports.DelegationVerifier, notary ports.Notarizer, checkpoint ports.Checkpointer, ids ports.IDGen, clock ports.Clock) *Capture {
	return &Capture{sessions: sessions, grants: grants, verifier: verifier, notary: notary, checkpoint: checkpoint, ids: ids, clock: clock}
}

func (c *Capture) BeginSession(ctx context.Context, req *ledgerv1.BeginSessionRequest) (*ledgerv1.BeginSessionResponse, error) {
	s := &ledgerv1.Session{
		SessionId:   c.ids.New("ses"),
		RootGrantId: req.GetRootGrantId(),
		Surface:     req.GetSurface(),
		StartedAt:   timestamppb.New(c.clock.Now()),
	}
	if err := c.sessions.Create(ctx, s); err != nil {
		return nil, status.Errorf(codes.Internal, "create session: %v", err)
	}
	return &ledgerv1.BeginSessionResponse{Session: s}, nil
}

func (c *Capture) RecordAction(ctx context.Context, req *ledgerv1.RecordActionRequest) (*ledgerv1.RecordActionResponse, error) {
	session, err := c.sessions.Get(ctx, req.GetSessionId())
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "session: %v", err)
	}
	chain, err := c.grants.Chain(ctx, req.GetGrantId())
	if err != nil {
		return nil, status.Errorf(codes.NotFound, "grant chain: %v", err)
	}
	if err := c.verifier.VerifyChain(chain, c.clock.Now()); err != nil {
		return nil, status.Errorf(codes.PermissionDenied, "verify chain: %v", err)
	}
	if err := c.ensureNotRevoked(ctx, chain); err != nil {
		return nil, err
	}
	leaf := chain[len(chain)-1]
	if !hasCapability(leaf, req.GetActionType()) {
		return nil, status.Errorf(codes.PermissionDenied, "capability %q not granted", req.GetActionType())
	}
	seq, err := c.sessions.NextSequence(ctx, req.GetSessionId())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "next sequence: %v", err)
	}
	draft := &ledgerv1.ActionEvent{
		EventId:       c.ids.New("evt"),
		SessionId:     req.GetSessionId(),
		Sequence:      seq,
		Surface:       session.GetSurface(),
		ActionType:    req.GetActionType(),
		ActionPayload: req.GetActionPayload(),
		GrantId:       req.GetGrantId(),
		PreStateHash:  req.GetPreStateHash(),
		PostStateHash: req.GetPostStateHash(),
		RecordingRef:  req.GetRecordingRef(),
		OccurredAt:    timestamppb.New(c.clock.Now().Truncate(time.Microsecond)),
	}
	sealed, err := c.notary.Notarize(ctx, draft)
	if err != nil {
		return nil, status.Errorf(codes.Internal, "notarize: %v", err)
	}
	return &ledgerv1.RecordActionResponse{Event: sealed}, nil
}

func (c *Capture) EndSession(ctx context.Context, req *ledgerv1.EndSessionRequest) (*ledgerv1.EndSessionResponse, error) {
	s, err := c.sessions.End(ctx, req.GetSessionId(), c.clock.Now())
	if err != nil {
		return nil, status.Errorf(codes.Internal, "end session: %v", err)
	}
	if _, err := c.checkpoint.Checkpoint(ctx, req.GetSessionId()); err != nil {
		return nil, status.Errorf(codes.Internal, "checkpoint: %v", err)
	}
	return &ledgerv1.EndSessionResponse{Session: s}, nil
}

func (c *Capture) ensureNotRevoked(ctx context.Context, chain []*ledgerv1.Grant) error {
	for _, g := range chain {
		revoked, err := c.grants.IsRevoked(ctx, g.GetGrantId())
		if err != nil {
			return status.Errorf(codes.Internal, "check revocation: %v", err)
		}
		if revoked {
			return status.Errorf(codes.PermissionDenied, "grant %s revoked", g.GetGrantId())
		}
	}
	return nil
}

func hasCapability(g *ledgerv1.Grant, capability string) bool {
	for _, c := range g.GetCapabilities() {
		if c == capability {
			return true
		}
	}
	return false
}
