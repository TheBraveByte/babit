-- +goose Up
-- +goose StatementBegin
CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    account_type int NOT NULL DEFAULT 0,
    org_name text NOT NULL DEFAULT '',
    org_domain text NOT NULL DEFAULT '',
    industry text NOT NULL DEFAULT '',
    brand_company text NOT NULL DEFAULT '',
    brand_logo_url text NOT NULL DEFAULT '',
    brand_color text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE users;
-- +goose StatementEnd
