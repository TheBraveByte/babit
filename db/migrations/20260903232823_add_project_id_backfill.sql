-- +goose Up
-- +goose StatementBegin
ALTER TABLE sessions
    ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects (id) ON DELETE SET NULL;
-- +goose StatementEnd
-- +goose StatementBegin
ALTER TABLE grants
    ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects (id) ON DELETE SET NULL;
-- +goose StatementEnd
-- +goose StatementBegin
ALTER TABLE events
    ADD COLUMN IF NOT EXISTS project_id uuid REFERENCES projects (id) ON DELETE SET NULL;
-- +goose StatementEnd

-- Backfill all existing records under a single project for the demo user.
-- The events table has a WORM trigger, so it is disabled for the update and re-enabled.
-- +goose StatementBegin
DO $$
DECLARE
    v_user_id uuid;
    v_project_id uuid;
BEGIN
    SELECT id
    INTO v_user_id
    FROM users
    WHERE email = 'yusufakinleye144@gmail.com'
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        SELECT id
        INTO v_project_id
        FROM projects
        WHERE name = 'Brave Byte Labs Backfill'
        LIMIT 1;

        IF v_project_id IS NULL THEN
            INSERT INTO projects (user_id, name)
            VALUES (v_user_id, 'Brave Byte Labs Backfill')
            RETURNING id INTO v_project_id;
        END IF;

        UPDATE sessions SET project_id = v_project_id WHERE project_id IS NULL;
        UPDATE grants SET project_id = v_project_id WHERE project_id IS NULL;

        ALTER TABLE events DISABLE TRIGGER events_worm;
        UPDATE events SET project_id = v_project_id WHERE project_id IS NULL;
        ALTER TABLE events ENABLE TRIGGER events_worm;
    END IF;
END $$;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE events DROP COLUMN IF EXISTS project_id;
-- +goose StatementEnd
-- +goose StatementBegin
ALTER TABLE grants DROP COLUMN IF EXISTS project_id;
-- +goose StatementEnd
-- +goose StatementBegin
ALTER TABLE sessions DROP COLUMN IF EXISTS project_id;
-- +goose StatementEnd
