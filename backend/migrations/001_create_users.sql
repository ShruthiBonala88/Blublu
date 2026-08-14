-- +goose Up
-- +goose StatementBegin
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name VARCHAR(100) NOT NULL,

    phone VARCHAR(20) UNIQUE NOT NULL,

    email VARCHAR(255) UNIQUE,

    gender VARCHAR(20),

    date_of_birth DATE,

    profile_photo_url TEXT,

    role VARCHAR(20) NOT NULL DEFAULT 'passenger',

    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_role_check
        CHECK (role IN ('passenger', 'driver', 'both')),

    CONSTRAINT users_gender_check
        CHECK (gender IS NULL OR gender IN ('male', 'female', 'other'))
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS users;
-- +goose StatementEnd