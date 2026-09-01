package errs_test

import (
	"errors"
	"fmt"
	"testing"

	"github.com/babit/nal/internal/errs"
	"github.com/stretchr/testify/assert"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func TestKindOf(t *testing.T) {
	assert.Equal(t, errs.NotFound, errs.KindOf(errs.New(errs.NotFound, "x")))
	assert.Equal(t, errs.Internal, errs.KindOf(errors.New("plain")))
	wrapped := fmt.Errorf("outer: %w", errs.New(errs.PermissionDenied, "denied"))
	assert.Equal(t, errs.PermissionDenied, errs.KindOf(wrapped))
}

func TestGRPCStatusMapsKinds(t *testing.T) {
	cases := []struct {
		kind errs.Kind
		want codes.Code
	}{
		{errs.NotFound, codes.NotFound},
		{errs.PermissionDenied, codes.PermissionDenied},
		{errs.FailedPrecondition, codes.FailedPrecondition},
		{errs.Invalid, codes.InvalidArgument},
		{errs.Unauthenticated, codes.Unauthenticated},
	}
	for _, c := range cases {
		got := errs.GRPCStatus(errs.New(c.kind, "boom"))
		assert.Equal(t, c.want, status.Code(got))
		assert.Equal(t, "boom", status.Convert(got).Message())
	}
}

func TestGRPCStatusHidesInternalCause(t *testing.T) {
	got := errs.GRPCStatus(errs.Wrap(errs.Internal, errors.New("db password leaked"), "load"))
	assert.Equal(t, codes.Internal, status.Code(got))
	assert.Equal(t, "internal error", status.Convert(got).Message())
}

func TestGRPCStatusNilAndUnknown(t *testing.T) {
	assert.NoError(t, errs.GRPCStatus(nil))
	got := errs.GRPCStatus(errors.New("plain"))
	assert.Equal(t, codes.Internal, status.Code(got))
	assert.Equal(t, "internal error", status.Convert(got).Message())
}
