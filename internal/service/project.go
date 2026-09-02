package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"strings"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/auth"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
	"google.golang.org/protobuf/types/known/timestamppb"
)

const apiKeyPrefix = "bak_live"

type ProjectSvc struct {
	ledgerv1.UnimplementedProjectServiceServer
	projects ports.ProjectStore
}

func NewProjectService(projects ports.ProjectStore) *ProjectSvc {
	return &ProjectSvc{projects: projects}
}

func (s *ProjectSvc) CreateProject(ctx context.Context, req *ledgerv1.CreateProjectRequest) (*ledgerv1.CreateProjectResponse, error) {
	uid := auth.UserID(ctx)
	if uid == "" {
		return nil, errs.New(errs.Unauthenticated, "not authenticated")
	}
	name := strings.TrimSpace(req.GetName())
	if name == "" {
		return nil, errs.New(errs.Invalid, "project name is required")
	}
	p, err := s.projects.Create(ctx, uid, name)
	if err != nil {
		return nil, err
	}
	return &ledgerv1.CreateProjectResponse{Project: toProtoProject(p)}, nil
}

func (s *ProjectSvc) ListProjects(ctx context.Context, _ *ledgerv1.ListProjectsRequest) (*ledgerv1.ListProjectsResponse, error) {
	uid := auth.UserID(ctx)
	if uid == "" {
		return nil, errs.New(errs.Unauthenticated, "not authenticated")
	}
	list, err := s.projects.ListByUser(ctx, uid)
	if err != nil {
		return nil, err
	}
	out := make([]*ledgerv1.Project, 0, len(list))
	for _, p := range list {
		out = append(out, toProtoProject(p))
	}
	return &ledgerv1.ListProjectsResponse{Projects: out}, nil
}


type APIKeySvc struct {
	ledgerv1.UnimplementedApiKeyServiceServer
	keys     ports.APIKeyStore
	projects ports.ProjectStore
}

func NewAPIKeyService(keys ports.APIKeyStore, projects ports.ProjectStore) *APIKeySvc {
	return &APIKeySvc{keys: keys, projects: projects}
}

func (s *APIKeySvc) CreateApiKey(ctx context.Context, req *ledgerv1.CreateApiKeyRequest) (*ledgerv1.CreateApiKeyResponse, error) {
	uid := auth.UserID(ctx)
	if uid == "" {
		return nil, errs.New(errs.Unauthenticated, "not authenticated")
	}
	projectID := strings.TrimSpace(req.GetProjectId())
	if _, err := s.projects.GetForUser(ctx, projectID, uid); err != nil {
		return nil, err
	}
	secret, last4, hash, err := mintAPIKey()
	if err != nil {
		return nil, errs.Wrap(errs.Internal, err, "generate api key")
	}
	rec, err := s.keys.Create(ctx, ports.APIKeyCreate{
		ProjectID: projectID,
		UserID:    uid,
		Name:      strings.TrimSpace(req.GetName()),
		Prefix:    apiKeyPrefix,
		Last4:     last4,
		KeyHash:   hash,
	})
	if err != nil {
		return nil, err
	}
	return &ledgerv1.CreateApiKeyResponse{Key: toProtoAPIKey(rec), Secret: secret}, nil
}

func (s *APIKeySvc) ListApiKeys(ctx context.Context, req *ledgerv1.ListApiKeysRequest) (*ledgerv1.ListApiKeysResponse, error) {
	uid := auth.UserID(ctx)
	if uid == "" {
		return nil, errs.New(errs.Unauthenticated, "not authenticated")
	}
	projectID := strings.TrimSpace(req.GetProjectId())
	if _, err := s.projects.GetForUser(ctx, projectID, uid); err != nil {
		return nil, err
	}
	list, err := s.keys.ListByProject(ctx, projectID)
	if err != nil {
		return nil, err
	}
	out := make([]*ledgerv1.ApiKey, 0, len(list))
	for _, k := range list {
		out = append(out, toProtoAPIKey(k))
	}
	return &ledgerv1.ListApiKeysResponse{Keys: out}, nil
}

func (s *APIKeySvc) RevokeApiKey(ctx context.Context, req *ledgerv1.RevokeApiKeyRequest) (*ledgerv1.RevokeApiKeyResponse, error) {
	uid := auth.UserID(ctx)
	if uid == "" {
		return nil, errs.New(errs.Unauthenticated, "not authenticated")
	}
	revoked, err := s.keys.Revoke(ctx, strings.TrimSpace(req.GetKeyId()), uid)
	if err != nil {
		return nil, err
	}
	return &ledgerv1.RevokeApiKeyResponse{Revoked: revoked}, nil
}

// helpers --------------------------------------------------------------------

// mintAPIKey returns the full secret (shown once), its last4, and the sha256 hash to store.
func mintAPIKey() (secret, last4, hash string, err error) {
	b := make([]byte, 24)
	if _, err = rand.Read(b); err != nil {
		return "", "", "", err
	}
	body := hex.EncodeToString(b)
	secret = apiKeyPrefix + "_" + body
	last4 = body[len(body)-4:]
	sum := sha256.Sum256([]byte(secret))
	hash = hex.EncodeToString(sum[:])
	return secret, last4, hash, nil
}

func toProtoProject(p *ports.Project) *ledgerv1.Project {
	return &ledgerv1.Project{
		Id:         p.ID,
		Name:       p.Name,
		ActiveKeys: p.ActiveKeys,
		CreatedAt:  timestamppb.New(p.CreatedAt),
	}
}

func toProtoAPIKey(k *ports.APIKey) *ledgerv1.ApiKey {
	return &ledgerv1.ApiKey{
		Id:        k.ID,
		ProjectId: k.ProjectID,
		Name:      k.Name,
		Prefix:    k.Prefix,
		Last4:     k.Last4,
		Revoked:   k.Revoked,
		CreatedAt: timestamppb.New(k.CreatedAt),
	}
}
