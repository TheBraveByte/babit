package auth

import "context"

type userKey struct{}
type projectKey struct{}

func WithUserID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, userKey{}, id)
}

func UserID(ctx context.Context) string {
	id, _ := ctx.Value(userKey{}).(string)
	return id
}

func WithProjectID(ctx context.Context, id string) context.Context {
	return context.WithValue(ctx, projectKey{}, id)
}

func ProjectID(ctx context.Context) string {
	id, _ := ctx.Value(projectKey{}).(string)
	return id
}
