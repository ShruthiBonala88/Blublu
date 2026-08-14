-- +goose Up

CREATE TABLE vehicle_seats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    vehicle_id UUID NOT NULL,

    seat_number INTEGER NOT NULL,

    seat_position VARCHAR(20) NOT NULL,

    is_window_seat BOOLEAN NOT NULL DEFAULT FALSE,

    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_vehicle_seats_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id)
        ON DELETE CASCADE,

    CONSTRAINT vehicle_seats_number_check
        CHECK (seat_number >= 1 AND seat_number <= 12),

    CONSTRAINT vehicle_seats_position_check
        CHECK (
            seat_position IN (
                'front_left',
                'front_right',
                'middle_left',
                'middle_center',
                'middle_right',
                'rear_left',
                'rear_center',
                'rear_right'
            )
        ),

    CONSTRAINT unique_vehicle_seat_number
        UNIQUE (vehicle_id, seat_number)
);

CREATE INDEX idx_vehicle_seats_vehicle_id
    ON vehicle_seats(vehicle_id);

CREATE INDEX idx_vehicle_seats_available
    ON vehicle_seats(vehicle_id, is_available);


-- +goose Down

DROP TABLE IF EXISTS vehicle_seats;