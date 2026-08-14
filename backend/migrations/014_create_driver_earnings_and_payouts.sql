-- +goose Up
CREATE TABLE IF NOT EXISTS driver_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    gross_amount NUMERIC(12,2) NOT NULL CHECK (gross_amount >= 0),
    platform_fee NUMERIC(12,2) NOT NULL DEFAULT 0.00 CHECK (platform_fee >= 0),
    net_amount NUMERIC(12,2) NOT NULL CHECK (net_amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'payable',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_driver_trip_booking UNIQUE (driver_id, trip_id, booking_id)
);

CREATE INDEX IF NOT EXISTS idx_earnings_driver ON driver_earnings (driver_id);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON driver_earnings (status);
CREATE INDEX IF NOT EXISTS idx_earnings_trip ON driver_earnings (trip_id);

CREATE TABLE IF NOT EXISTS driver_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    payment_reference VARCHAR(255) NULL,
    failure_reason TEXT NULL,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_driver ON driver_payouts (driver_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON driver_payouts (status);

-- +goose Down
DROP TABLE IF EXISTS driver_payouts;
DROP TABLE IF EXISTS driver_earnings;
