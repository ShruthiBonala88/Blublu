-- +goose Up

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    driver_id UUID NOT NULL,

    vehicle_type VARCHAR(30) NOT NULL,

    make VARCHAR(50) NOT NULL,

    model VARCHAR(50) NOT NULL,

    manufacture_year INTEGER,

    registration_number VARCHAR(30) UNIQUE NOT NULL,

    color VARCHAR(30),

    total_seats INTEGER NOT NULL,

    has_ac BOOLEAN NOT NULL DEFAULT FALSE,

    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_vehicles_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE,

    CONSTRAINT vehicles_type_check
        CHECK (
            vehicle_type IN (
                'car',
                'suv',
                'van'
            )
        ),

    CONSTRAINT vehicles_seats_check
        CHECK (total_seats >= 1 AND total_seats <= 12),

    CONSTRAINT vehicles_year_check
        CHECK (
            manufacture_year IS NULL
            OR manufacture_year >= 1980
        ),

    CONSTRAINT vehicles_verification_status_check
        CHECK (
            verification_status IN (
                'pending',
                'verified',
                'rejected',
                'suspended'
            )
        )
);

CREATE INDEX idx_vehicles_driver_id
    ON vehicles(driver_id);

CREATE INDEX idx_vehicles_active
    ON vehicles(is_active);

CREATE INDEX idx_vehicles_verification_status
    ON vehicles(verification_status);


-- +goose Down

DROP TABLE IF EXISTS vehicles;