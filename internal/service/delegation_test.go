package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	coreauth "github.com/babit/nal/internal/core/auth"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/mocks"
	"github.com/babit/nal/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
)

func authCtxWithUser(t *testing.T, userID, projectID string) context.Context {
	t.Helper()
	return coreauth.WithProjectID(coreauth.WithUserID(context.Background(), userID), projectID)
}

func TestIssueRootGrantSignsAndStores(t *testing.T) {
	grants := mocks.NewMockGrantStore(t)
	projects := mocks.NewMockProjectStore(t)
	signer := mocks.NewMockSigner(t)
	idgen := mocks.NewMockIDGen(t)
	idgen.EXPECT().New().Return("grn_1")
	signer.EXPECT().Sign(mock.Anything).Return([]byte("sig"), "nal-notary-1", nil)
	grants.EXPECT().Put(mock.Anything, mock.MatchedBy(func(g *ledgerv1.Grant) bool {
		return g.GetGrantId() == "grn_1" && g.GetSubjectId() == "usr" && g.GetProjectId() == "prj_1"
	})).Return(nil)

	d := service.NewDelegation(grants, projects, signer, mocks.NewMockDelegationVerifier(t), idgen, mocks.NewMockClock(t))
	resp, err := d.IssueRootGrant(authCtxWithUser(t, "usr", "prj_1"), &ledgerv1.IssueRootGrantRequest{PrincipalId: "usr", ProjectId: "prj_1", Scope: &ledgerv1.Scope{MaxDepth: 2}})

	require.NoError(t, err)
	assert.Equal(t, "grn_1", resp.GetGrant().GetGrantId())
	assert.Equal(t, "usr", resp.GetGrant().GetSubjectId())
	assert.Equal(t, []byte("sig"), resp.GetGrant().GetParentSignature())
}

func TestDelegateRejectsRevokedParent(t *testing.T) {
	grants := mocks.NewMockGrantStore(t)
	projects := mocks.NewMockProjectStore(t)
	grants.EXPECT().Get(mock.Anything, "grn_parent").Return(&ledgerv1.Grant{GrantId: "grn_parent", ProjectId: "prj_1", SubjectId: "usr"}, nil)
	grants.EXPECT().IsRevoked(mock.Anything, "grn_parent").Return(true, nil)

	d := service.NewDelegation(grants, projects, mocks.NewMockSigner(t), mocks.NewMockDelegationVerifier(t), mocks.NewMockIDGen(t), mocks.NewMockClock(t))
	_, err := d.Delegate(coreauth.WithProjectID(context.Background(), "prj_1"), &ledgerv1.DelegateRequest{ParentGrantId: "grn_parent", SubjectId: "agt"})

	require.Error(t, err)
	assert.Equal(t, errs.FailedPrecondition, errs.KindOf(err))
}

func TestVerifyChainReportsInvalid(t *testing.T) {
	grants := mocks.NewMockGrantStore(t)
	verifier := mocks.NewMockDelegationVerifier(t)
	clk := mocks.NewMockClock(t)
	chain := []*ledgerv1.Grant{{GrantId: "grn_root"}}
	grants.EXPECT().Chain(mock.Anything, "grn_root").Return(chain, nil)
	clk.EXPECT().Now().Return(time.Unix(0, 0))
	verifier.EXPECT().VerifyChain(chain, mock.Anything).Return(errors.New("expired"))

	d := service.NewDelegation(grants, mocks.NewMockProjectStore(t), mocks.NewMockSigner(t), verifier, mocks.NewMockIDGen(t), clk)
	resp, err := d.VerifyChain(context.Background(), &ledgerv1.VerifyChainRequest{GrantId: "grn_root"})

	require.NoError(t, err)
	assert.False(t, resp.GetValid())
	assert.Equal(t, "expired", resp.GetReason())
}
