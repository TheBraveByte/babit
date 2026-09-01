package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func IssueToken(userID, secret string, ttl time.Duration) (string, error) {
	now := time.Now()
	claims := jwt.RegisteredClaims{
		Subject:   userID,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(ttl)),
	}
	tok, err := jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(secret))
	if err != nil {
		return "", fmt.Errorf("sign token: %w", err)
	}
	return tok, nil
}

func ParseToken(token, secret string) (string, error) {
	parsed, err := jwt.ParseWithClaims(
		token,
		&jwt.RegisteredClaims{},
		func(*jwt.Token) (any, error) { return []byte(secret), nil },
		jwt.WithValidMethods([]string{"HS256"}),
	)
	if err != nil {
		return "", fmt.Errorf("parse token: %w", err)
	}
	claims, ok := parsed.Claims.(*jwt.RegisteredClaims)
	if !ok || !parsed.Valid || claims.Subject == "" {
		return "", errors.New("invalid token")
	}
	return claims.Subject, nil
}
