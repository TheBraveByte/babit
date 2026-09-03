-- name: CreateProject :one
INSERT INTO projects (user_id, name)
VALUES ($1, $2)
RETURNING *;

-- name: ListProjectsByUser :many
SELECT
    p.id,
    p.user_id,
    p.name,
    p.created_at,
    (SELECT count(*) FROM api_keys k WHERE k.project_id = p.id AND k.revoked_at IS NULL) AS active_keys
FROM projects p
WHERE p.user_id = $1
  AND ($2::text = '' OR p.id < $2::text)
ORDER BY p.id DESC
LIMIT $3;

-- name: GetProjectForUser :one
SELECT * FROM projects WHERE id = $1 AND user_id = $2;

-- name: CreateApiKey :one
INSERT INTO api_keys (project_id, user_id, name, prefix, last4, key_hash)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: ListApiKeysByProject :many
SELECT * FROM api_keys
WHERE project_id = $1
  AND ($2::text = '' OR id < $2::text)
ORDER BY id DESC
LIMIT $3;

-- name: GetApiKeyByHash :one
SELECT * FROM api_keys WHERE key_hash = $1 AND revoked_at IS NULL;

-- name: RevokeApiKey :one
UPDATE api_keys
SET revoked_at = now()
WHERE id = $1 AND user_id = $2 AND revoked_at IS NULL
RETURNING *;
