-- name: CreateUser :one
INSERT INTO users (
    email, password_hash, account_type, org_name, org_domain, industry,
    brand_company, brand_logo_url, brand_color
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING *;

-- name: GetUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: UpdateUser :one
UPDATE users
SET org_name = $2, org_domain = $3, industry = $4
WHERE id = $1
RETURNING *;
