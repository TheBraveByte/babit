-- +goose Up
-- +goose StatementBegin
CREATE TABLE events (
    event_id text PRIMARY KEY,
    session_id text NOT NULL,
    sequence bigint NOT NULL,
    surface int NOT NULL,
    action_type text NOT NULL,
    action_payload bytea,
    grant_id text NOT NULL,
    pre_state_hash bytea,
    post_state_hash bytea,
    recording_ref text NOT NULL DEFAULT '',
    occurred_at timestamptz NOT NULL,
    content_hash bytea NOT NULL,
    prev_hash bytea NOT NULL,
    notary_signature bytea NOT NULL,
    UNIQUE (session_id, sequence)
);
-- +goose StatementEnd

-- +goose StatementBegin
CREATE FUNCTION events_block_mutation() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'events is append-only (WORM): % is not permitted', TG_OP;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TRIGGER events_worm
    BEFORE UPDATE OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION events_block_mutation();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER events_worm ON events;
-- +goose StatementEnd

-- +goose StatementBegin
DROP FUNCTION events_block_mutation();
-- +goose StatementEnd

-- +goose StatementBegin
DROP TABLE events;
-- +goose StatementEnd
