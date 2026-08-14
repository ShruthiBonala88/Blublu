-- +goose Up

CREATE TABLE trip_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    trip_id UUID NOT NULL,

    vehicle_seat_id UUID NOT NULL,

    seat_status VARCHAR(20) NOT NULL DEFAULT 'available',

    locked_until TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_trip_seats_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trip_seats_vehicle_seat
        FOREIGN KEY (vehicle_seat_id)
        REFERENCES vehicle_seats(id)
        ON DELETE RESTRICT,

    CONSTRAINT trip_seats_status_check
        CHECK (
            seat_status IN (
                'available',
                'locked',
                'booked',
                'unavailable'
            )
        ),

    CONSTRAINT unique_trip_vehicle_seat
        UNIQUE (trip_id, vehicle_seat_id),

    CONSTRAINT unique_trip_seat_number
        UNIQUE (trip_id, vehicle_seat_id)
);

CREATE INDEX idx_trip_seats_trip_id
    ON trip_seats(trip_id);

CREATE INDEX idx_trip_seats_status
    ON trip_seats(trip_id, seat_status);

CREATE INDEX idx_trip_seats_locked_until
    ON trip_seats(locked_until);


-- +goose Down

DROP TABLE IF EXISTS trip_seats;