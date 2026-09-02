-- +goose Up
-- +goose StatementBegin
ALTER TABLE sessions ADD COLUMN user_id uuid;
-- +goose StatementEnd
-- +goose StatementBegin
ALTER TABLE grants ADD COLUMN user_id uuid;
-- +goose StatementEnd
-- +goose StatementBegin
CREATE INDEX idx_sessions_user ON sessions (user_id);
-- +goose StatementEnd
-- +goose StatementBegin
CREATE INDEX idx_grants_user ON grants (user_id);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_grants_user;
-- +goose StatementEnd
-- +goose StatementBegin
DROP INDEX IF EXISTS idx_sessions_user;
-- +goose StatementEnd
-- +goose StatementBegin
ALTER TABLE grants DROP COLUMN user_id;
-- +goose StatementEnd
-- +goose StatementBegin
ALTER TABLE sessions DROP COLUMN user_id;
-- +goose StatementEnd
