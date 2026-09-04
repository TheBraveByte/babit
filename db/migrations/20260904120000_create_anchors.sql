-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS anchors (
    session_id TEXT PRIMARY KEY,
    kind TEXT NOT NULL DEFAULT 'KIND_TRANSPARENCY_LOG',
    root BYTEA,
    anchor_receipt BYTEA,
    anchored_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS anchors;
-- +goose StatementEnd
