package payments

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/vikas/blublu/internal/auth"
	"github.com/vikas/blublu/internal/notifications"
)

type Repository struct {
	db              *pgxpool.Pool
	razorpayService *RazorpayService
	notifService    *notifications.Service
}

func NewRepository(db *pgxpool.Pool, rzp *RazorpayService, notifService *notifications.Service) *Repository {
	return &Repository{
		db:              db,
		razorpayService: rzp,
		notifService:    notifService,
	}
}

func (r *Repository) GetRazorpayService() *RazorpayService {
	return r.razorpayService
}

func (r *Repository) CreatePaymentOrder(ctx context.Context, bookingID, userID uuid.UUID) (*CreateOrderResponse, error) {
	if r.db == nil {
		return nil, errors.New("database connection unavailable")
	}

	// 1. Fetch booking details
	var (
		actualUserID  uuid.UUID
		bookingStatus string
		paymentStatus string
		totalAmount   float64
	)

	err := r.db.QueryRow(
		ctx,
		`SELECT user_id, booking_status, payment_status, amount FROM bookings WHERE id = $1`,
		bookingID,
	).Scan(&actualUserID, &bookingStatus, &paymentStatus, &totalAmount)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrBookingNotFound
		}
		return nil, fmt.Errorf("failed to fetch booking: %w", err)
	}

	// 2. Validation
	if userID != uuid.Nil && actualUserID != userID {
		return nil, ErrUnauthorizedBooking
	}

	if bookingStatus == "cancelled" {
		return nil, ErrBookingCancelled
	}

	if paymentStatus == "paid" {
		return nil, ErrBookingAlreadyPaid
	}

	// Calculate amount in paise (e.g. ₹300 -> 30000 paise)
	amountPaise := int64(math.Round(totalAmount * 100))

	// 3. Create Razorpay order
	razorpayOrderID, err := r.razorpayService.CreateOrder(ctx, amountPaise, "INR", bookingID.String())
	if err != nil {
		return nil, fmt.Errorf("failed to create razorpay order: %w", err)
	}

	// 4. Save to payments table
	var paymentID uuid.UUID
	err = r.db.QueryRow(
		ctx,
		`INSERT INTO payments (booking_id, user_id, amount, currency, payment_status, razorpay_order_id)
		 VALUES ($1, $2, $3, 'INR', 'pending', $4)
		 RETURNING id`,
		bookingID,
		actualUserID,
		totalAmount,
		razorpayOrderID,
	).Scan(&paymentID)

	if err != nil {
		return nil, fmt.Errorf("failed to insert payment record: %w", err)
	}

	return &CreateOrderResponse{
		PaymentID:       paymentID,
		BookingID:       bookingID,
		RazorpayOrderID: razorpayOrderID,
		Amount:          amountPaise,
		Currency:        "INR",
		RazorpayKeyID:   r.razorpayService.GetKeyID(),
	}, nil
}

func (r *Repository) VerifyPayment(ctx context.Context, razorpayOrderID, razorpayPaymentID, razorpaySignature string) (*Payment, error) {
	// 1. Verify HMAC signature
	if !r.razorpayService.VerifyPaymentSignature(razorpayOrderID, razorpayPaymentID, razorpaySignature) {
		return nil, ErrInvalidSignature
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// 2. Lock payment record FOR UPDATE
	var (
		paymentID     uuid.UUID
		bookingID     uuid.UUID
		userID        uuid.UUID
		amount        float64
		currency      string
		paymentStatus string
		createdAt     time.Time
	)

	err = tx.QueryRow(
		ctx,
		`SELECT id, booking_id, user_id, amount, currency, payment_status, created_at
		 FROM payments
		 WHERE razorpay_order_id = $1
		 FOR UPDATE`,
		razorpayOrderID,
	).Scan(&paymentID, &bookingID, &userID, &amount, &currency, &paymentStatus, &createdAt)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPaymentNotFound
		}
		return nil, fmt.Errorf("failed to fetch payment: %w", err)
	}

	ctxUserID, hasCtxUser := auth.GetUserIDFromContext(ctx)
	if hasCtxUser && !auth.ValidateOwnershipOrAdmin(ctx, userID) && ctxUserID != uuid.Nil {
		return nil, ErrUnauthorizedBooking
	}

	now := time.Now().UTC()

	// 3. Idempotent check
	if paymentStatus == "paid" {
		_ = tx.Commit(ctx)
		return &Payment{
			ID:                paymentID,
			BookingID:         bookingID,
			UserID:            userID,
			Amount:            amount,
			Currency:          currency,
			PaymentStatus:     "paid",
			RazorpayOrderID:   razorpayOrderID,
			RazorpayPaymentID: razorpayPaymentID,
			CreatedAt:         createdAt,
			UpdatedAt:         now,
		}, nil
	}

	// 4. Update payments record
	_, err = tx.Exec(
		ctx,
		`UPDATE payments
		 SET payment_status = 'paid', razorpay_payment_id = $1, razorpay_signature = $2, updated_at = NOW()
		 WHERE id = $3`,
		razorpayPaymentID,
		razorpaySignature,
		paymentID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update payment record: %w", err)
	}

	// 5. Update bookings record
	_, err = tx.Exec(
		ctx,
		`UPDATE bookings SET payment_status = 'paid', updated_at = NOW() WHERE id = $1`,
		bookingID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update booking payment status: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit payment verification transaction: %w", err)
	}

	if r.notifService != nil {
		_, _ = r.notifService.NotifyUser(ctx, userID, "payment_success", "Payment Successful", "Your payment was processed successfully.", &bookingID, nil)
	}

	return &Payment{
		ID:                paymentID,
		BookingID:         bookingID,
		UserID:            userID,
		Amount:            amount,
		Currency:          currency,
		PaymentStatus:     "paid",
		RazorpayOrderID:   razorpayOrderID,
		RazorpayPaymentID: razorpayPaymentID,
		CreatedAt:         createdAt,
		UpdatedAt:         now,
	}, nil
}

