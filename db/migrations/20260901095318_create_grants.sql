-- +goose Up
-- +goose StatementBegin
CREATE TABLE grants (
    grant_id text PRIMARY KEY,
    parent_grant_id text NOT NULL DEFAULT '',
    principal_id text NOT NULL,
    subject_id text NOT NULL,
    capabilities text[] NOT NULL DEFAULT '{}',
    resource_globs text[] NOT NULL DEFAULT '{}',
    max_value_cents bigint NOT NULL DEFAULT 0,
    max_depth int NOT NULL DEFAULT 0,
    expires_at timestamptz,
    parent_signature bytea
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE grants;
-- +goose StatementEnd
