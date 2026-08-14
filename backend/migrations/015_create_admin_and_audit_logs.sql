-- +goose Up
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('passenger', 'driver', 'both', 'admin'));

ALTER TABLE drivers ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NULL,
    metadata JSONB NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON admin_audit_logs (admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON admin_audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON admin_audit_logs (entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users (is_active);
CREATE INDEX IF NOT EXISTS idx_trips_trip_status ON trips (trip_status);

-- +goose Down
DROP TABLE IF EXISTS admin_audit_logs;
ALTER TABLE drivers DROP COLUMN IF EXISTS rejection_reason;
