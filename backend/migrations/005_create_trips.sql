-- +goose Up

CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    driver_id UUID NOT NULL,

    vehicle_id UUID NOT NULL,

    origin_name VARCHAR(150) NOT NULL,

    destination_name VARCHAR(150) NOT NULL,

    origin_location GEOGRAPHY(POINT, 4326) NOT NULL,

    destination_location GEOGRAPHY(POINT, 4326) NOT NULL,

    departure_time TIMESTAMPTZ NOT NULL,

    estimated_arrival_time TIMESTAMPTZ,

    total_seats INTEGER NOT NULL,

    available_seats INTEGER NOT NULL,

    price_per_seat NUMERIC(10,2) NOT NULL,

    trip_status VARCHAR(20) NOT NULL DEFAULT 'scheduled',

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_trips_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_trips_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id)
        ON DELETE RESTRICT,

    CONSTRAINT trips_seats_check
        CHECK (
            total_seats >= 1
            AND total_seats <= 12
            AND available_seats >= 0
            AND available_seats <= total_seats
        ),

    CONSTRAINT trips_price_check
        CHECK (price_per_seat >= 0),

    CONSTRAINT trips_status_check
        CHECK (
            trip_status IN (
                'scheduled',
                'boarding',
                'in_progress',
                'completed',
                'cancelled'
            )
        ),

    CONSTRAINT trips_time_check
        CHECK (
            estimated_arrival_time IS NULL
            OR estimated_arrival_time >= departure_time
        )
);

CREATE INDEX idx_trips_driver_id
    ON trips(driver_id);

CREATE INDEX idx_trips_vehicle_id
    ON trips(vehicle_id);

CREATE INDEX idx_trips_departure_time
    ON trips(departure_time);

CREATE INDEX idx_trips_status
    ON trips(trip_status);

CREATE INDEX idx_trips_origin_location
    ON trips USING GIST(origin_location);

CREATE INDEX idx_trips_destination_location
    ON trips USING GIST(destination_location);


-- +goose Down

DROP TABLE IF EXISTS trips;