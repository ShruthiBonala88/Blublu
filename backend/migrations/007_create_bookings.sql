-- +goose Up

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    trip_id UUID NOT NULL,

    trip_seat_id UUID NOT NULL,

    passenger_id UUID NOT NULL,

    booking_status VARCHAR(20) NOT NULL DEFAULT 'pending',

    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',

    amount NUMERIC(10,2) NOT NULL,

    booked_at TIMESTAMPTZ,

    cancelled_at TIMESTAMPTZ,

    cancellation_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_bookings_trip
        FOREIGN KEY (trip_id)
        REFERENCES trips(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_bookings_trip_seat
        FOREIGN KEY (trip_seat_id)
        REFERENCES trip_seats(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_bookings_passenger
        FOREIGN KEY (passenger_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT bookings_status_check
        CHECK (
            booking_status IN (
                'pending',
                'confirmed',
                'cancelled',
                'completed'
            )
        ),

    CONSTRAINT bookings_payment_status_check
        CHECK (
            payment_status IN (
                'pending',
                'paid',
                'failed',
                'refunded'
            )
        ),

    CONSTRAINT bookings_amount_check
        CHECK (amount >= 0),

    CONSTRAINT unique_active_seat_booking
        UNIQUE (trip_seat_id, booking_status)
);

CREATE INDEX idx_bookings_trip_id
    ON bookings(trip_id);

CREATE INDEX idx_bookings_passenger_id
    ON bookings(passenger_id);

CREATE INDEX idx_bookings_status
    ON bookings(booking_status);

CREATE INDEX idx_bookings_payment_status
    ON bookings(payment_status);


-- +goose Down

DROP TABLE IF EXISTS bookings;