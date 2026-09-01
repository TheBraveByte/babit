-- +goose Up
-- +goose StatementBegin
CREATE TABLE sessions (
    session_id text PRIMARY KEY,
    root_grant_id text NOT NULL,
    surface int NOT NULL,
    started_at timestamptz NOT NULL,
    ended_at timestamptz,
    event_count bigint NOT NULL DEFAULT 0
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE sessions;
-- +goose StatementEnd
