-- +goose Up
-- +goose StatementBegin
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_razorpay_order_id 
ON payments (razorpay_order_id) 
WHERE razorpay_order_id IS NOT NULL AND razorpay_order_id != '';
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP INDEX IF EXISTS uq_payments_razorpay_order_id;
-- +goose StatementEnd
