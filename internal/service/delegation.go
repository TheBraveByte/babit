package service

import (
	"context"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/canon"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
)

type Delegation struct {
	ledgerv1.UnimplementedDelegationServiceServer
	grants   ports.GrantStore
	signer   ports.Signer
	verifier ports.DelegationVerifier
	ids      ports.IDGen
	clock    ports.Clock
}

func NewDelegation(grants ports.GrantStore, signer ports.Signer, verifier ports.DelegationVerifier, ids ports.IDGen, clock ports.Clock) *Delegation {
	return &Delegation{grants: grants, signer: signer, verifier: verifier, ids: ids, clock: clock}
}

func (d *Delegation) IssueRootGrant(ctx context.Context, req *ledgerv1.IssueRootGrantRequest) (*ledgerv1.IssueRootGrantResponse, error) {
	g := &ledgerv1.Grant{
		GrantId:     d.ids.New(),
		PrincipalId: req.GetPrincipalId(),
		SubjectId:   req.GetPrincipalId(),
		Scope:       req.GetScope(),
	}
	if err := d.sign(g); err != nil {
		return nil, err
	}
	if err := d.grants.Put(ctx, g); err != nil {
		return nil, err
	}
	return &ledgerv1.IssueRootGrantResponse{Grant: g}, nil
}

func (d *Delegation) Delegate(ctx context.Context, req *ledgerv1.DelegateRequest) (*ledgerv1.DelegateResponse, error) {
	parent, err := d.grants.Get(ctx, req.GetParentGrantId())
	if err != nil {
		return nil, err
	}
	revoked, err := d.grants.IsRevoked(ctx, parent.GetGrantId())
	if err != nil {
		return nil, err
	}
	if revoked {
		return nil, errs.New(errs.FailedPrecondition, "parent grant %s revoked", parent.GetGrantId())
	}
	child := &ledgerv1.Grant{
		GrantId:       d.ids.New(),
		ParentGrantId: parent.GetGrantId(),
		PrincipalId:   parent.GetSubjectId(),
		SubjectId:     req.GetSubjectId(),
		Capabilities:  req.GetCapabilities(),
		Scope:         req.GetScope(),
	}
	if err := d.sign(child); err != nil {
		return nil, err
	}
	if err := d.grants.Put(ctx, child); err != nil {
		return nil, err
	}
	return &ledgerv1.DelegateResponse{Grant: child}, nil
}

func (d *Delegation) VerifyChain(ctx context.Context, req *ledgerv1.VerifyChainRequest) (*ledgerv1.VerifyChainResponse, error) {
	chain, err := d.grants.Chain(ctx, req.GetGrantId())
	if err != nil {
		return nil, err
	}
	verr := d.verifier.VerifyChain(chain, d.clock.Now())
	return &ledgerv1.VerifyChainResponse{Valid: verr == nil, Chain: chain, Reason: reasonOf(verr)}, nil
}

func (d *Delegation) Revoke(ctx context.Context, req *ledgerv1.RevokeRequest) (*ledgerv1.RevokeResponse, error) {
	if err := d.grants.Revoke(ctx, req.GetGrantId(), req.GetReason()); err != nil {
		return nil, err
	}
	return &ledgerv1.RevokeResponse{Revoked: true}, nil
}

func (d *Delegation) sign(g *ledgerv1.Grant) error {
	sig, _, err := d.signer.Sign(canon.Grant(g))
	if err != nil {
		return errs.Wrap(errs.Internal, err, "sign grant")
	}
	g.ParentSignature = sig
	return nil
}

func reasonOf(err error) string {
	if err == nil {
		return ""
	}
	return err.Error()
}