type webhookEvent struct {
	Event   string `json:"event"`
	Payload struct {
		Payment struct {
			Entity struct {
				ID      string `json:"id"`
				OrderID string `json:"order_id"`
				Amount  int64  `json:"amount"`
				Status  string `json:"status"`
			} `json:"entity"`
		} `json:"payment"`
	} `json:"payload"`
}

func (r *Repository) ProcessWebhook(ctx context.Context, body []byte, signatureHeader string) error {
	// 1. Verify webhook signature
	if !r.razorpayService.VerifyWebhookSignature(body, signatureHeader) {
		return ErrInvalidWebhookSignature
	}

	// 2. Parse event payload
	var ev webhookEvent
	if err := json.Unmarshal(body, &ev); err != nil {
		return fmt.Errorf("failed to unmarshal webhook payload: %w", err)
	}

	orderID := ev.Payload.Payment.Entity.OrderID
	paymentID := ev.Payload.Payment.Entity.ID

	if orderID == "" {
		// Non-payment event or missing order_id, acknowledge safely
		return nil
	}

	tx, err := r.db.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	var (
		pID           uuid.UUID
		bID           uuid.UUID
		currentStatus string
	)

	err = tx.QueryRow(
		ctx,
		`SELECT id, booking_id, payment_status FROM payments WHERE razorpay_order_id = $1 FOR UPDATE`,
		orderID,
	).Scan(&pID, &bID, &currentStatus)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Payment record not found for order_id, return nil (idempotent/acknowledged)
			return nil
		}
		return fmt.Errorf("failed to fetch payment for webhook: %w", err)
	}

	switch ev.Event {
	case "payment.captured":
		if currentStatus != "paid" {
			_, err = tx.Exec(
				ctx,
				`UPDATE payments SET payment_status = 'paid', razorpay_payment_id = $1, updated_at = NOW() WHERE id = $2`,
				paymentID,
				pID,
			)
			if err != nil {
				return fmt.Errorf("failed to update payment in webhook: %w", err)
			}

			_, err = tx.Exec(
				ctx,
				`UPDATE bookings SET payment_status = 'paid', updated_at = NOW() WHERE id = $1`,
				bID,
			)
			if err != nil {
				return fmt.Errorf("failed to update booking in webhook: %w", err)
			}
		}

	case "payment.failed":
		if currentStatus != "paid" {
			_, err = tx.Exec(
				ctx,
				`UPDATE payments SET payment_status = 'failed', razorpay_payment_id = $1, updated_at = NOW() WHERE id = $2`,
				paymentID,
				pID,
			)
			if err != nil {
				return fmt.Errorf("failed to update payment failed status in webhook: %w", err)
			}
		}
	}

	return tx.Commit(ctx)
}

func (r *Repository) GetPaymentByBookingID(ctx context.Context, bookingID uuid.UUID) (*Payment, error) {
	query := `
		SELECT id, booking_id, user_id, amount, currency, payment_status, COALESCE(razorpay_order_id, ''), COALESCE(razorpay_payment_id, ''), created_at, updated_at
		FROM payments
		WHERE booking_id = $1
		ORDER BY created_at DESC
		LIMIT 1
	`

	p := &Payment{}
	err := r.db.QueryRow(ctx, query, bookingID).Scan(
		&p.ID,
		&p.BookingID,
		&p.UserID,
		&p.Amount,
		&p.Currency,
		&p.PaymentStatus,
		&p.RazorpayOrderID,
		&p.RazorpayPaymentID,
		&p.CreatedAt,
		&p.UpdatedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPaymentNotFound
		}
		return nil, fmt.Errorf("failed to get payment by booking id: %w", err)
	}

	return p, nil
}
