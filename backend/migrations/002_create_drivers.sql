-- +goose Up

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE,

    license_number VARCHAR(50) UNIQUE NOT NULL,

    license_expiry_date DATE NOT NULL,

    verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    total_rides INTEGER NOT NULL DEFAULT 0,

    average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_drivers_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT drivers_verification_status_check
        CHECK (
            verification_status IN (
                'pending',
                'verified',
                'rejected',
                'suspended'
            )
        ),

    CONSTRAINT drivers_rating_check
        CHECK (average_rating >= 0 AND average_rating <= 5)
);

CREATE INDEX idx_drivers_user_id
    ON drivers(user_id);

CREATE INDEX idx_drivers_verification_status
    ON drivers(verification_status);


-- +goose Down

DROP TABLE IF EXISTS drivers;