-- +goose Up
-- +goose StatementBegin
ALTER TABLE sessions ADD COLUMN uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid();
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE grants ADD COLUMN uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid();
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE events ADD COLUMN uuid uuid NOT NULL UNIQUE DEFAULT gen_random_uuid();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE events DROP COLUMN uuid;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE grants DROP COLUMN uuid;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE sessions DROP COLUMN uuid;
-- +goose StatementEnd
