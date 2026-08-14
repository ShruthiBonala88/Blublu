-- +goose Up
ALTER TABLE trips
    ADD COLUMN IF NOT EXISTS distance_meters BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS duration_seconds BIGINT NOT NULL DEFAULT 0;

-- +goose Down
ALTER TABLE trips
    DROP COLUMN IF EXISTS distance_meters,
    DROP COLUMN IF EXISTS duration_seconds;
