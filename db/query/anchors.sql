-- name: UpsertAnchor :exec
INSERT INTO anchors (session_id, kind, root, anchor_receipt, anchored_at)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (session_id) DO UPDATE SET
    kind = EXCLUDED.kind,
    root = EXCLUDED.root,
    anchor_receipt = EXCLUDED.anchor_receipt,
    anchored_at = EXCLUDED.anchored_at;

-- name: GetAnchor :one
SELECT * FROM anchors WHERE session_id = $1;
