-- +goose Up
CREATE TABLE IF NOT EXISTS ratings_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    reviewer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_booking_reviewer UNIQUE (booking_id, reviewer_user_id),
    CONSTRAINT prevent_self_review CHECK (reviewer_user_id <> reviewee_user_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_reviewee ON ratings_reviews (reviewee_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewer ON ratings_reviews (reviewer_user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_booking ON ratings_reviews (booking_id);

-- +goose Down
DROP TABLE IF EXISTS ratings_reviews;
