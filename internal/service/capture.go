package service

import (
	"context"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/auth"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
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
	grant, err := c.grants.Get(ctx, req.GetRootGrantId())
	if err != nil {
		return nil, err
	}
	s := &ledgerv1.Session{
		SessionId:   c.ids.New(),
		ProjectId:   grant.GetProjectId(),
		RootGrantId: req.GetRootGrantId(),
		Surface:     req.GetSurface(),
		StartedAt:   timestamppb.New(c.clock.Now()),
	}
	if err := c.sessions.Create(ctx, s); err != nil {
		return nil, err
	}
	return &ledgerv1.BeginSessionResponse{Session: s}, nil
}

func (c *Capture) RecordAction(ctx context.Context, req *ledgerv1.RecordActionRequest) (*ledgerv1.RecordActionResponse, error) {
	session, err := c.sessions.Get(ctx, req.GetSessionId())
	if err != nil {
		return nil, err
	}
	chain, err := c.grants.Chain(ctx, req.GetGrantId())
	if err != nil {
		return nil, err
	}
	if err := c.verifier.VerifyChain(chain, c.clock.Now()); err != nil {
		return nil, errs.Wrap(errs.PermissionDenied, err, "verify chain")
	}
	if err := c.ensureNotRevoked(ctx, chain); err != nil {
		return nil, err
	}
	leaf := chain[len(chain)-1]
	if err := c.verifier.Authorizes(leaf, req.GetActionType(), req.GetResource(), req.GetValueCents()); err != nil {
		return nil, errs.Wrap(errs.PermissionDenied, err, "authorize")
	}
	seq, err := c.sessions.NextSequence(ctx, req.GetSessionId())
	if err != nil {
		return nil, err
	}
	draft := &ledgerv1.ActionEvent{
		EventId:       c.ids.New(),
		ProjectId:     session.GetProjectId(),
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
		return nil, err
	}
	return &ledgerv1.RecordActionResponse{Event: sealed}, nil
}

func (c *Capture) EndSession(ctx context.Context, req *ledgerv1.EndSessionRequest) (*ledgerv1.EndSessionResponse, error) {
	s, err := c.sessions.End(ctx, req.GetSessionId(), c.clock.Now())
	if err != nil {
		return nil, err
	}
	if _, err := c.checkpoint.Checkpoint(ctx, req.GetSessionId()); err != nil {
		return nil, err
	}
	return &ledgerv1.EndSessionResponse{Session: s}, nil
}

func (c *Capture) ensureNotRevoked(ctx context.Context, chain []*ledgerv1.Grant) error {
	for _, g := range chain {
		revoked, err := c.grants.IsRevoked(ctx, g.GetGrantId())
		if err != nil {
			return err
		}
		if revoked {
			return errs.New(errs.PermissionDenied, "grant %s revoked", g.GetGrantId())
		}
	}
	return nil
}

func (c *Capture) ListSessions(ctx context.Context, req *ledgerv1.ListSessionsRequest) (*ledgerv1.ListSessionsResponse, error) {
	if auth.UserID(ctx) == "" {
		return nil, errs.New(errs.Unauthenticated, "not authenticated")
	}
	sessions, next, err := c.sessions.List(ctx, req.GetProjectId(), req.GetPageSize(), req.GetPageToken())
	if err != nil {
		return nil, err
	}
	return &ledgerv1.ListSessionsResponse{Sessions: sessions, NextPageToken: next}, nil
}
