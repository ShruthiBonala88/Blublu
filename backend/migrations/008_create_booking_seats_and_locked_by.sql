-- +goose Up

-- 1. Add locked_by column to trip_seats to track lock ownership
ALTER TABLE trip_seats
    ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_trip_seats_locked_by
    ON trip_seats(locked_by);

-- 2. Modify bookings table structure to align with multi-seat bookings
ALTER TABLE bookings
    DROP CONSTRAINT IF EXISTS fk_bookings_trip_seat,
    DROP CONSTRAINT IF EXISTS unique_active_seat_booking;

ALTER TABLE bookings
    ALTER COLUMN trip_seat_id DROP NOT NULL;

ALTER TABLE bookings
    RENAME COLUMN passenger_id TO user_id;

-- 3. Create booking_seats table for multi-seat bookings
CREATE TABLE IF NOT EXISTS booking_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    trip_seat_id UUID NOT NULL REFERENCES trip_seats(id) ON DELETE RESTRICT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_booking_trip_seat UNIQUE (trip_seat_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_seats_booking_id
    ON booking_seats(booking_id);

CREATE INDEX IF NOT EXISTS idx_booking_seats_trip_seat_id
    ON booking_seats(trip_seat_id);

-- +goose Down
DROP TABLE IF EXISTS booking_seats;
ALTER TABLE trip_seats DROP COLUMN IF EXISTS locked_by;
