-- +goose Up
-- +goose StatementBegin
CREATE TABLE revocations (
    grant_id text PRIMARY KEY,
    reason text NOT NULL DEFAULT '',
    revoked_at timestamptz NOT NULL DEFAULT now()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE revocations;
-- +goose StatementEnd
