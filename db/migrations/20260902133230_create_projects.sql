-- +goose Up
-- +goose StatementBegin
CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
-- +goose StatementEnd
-- +goose StatementBegin
CREATE INDEX idx_projects_user ON projects (user_id);
-- +goose StatementEnd
-- +goose StatementBegin
CREATE TABLE api_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
    user_id uuid NOT NULL,
    name text NOT NULL DEFAULT '',
    prefix text NOT NULL,
    last4 text NOT NULL,
    key_hash text NOT NULL UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    revoked_at timestamptz
);
-- +goose StatementEnd
-- +goose StatementBegin
CREATE INDEX idx_api_keys_project ON api_keys (project_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE api_keys;
-- +goose StatementEnd
-- +goose StatementBegin
DROP TABLE projects;
-- +goose StatementEnd
