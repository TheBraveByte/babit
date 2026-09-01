package auth

import "context"

type ctxKey struct{}

func WithUserID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, ctxKey{}, id)
}

func UserID(ctx context.Context) string {
	id, _ := ctx.Value(ctxKey{}).(string)
	return id
}
