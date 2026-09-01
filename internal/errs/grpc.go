package errs

import (
	"context"
	"errors"

	"google.golang.org/grpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func codeOf(k Kind) codes.Code {
	switch k {
	case NotFound:
		return codes.NotFound
	case PermissionDenied:
		return codes.PermissionDenied
	case FailedPrecondition:
		return codes.FailedPrecondition
	case Invalid:
		return codes.InvalidArgument
	case Unauthenticated:
		return codes.Unauthenticated
	default:
		return codes.Internal
	}
}

func GRPCStatus(err error) error {
	if err == nil {
		return nil
	}
	var e *Error
	if errors.As(err, &e) {
		if e.Kind == Internal {
			return status.Error(codes.Internal, "internal error")
		}
		return status.Error(codeOf(e.Kind), e.Message)
	}
	return status.Error(codes.Internal, "internal error")
}

func UnaryInterceptor() grpc.UnaryServerInterceptor {
	return func(ctx context.Context, req any, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (any, error) {
		resp, err := handler(ctx, req)
		return resp, GRPCStatus(err)
	}
}
