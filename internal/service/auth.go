package service

import (
	"context"
	"strings"
	"time"

	ledgerv1 "github.com/babit/nal/gen/solari/ledger/v1"
	"github.com/babit/nal/internal/core/auth"
	"github.com/babit/nal/internal/errs"
	"github.com/babit/nal/internal/ports"
	"google.golang.org/protobuf/types/known/timestamppb"
)

type Auth struct {
	ledgerv1.UnimplementedAuthServiceServer
	users  ports.UserStore
	brands ports.BrandResolver
	secret string
	ttl    time.Duration
}

func NewAuth(users ports.UserStore, brands ports.BrandResolver, secret string, ttl time.Duration) *Auth {
	return &Auth{users: users, brands: brands, secret: secret, ttl: ttl}
}

func (a *Auth) Signup(ctx context.Context, req *ledgerv1.SignupRequest) (*ledgerv1.SignupResponse, error) {
	if req.GetEmail() == "" || req.GetPassword() == "" {
		return nil, errs.New(errs.Invalid, "email and password are required")
	}
	hash, err := auth.HashPassword(req.GetPassword())
	if err != nil {
		return nil, errs.Wrap(errs.Internal, err, "hash password")
	}
	u := &ports.User{
		Email:        strings.ToLower(strings.TrimSpace(req.GetEmail())),
		PasswordHash: hash,
		AccountType:  int32(req.GetAccountType()),
		OrgName:      req.GetOrgName(),
		OrgDomain:    req.GetOrgDomain(),
		Industry:     req.GetIndustry(),
	}
	if req.GetAccountType() == ledgerv1.AccountType_ACCOUNT_TYPE_ORGANIZATION {
		a.applyBranding(ctx, u)
	}
	created, err := a.users.Create(ctx, u)
	if err != nil {
		return nil, err
	}
	token, err := auth.IssueToken(created.ID, a.secret, a.ttl)
	if err != nil {
		return nil, errs.Wrap(errs.Internal, err, "issue token")
	}
	return &ledgerv1.SignupResponse{Token: token, User: toProtoUser(created)}, nil
}

func (a *Auth) Login(ctx context.Context, req *ledgerv1.LoginRequest) (*ledgerv1.LoginResponse, error) {
	u, err := a.users.GetByEmail(ctx, strings.ToLower(strings.TrimSpace(req.GetEmail())))
	if err != nil || !auth.CheckPassword(u.PasswordHash, req.GetPassword()) {
		return nil, errs.New(errs.Unauthenticated, "invalid email or password")
	}
	token, err := auth.IssueToken(u.ID, a.secret, a.ttl)
	if err != nil {
		return nil, errs.Wrap(errs.Internal, err, "issue token")
	}
	return &ledgerv1.LoginResponse{Token: token, User: toProtoUser(u)}, nil
}

func (a *Auth) Me(ctx context.Context, _ *ledgerv1.MeRequest) (*ledgerv1.MeResponse, error) {
	uid := auth.UserID(ctx)
	if uid == "" {
		return nil, errs.New(errs.Unauthenticated, "not authenticated")
	}
	u, err := a.users.GetByID(ctx, uid)
	if err != nil {
		return nil, err
	}
	return &ledgerv1.MeResponse{
		User: toProtoUser(u),
		Branding: &ledgerv1.Branding{
			CompanyName: u.BrandCompany,
			LogoUrl:     u.BrandLogoURL,
			BrandColor:  u.BrandColor,
		},
	}, nil
}

func (a *Auth) UpdateProfile(ctx context.Context, req *ledgerv1.UpdateProfileRequest) (*ledgerv1.UpdateProfileResponse, error) {
	uid := auth.UserID(ctx)
	if uid == "" {
		return nil, errs.New(errs.Unauthenticated, "not authenticated")
	}
	u, err := a.users.Update(ctx, uid, req.GetOrgName(), req.GetOrgDomain(), req.GetIndustry())
	if err != nil {
		return nil, err
	}
	return &ledgerv1.UpdateProfileResponse{User: toProtoUser(u)}, nil
}

func (a *Auth) applyBranding(ctx context.Context, u *ports.User) {
	domain := u.OrgDomain
	if domain == "" {
		domain = domainFromEmail(u.Email)
	}
	if domain == "" || a.brands == nil {
		return
	}
	b, err := a.brands.Resolve(ctx, domain)
	if err != nil {
		return
	}
	u.OrgDomain = domain
	u.BrandCompany = b.CompanyName
	u.BrandLogoURL = b.LogoURL
	u.BrandColor = b.BrandColor
}

func domainFromEmail(email string) string {
	if i := strings.LastIndex(email, "@"); i >= 0 && i < len(email)-1 {
		return email[i+1:]
	}
	return ""
}

func toProtoUser(u *ports.User) *ledgerv1.User {
	return &ledgerv1.User{
		Id:          u.ID,
		Email:       u.Email,
		AccountType: ledgerv1.AccountType(u.AccountType),
		OrgName:     u.OrgName,
		OrgDomain:   u.OrgDomain,
		Industry:    u.Industry,
		CreatedAt:   timestamppb.New(u.CreatedAt),
	}
}
