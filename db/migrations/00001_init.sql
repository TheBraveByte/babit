-- +goose Up
CREATE TABLE sessions (
    session_id text PRIMARY KEY,
    root_grant_id text NOT NULL,
    surface int NOT NULL,
    started_at timestamptz NOT NULL,
    ended_at timestamptz,
    event_count bigint NOT NULL DEFAULT 0
);

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

CREATE TABLE revocations (
    grant_id text PRIMARY KEY,
    reason text NOT NULL DEFAULT '',
    revoked_at timestamptz NOT NULL DEFAULT now()
);

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

-- +goose StatementBegin
CREATE FUNCTION events_worm() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'events are write-once: % rejected', TG_OP;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

CREATE TRIGGER events_worm_guard
    BEFORE UPDATE OR DELETE ON events
    FOR EACH ROW
    EXECUTE FUNCTION events_worm();

-- +goose Down
DROP TRIGGER IF EXISTS events_worm_guard ON events;
DROP FUNCTION IF EXISTS events_worm();
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS revocations;
DROP TABLE IF EXISTS grants;
DROP TABLE IF EXISTS sessions;
