package store

import (
	"context"

	storedb "github.com/babit/nal/db/sqlc"
	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/errs"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type grantStore struct {
	q *storedb.Queries
}

func nonNil(s []string) []string {
	if s == nil {
		return []string{}
	}
	return s
}

func (s *grantStore) Put(ctx context.Context, grant *ledgerv1.Grant) error {
	scope := grant.Scope
	if scope == nil {
		scope = &ledgerv1.Scope{}
	}
	if err := s.q.PutGrant(ctx, storedb.PutGrantParams{
		GrantID:         grant.GrantId,
		ParentGrantID:   grant.ParentGrantId,
		PrincipalID:     grant.PrincipalId,
		SubjectID:       grant.SubjectId,
		Capabilities:    nonNil(grant.Capabilities),
		ResourceGlobs:   nonNil(scope.ResourceGlobs),
		MaxValueCents:   scope.MaxValueCents,
		MaxDepth:        scope.MaxDepth,
		ExpiresAt:       toTimestamptz(grant.ExpiresAt),
		ParentSignature: grant.ParentSignature,
		UserID:          ctxUserUUID(ctx),
	}); err != nil {
		return opErr(err, "put grant")
	}
	return nil
}

func (s *grantStore) Get(ctx context.Context, grantID string) (*ledgerv1.Grant, error) {
	row, err := s.q.GetGrant(ctx, grantID)
	if err != nil {
		return nil, lookupErr(err, "grant", grantID)
	}
	return grantFromModel(row), nil
}

func (s *grantStore) Chain(ctx context.Context, grantID string) ([]*ledgerv1.Grant, error) {
	rows, err := s.q.GrantChain(ctx, grantID)
	if err != nil {
		return nil, opErr(err, "grant chain")
	}
	if len(rows) == 0 {
		return nil, errs.New(errs.NotFound, "grant chain %s not found", grantID)
	}
	out := make([]*ledgerv1.Grant, 0, len(rows))
	for _, row := range rows {
		out = append(out, grantFromChainRow(row))
	}
	return out, nil
}

func (s *grantStore) Revoke(ctx context.Context, grantID, reason string) error {
	if err := s.q.Revoke(ctx, storedb.RevokeParams{GrantID: grantID, Reason: reason}); err != nil {
		return opErr(err, "revoke grant")
	}
	return nil
}

func (s *grantStore) IsRevoked(ctx context.Context, grantID string) (bool, error) {
	revoked, err := s.q.IsRevoked(ctx, grantID)
	if err != nil {
		return false, opErr(err, "is revoked")
	}
	return revoked, nil
}

func (s *grantStore) List(ctx context.Context, limit int32) ([]*ledgerv1.Grant, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := s.q.ListGrantsByUser(ctx, storedb.ListGrantsByUserParams{UserID: ctxUserUUID(ctx), Limit: limit})
	if err != nil {
		return nil, opErr(err, "list grants")
	}
	out := make([]*ledgerv1.Grant, 0, len(rows))
	for _, row := range rows {
		out = append(out, grantFromListRow(row))
	}
	return out, nil
}

func grantFromModel(row storedb.Grant) *ledgerv1.Grant {
	return buildGrant(row.GrantID, row.ParentGrantID, row.PrincipalID, row.SubjectID,
		row.Capabilities, row.ResourceGlobs, row.MaxValueCents, row.MaxDepth,
		fromTimestamptz(row.ExpiresAt), row.ParentSignature)
}

func grantFromChainRow(row storedb.GrantChainRow) *ledgerv1.Grant {
	return buildGrant(row.GrantID, row.ParentGrantID, row.PrincipalID, row.SubjectID,
		row.Capabilities, row.ResourceGlobs, row.MaxValueCents, row.MaxDepth,
		fromTimestamptz(row.ExpiresAt), row.ParentSignature)
}

func grantFromListRow(row storedb.ListGrantsByUserRow) *ledgerv1.Grant {
	return buildGrant(row.GrantID, row.ParentGrantID, row.PrincipalID, row.SubjectID,
		row.Capabilities, row.ResourceGlobs, row.MaxValueCents, row.MaxDepth,
		fromTimestamptz(row.ExpiresAt), row.ParentSignature)
}

func buildGrant(grantID, parentID, principalID, subjectID string, caps, globs []string,
	maxValue int64, maxDepth int32, expiresAt *timestamppb.Timestamp, sig []byte) *ledgerv1.Grant {
	return &ledgerv1.Grant{
		GrantId:       grantID,
		ParentGrantId: parentID,
		PrincipalId:   principalID,
		SubjectId:     subjectID,
		Capabilities:  caps,
		Scope: &ledgerv1.Scope{
			ResourceGlobs: globs,
			MaxValueCents: maxValue,
			MaxDepth:      maxDepth,
		},
		ExpiresAt:       expiresAt,
		ParentSignature: sig,
	}
}
