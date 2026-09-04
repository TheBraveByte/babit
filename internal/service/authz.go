package service

import (
	"context"

	coreauth "github.com/babit/nal/internal/core/auth"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
)

func requireUser(ctx context.Context) (string, error) {
	uid := coreauth.UserID(ctx)
	if uid == "" {
		return "", errs.New(errs.Unauthenticated, "not authenticated")
	}
	return uid, nil
}

func requireAuth(ctx context.Context) error {
	if coreauth.UserID(ctx) == "" && coreauth.ProjectID(ctx) == "" {
		return errs.New(errs.Unauthenticated, "not authenticated")
	}
	return nil
}

func ensureProjectAccess(ctx context.Context, projectID string, projects ports.ProjectStore) error {
	uid := coreauth.UserID(ctx)
	apiProject := coreauth.ProjectID(ctx)

	if uid == "" && apiProject == "" {
		return errs.New(errs.Unauthenticated, "not authenticated")
	}

	if apiProject != "" {
		if apiProject == projectID {
			return nil
		}
		return errs.New(errs.PermissionDenied, "not authorized for this project")
	}

	_, err := projects.GetForUser(ctx, projectID, uid)
	return err
}
