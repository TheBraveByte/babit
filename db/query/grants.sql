-- name: PutGrant :exec
INSERT INTO grants (
    grant_id, parent_grant_id, principal_id, subject_id, capabilities,
    resource_globs, max_value_cents, max_depth, expires_at, parent_signature
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
)
ON CONFLICT (grant_id) DO UPDATE SET
    parent_grant_id = EXCLUDED.parent_grant_id,
    principal_id = EXCLUDED.principal_id,
    subject_id = EXCLUDED.subject_id,
    capabilities = EXCLUDED.capabilities,
    resource_globs = EXCLUDED.resource_globs,
    max_value_cents = EXCLUDED.max_value_cents,
    max_depth = EXCLUDED.max_depth,
    expires_at = EXCLUDED.expires_at,
    parent_signature = EXCLUDED.parent_signature;

-- name: GetGrant :one
SELECT * FROM grants WHERE grant_id = $1;

-- name: GrantChain :many
WITH RECURSIVE chain AS (
    SELECT g.*, 0 AS depth
    FROM grants g
    WHERE g.grant_id = $1
    UNION ALL
    SELECT p.*, c.depth + 1
    FROM grants p
    JOIN chain c ON p.grant_id = c.parent_grant_id
    WHERE c.parent_grant_id <> ''
)
SELECT grant_id, parent_grant_id, principal_id, subject_id, capabilities,
       resource_globs, max_value_cents, max_depth, expires_at, parent_signature
FROM chain
ORDER BY depth DESC;

-- name: Revoke :exec
INSERT INTO revocations (grant_id, reason)
VALUES ($1, $2)
ON CONFLICT (grant_id) DO UPDATE SET reason = EXCLUDED.reason;

-- name: IsRevoked :one
SELECT EXISTS (SELECT 1 FROM revocations WHERE grant_id = $1);
