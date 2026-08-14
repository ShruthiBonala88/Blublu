-- +goose Up

-- Add cancellation_reason to trips if missing
ALTER TABLE trips
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Update trip_status check constraint to support started, completed, cancelled, scheduled
ALTER TABLE trips
    DROP CONSTRAINT IF EXISTS trips_status_check;

ALTER TABLE trips
    ADD CONSTRAINT trips_status_check
    CHECK (trip_status IN ('scheduled', 'started', 'boarding', 'in_progress', 'completed', 'cancelled'));

-- +goose Down
ALTER TABLE trips DROP COLUMN IF EXISTS cancellation_reason;
