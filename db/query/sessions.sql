-- name: CreateSession :exec
INSERT INTO sessions (
    session_id, root_grant_id, surface, started_at, ended_at, event_count, user_id
) VALUES (
    $1, $2, $3, $4, $5, $6, $7
);

-- name: GetSession :one
SELECT * FROM sessions WHERE session_id = $1;

-- name: EndSession :one
UPDATE sessions
SET ended_at = $2
WHERE session_id = $1
RETURNING *;

-- name: NextSequence :one
UPDATE sessions
SET event_count = event_count + 1
WHERE session_id = $1
RETURNING event_count;

-- name: ListSessionsByUser :many
SELECT * FROM sessions
WHERE user_id = $1
ORDER BY started_at DESC
LIMIT $2;
