-- name: CountEvents :one
SELECT count(*) FROM events;

-- name: CountSessions :one
SELECT count(*) FROM sessions;

-- name: CountGrants :one
SELECT count(*) FROM grants;

-- name: CountRevocations :one
SELECT count(*) FROM revocations;

-- name: EventsBySurface :many
SELECT surface, count(*) AS n FROM events GROUP BY surface ORDER BY surface;

-- name: EventsByDay :many
SELECT date_trunc('day', occurred_at)::timestamptz AS day, count(*) AS n
FROM events
WHERE occurred_at >= now() - make_interval(days => $1::int)
GROUP BY day
ORDER BY day;
