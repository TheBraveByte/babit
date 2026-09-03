-- name: CountEventsByUser :one
SELECT count(*)
FROM events e
JOIN sessions s ON e.session_id = s.session_id
WHERE s.user_id = $1;

-- name: CountSessionsByUser :one
SELECT count(*) FROM sessions WHERE user_id = $1;

-- name: CountGrantsByUser :one
SELECT count(*) FROM grants WHERE user_id = $1;

-- name: CountRevocationsByUser :one
SELECT count(*)
FROM revocations r
JOIN grants g ON r.grant_id = g.grant_id
WHERE g.user_id = $1;

-- name: EventsBySurfaceForUser :many
SELECT e.surface, count(*) AS n
FROM events e
JOIN sessions s ON e.session_id = s.session_id
WHERE s.user_id = $1
GROUP BY e.surface
ORDER BY e.surface;

-- name: EventsByDayForUser :many
SELECT date_trunc('day', e.occurred_at)::timestamptz AS day, count(*) AS n
FROM events e
JOIN sessions s ON e.session_id = s.session_id
WHERE s.user_id = $1
  AND e.occurred_at >= now() - make_interval(days => $2::int)
GROUP BY day
ORDER BY day;

-- name: TopRecordingRefsForUser :many
SELECT e.recording_ref AS url, count(*) AS n
FROM events e
JOIN sessions s ON e.session_id = s.session_id
WHERE s.user_id = $1
  AND e.recording_ref <> ''
  AND e.occurred_at >= now() - make_interval(days => $2::int)
GROUP BY e.recording_ref
ORDER BY n DESC
LIMIT $3;
