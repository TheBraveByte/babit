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

func captureDeps(t *testing.T) (*mocks.MockSessionStore, *mocks.MockGrantStore, *mocks.MockProjectStore, *mocks.MockDelegationVerifier, *mocks.MockNotarizer, *mocks.MockCheckpointer, *mocks.MockIDGen, *mocks.MockClock) {
	return mocks.NewMockSessionStore(t), mocks.NewMockGrantStore(t), mocks.NewMockProjectStore(t), mocks.NewMockDelegationVerifier(t),
		mocks.NewMockNotarizer(t), mocks.NewMockCheckpointer(t), mocks.NewMockIDGen(t), mocks.NewMockClock(t)
}

func authCtx(t *testing.T, projectID string) context.Context {
	t.Helper()
	return coreauth.WithProjectID(context.Background(), projectID)
}

func grantChain(caps ...string) []*ledgerv1.Grant {
	return []*ledgerv1.Grant{{GrantId: "grn_leaf", ProjectId: "prj_1", Capabilities: caps}}
}

func TestRecordActionHappyPath(t *testing.T) {
	sessions, grants, projects, verifier, notary, checkpoint, idgen, clk := captureDeps(t)
	sessions.EXPECT().Get(mock.Anything, "ses").Return(&ledgerv1.Session{SessionId: "ses", ProjectId: "prj_1", Surface: ledgerv1.Surface_SURFACE_BROWSER}, nil)
	grants.EXPECT().Chain(mock.Anything, "grn_leaf").Return(grantChain("browser.click"), nil)
	verifier.EXPECT().VerifyChain(mock.Anything, mock.Anything).Return(nil)
	grants.EXPECT().IsRevoked(mock.Anything, "grn_leaf").Return(false, nil)
	verifier.EXPECT().Authorizes(mock.Anything, "browser.click", "", int64(0)).Return(nil)
	sessions.EXPECT().NextSequence(mock.Anything, "ses").Return(int64(1), nil)
	idgen.EXPECT().New().Return("evt_1")
	clk.EXPECT().Now().Return(time.Unix(0, 0))
	notary.EXPECT().Notarize(mock.Anything, mock.Anything).Return(&ledgerv1.ActionEvent{EventId: "evt_1", Sequence: 1}, nil)

	c := service.NewCapture(sessions, grants, projects, verifier, notary, checkpoint, idgen, clk)
	resp, err := c.RecordAction(authCtx(t, "prj_1"), &ledgerv1.RecordActionRequest{SessionId: "ses", GrantId: "grn_leaf", ActionType: "browser.click"})

	require.NoError(t, err)
	assert.Equal(t, "evt_1", resp.GetEvent().GetEventId())
}

func TestRecordActionDeniesUngrantedCapabilityUnit(t *testing.T) {
	sessions, grants, projects, verifier, notary, checkpoint, idgen, clk := captureDeps(t)
	sessions.EXPECT().Get(mock.Anything, "ses").Return(&ledgerv1.Session{SessionId: "ses", ProjectId: "prj_1"}, nil)
	grants.EXPECT().Chain(mock.Anything, "grn_leaf").Return(grantChain("browser.click"), nil)
	verifier.EXPECT().VerifyChain(mock.Anything, mock.Anything).Return(nil)
	grants.EXPECT().IsRevoked(mock.Anything, "grn_leaf").Return(false, nil)
	verifier.EXPECT().Authorizes(mock.Anything, "sandbox.exec", "", int64(0)).Return(errors.New("capability not granted"))
	clk.EXPECT().Now().Return(time.Unix(0, 0))

	c := service.NewCapture(sessions, grants, projects, verifier, notary, checkpoint, idgen, clk)
	_, err := c.RecordAction(authCtx(t, "prj_1"), &ledgerv1.RecordActionRequest{SessionId: "ses", GrantId: "grn_leaf", ActionType: "sandbox.exec"})

	require.Error(t, err)
	assert.Equal(t, errs.PermissionDenied, errs.KindOf(err))
}

func TestRecordActionDeniesRevokedGrantUnit(t *testing.T) {
	sessions, grants, projects, verifier, notary, checkpoint, idgen, clk := captureDeps(t)
	sessions.EXPECT().Get(mock.Anything, "ses").Return(&ledgerv1.Session{SessionId: "ses", ProjectId: "prj_1"}, nil)
	grants.EXPECT().Chain(mock.Anything, "grn_leaf").Return(grantChain("browser.click"), nil)
	verifier.EXPECT().VerifyChain(mock.Anything, mock.Anything).Return(nil)
	grants.EXPECT().IsRevoked(mock.Anything, "grn_leaf").Return(true, nil)
	clk.EXPECT().Now().Return(time.Unix(0, 0))

	c := service.NewCapture(sessions, grants, projects, verifier, notary, checkpoint, idgen, clk)
	_, err := c.RecordAction(authCtx(t, "prj_1"), &ledgerv1.RecordActionRequest{SessionId: "ses", GrantId: "grn_leaf", ActionType: "browser.click"})

	require.Error(t, err)
	assert.Equal(t, errs.PermissionDenied, errs.KindOf(err))
}

func TestEndSessionCheckpoints(t *testing.T) {
	sessions, grants, projects, verifier, notary, checkpoint, idgen, clk := captureDeps(t)
	clk.EXPECT().Now().Return(time.Unix(0, 0))
	sessions.EXPECT().Get(mock.Anything, "ses").Return(&ledgerv1.Session{SessionId: "ses", ProjectId: "prj_1"}, nil)
	sessions.EXPECT().End(mock.Anything, "ses", mock.Anything).Return(&ledgerv1.Session{SessionId: "ses", ProjectId: "prj_1"}, nil)
	checkpoint.EXPECT().Checkpoint(mock.Anything, "ses").Return(&ledgerv1.Anchor{Root: []byte("r")}, nil)

	c := service.NewCapture(sessions, grants, projects, verifier, notary, checkpoint, idgen, clk)
	_, err := c.EndSession(authCtx(t, "prj_1"), &ledgerv1.EndSessionRequest{SessionId: "ses"})
	require.NoError(t, err)
}
