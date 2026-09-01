-- name: CreateSession :exec
INSERT INTO sessions (
    session_id, root_grant_id, surface, started_at, ended_at, event_count
) VALUES (
    $1, $2, $3, $4, $5, $6
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
