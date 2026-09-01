package ports

import (
	"context"
	"time"
)

type User struct {
	ID           string
	Email        string
	PasswordHash string
	AccountType  int32
	OrgName      string
	OrgDomain    string
	Industry     string
	BrandCompany string
	BrandLogoURL string
	BrandColor   string
	CreatedAt    time.Time
}

type UserStore interface {
	Create(ctx context.Context, u *User) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	GetByID(ctx context.Context, id string) (*User, error)
}

type Branding struct {
	CompanyName string
	LogoURL     string
	BrandColor  string
}

type BrandResolver interface {
	Resolve(ctx context.Context, domain string) (Branding, error)
}
