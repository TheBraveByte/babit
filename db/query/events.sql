-- name: AppendEvent :exec
INSERT INTO events (
    event_id, session_id, sequence, surface, action_type, action_payload,
    grant_id, pre_state_hash, post_state_hash, recording_ref, occurred_at,
    content_hash, prev_hash, notary_signature
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
);

-- name: GetEvent :one
SELECT * FROM events WHERE event_id = $1;

-- name: LastEventBySession :one
SELECT * FROM events
WHERE session_id = $1
ORDER BY sequence DESC
LIMIT 1;

-- name: EventsBySession :many
SELECT * FROM events
WHERE session_id = $1
ORDER BY sequence;

-- name: EventsInRange :many
SELECT * FROM events
WHERE sequence >= $1 AND sequence <= $2
ORDER BY sequence;

-- name: ListEventsByUser :many
SELECT e.* FROM events e
JOIN sessions s ON e.session_id = s.session_id
WHERE s.user_id = $1
  AND ($2::text = '' OR e.event_id < $2::text)
ORDER BY e.event_id DESC
LIMIT $3;
