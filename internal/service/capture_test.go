package service_test

import (
	"context"
	"testing"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/mocks"
	"github.com/babit/nal/internal/service"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func captureDeps(t *testing.T) (*mocks.MockSessionStore, *mocks.MockGrantStore, *mocks.MockDelegationVerifier, *mocks.MockNotarizer, *mocks.MockCheckpointer, *mocks.MockIDGen, *mocks.MockClock) {
	return mocks.NewMockSessionStore(t), mocks.NewMockGrantStore(t), mocks.NewMockDelegationVerifier(t),
		mocks.NewMockNotarizer(t), mocks.NewMockCheckpointer(t), mocks.NewMockIDGen(t), mocks.NewMockClock(t)
}

func grantChain(caps ...string) []*ledgerv1.Grant {
	return []*ledgerv1.Grant{{GrantId: "grn_leaf", Capabilities: caps}}
}

func TestRecordActionHappyPath(t *testing.T) {
	sessions, grants, verifier, notary, checkpoint, idgen, clk := captureDeps(t)
	sessions.EXPECT().Get(mock.Anything, "ses").Return(&ledgerv1.Session{SessionId: "ses", Surface: ledgerv1.Surface_SURFACE_BROWSER}, nil)
	grants.EXPECT().Chain(mock.Anything, "grn_leaf").Return(grantChain("browser.click"), nil)
	verifier.EXPECT().VerifyChain(mock.Anything, mock.Anything).Return(nil)
	grants.EXPECT().IsRevoked(mock.Anything, "grn_leaf").Return(false, nil)
	sessions.EXPECT().NextSequence(mock.Anything, "ses").Return(int64(1), nil)
	idgen.EXPECT().New("evt").Return("evt_1")
	clk.EXPECT().Now().Return(time.Unix(0, 0))
	notary.EXPECT().Notarize(mock.Anything, mock.Anything).Return(&ledgerv1.ActionEvent{EventId: "evt_1", Sequence: 1}, nil)

	c := service.NewCapture(sessions, grants, verifier, notary, checkpoint, idgen, clk)
	resp, err := c.RecordAction(context.Background(), &ledgerv1.RecordActionRequest{SessionId: "ses", GrantId: "grn_leaf", ActionType: "browser.click"})

	require.NoError(t, err)
	assert.Equal(t, "evt_1", resp.GetEvent().GetEventId())
}

func TestRecordActionDeniesUngrantedCapabilityUnit(t *testing.T) {
	sessions, grants, verifier, notary, checkpoint, idgen, clk := captureDeps(t)
	sessions.EXPECT().Get(mock.Anything, "ses").Return(&ledgerv1.Session{SessionId: "ses"}, nil)
	grants.EXPECT().Chain(mock.Anything, "grn_leaf").Return(grantChain("browser.click"), nil)
	verifier.EXPECT().VerifyChain(mock.Anything, mock.Anything).Return(nil)
	grants.EXPECT().IsRevoked(mock.Anything, "grn_leaf").Return(false, nil)
	clk.EXPECT().Now().Return(time.Unix(0, 0))

	c := service.NewCapture(sessions, grants, verifier, notary, checkpoint, idgen, clk)
	_, err := c.RecordAction(context.Background(), &ledgerv1.RecordActionRequest{SessionId: "ses", GrantId: "grn_leaf", ActionType: "sandbox.exec"})

	require.Error(t, err)
	assert.Equal(t, codes.PermissionDenied, status.Code(err))
}

func TestRecordActionDeniesRevokedGrantUnit(t *testing.T) {
	sessions, grants, verifier, notary, checkpoint, idgen, clk := captureDeps(t)
	sessions.EXPECT().Get(mock.Anything, "ses").Return(&ledgerv1.Session{SessionId: "ses"}, nil)
	grants.EXPECT().Chain(mock.Anything, "grn_leaf").Return(grantChain("browser.click"), nil)
	verifier.EXPECT().VerifyChain(mock.Anything, mock.Anything).Return(nil)
	grants.EXPECT().IsRevoked(mock.Anything, "grn_leaf").Return(true, nil)
	clk.EXPECT().Now().Return(time.Unix(0, 0))

	c := service.NewCapture(sessions, grants, verifier, notary, checkpoint, idgen, clk)
	_, err := c.RecordAction(context.Background(), &ledgerv1.RecordActionRequest{SessionId: "ses", GrantId: "grn_leaf", ActionType: "browser.click"})

	require.Error(t, err)
	assert.Equal(t, codes.PermissionDenied, status.Code(err))
}

func TestEndSessionCheckpoints(t *testing.T) {
	sessions, grants, verifier, notary, checkpoint, idgen, clk := captureDeps(t)
	clk.EXPECT().Now().Return(time.Unix(0, 0))
	sessions.EXPECT().End(mock.Anything, "ses", mock.Anything).Return(&ledgerv1.Session{SessionId: "ses"}, nil)
	checkpoint.EXPECT().Checkpoint(mock.Anything, "ses").Return(&ledgerv1.Anchor{Root: []byte("r")}, nil)

	c := service.NewCapture(sessions, grants, verifier, notary, checkpoint, idgen, clk)
	_, err := c.EndSession(context.Background(), &ledgerv1.EndSessionRequest{SessionId: "ses"})
	require.NoError(t, err)
}
