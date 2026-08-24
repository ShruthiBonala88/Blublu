package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/vikas/blublu/internal/admin"
	"github.com/vikas/blublu/internal/auth"
	"github.com/vikas/blublu/internal/bookings"
	"github.com/vikas/blublu/internal/chat"
	"github.com/vikas/blublu/internal/config"
	"github.com/vikas/blublu/internal/database"
	"github.com/vikas/blublu/internal/drivers"
	"github.com/vikas/blublu/internal/earnings"
	"github.com/vikas/blublu/internal/kyc"
	"github.com/vikas/blublu/internal/maps"
	"github.com/vikas/blublu/internal/middleware"
	"github.com/vikas/blublu/internal/notifications"
	"github.com/vikas/blublu/internal/otp"
	"github.com/vikas/blublu/internal/payments"
	"github.com/vikas/blublu/internal/ratelimit"
	"github.com/vikas/blublu/internal/reviews"
	"github.com/vikas/blublu/internal/safety"
	"github.com/vikas/blublu/internal/seats"
	"github.com/vikas/blublu/internal/tracking"
	"github.com/vikas/blublu/internal/trips"
	"github.com/vikas/blublu/internal/users"
	"github.com/vikas/blublu/internal/vehicles"
)

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintln(w, `{"status":"ok","service":"blublu-api"}`)
}

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("ℹ️  Notice: .env file not found, using OS environment variables")
	} else {
		fmt.Println("✅ Loaded environment variables from .env")
	}

	cfg := config.Load()
	if strings.TrimSpace(cfg.JWTSecret) == "" {
		cfg.JWTSecret = "blublu-dev-secret-key-32-chars-long"
	}

	jwtService, err := auth.NewJWTServiceWithSecret(cfg.JWTSecret)
	if err != nil {
		fmt.Println("Fatal startup failure initializing JWT service:", err)
		os.Exit(1)
	}

	authMiddleware := auth.NewMiddleware(jwtService)
	rateLimiter := ratelimit.NewMemoryLimiter()
	rateLimitMiddleware := ratelimit.NewMiddleware(cfg, rateLimiter)
	secMw := middleware.NewSecurityMiddleware(cfg)

	db, err := database.Connect()
	if err != nil {
		fmt.Println("⚠️  Notice: Running in Standalone API Mode (PostgreSQL offline). Connect Docker / Postgres for live DB persistence.")
	} else {
		defer db.Close()
		fmt.Println("✅ PostgreSQL connected successfully")
	}

	redisClient, err := database.NewRedisClient(cfg.RedisURL)
	if err != nil {
		fmt.Printf("⚠️  Notice: Redis offline or connection failed (%v). Running with in-memory rate limiting.\n", err)
	} else {
		fmt.Println("✅ Redis connected successfully")
		_ = redisClient
	}

	// =========================
	// REPOSITORIES & SERVICES
	// =========================

	adminRepo := admin.NewRepository(db)
	adminMiddleware := admin.NewMiddleware(db, jwtService)
	adminHandler := admin.NewHandler(adminRepo)

	routeProvider, _ := maps.NewRouteProvider()
	routeService := maps.NewService(routeProvider)
	mapsHandler := maps.NewHandler(routeService, db)

	notifRepo := notifications.NewRepository(db)
	notifService := notifications.NewService(notifRepo)
	notifHandler := notifications.NewHandler(notifRepo)

	earningsProvider := earnings.NewDevPayoutProvider()
	earningsRepo := earnings.NewRepository(db, earningsProvider)
	earningsHandler := earnings.NewHandler(earningsRepo, notifService)

	reviewRepo := reviews.NewRepository(db)
	reviewHandler := reviews.NewHandler(reviewRepo, notifService)

	otpRepo := otp.NewRepository(db)
	smsProvider := otp.CreateSMSProvider()
	otpHandler := otp.NewHandler(otpRepo, smsProvider)

	bookingRepo := bookings.NewRepository(db)
	bookingHandler := bookings.NewHandler(bookingRepo, notifService)

	rzpService := payments.NewRazorpayService()
	paymentRepo := payments.NewRepository(db, rzpService, notifService)
	paymentHandler := payments.NewHandler(paymentRepo)

	userRepo := users.NewRepository(db)
	userHandler := users.NewHandler(userRepo)

	authService := auth.NewService(db, jwtService)
	authHandler := auth.NewAuthHandler(authService, userRepo)

	chatService := chat.NewService(db)
	chatHandler := chat.NewHandler(chatService)

	trackingService := tracking.NewService(db)
	trackingHandler := tracking.NewHandler(trackingService)

	safetyService := safety.NewService(db)
	safetyHandler := safety.NewHandler(safetyService)

	kycService := kyc.NewService(db)
	kycHandler := kyc.NewHandler(kycService)

	driverRepo := drivers.NewRepository(db)
	driverHandler := drivers.NewHandler(driverRepo)

	vehicleRepo := vehicles.NewRepository(db)
	vehicleHandler := vehicles.NewHandler(vehicleRepo)

	seatRepo := seats.NewRepository(db)
	seatHandler := seats.NewHandler(seatRepo)

	tripRepo := trips.NewRepository(db)
	tripHandler := trips.NewHandler(tripRepo, notifService, routeService, earningsRepo)

	// Create ServeMux for route registration
	mux := http.NewServeMux()

	// ADMIN ROUTER
	mux.HandleFunc("/api/v1/admin/", rateLimitMiddleware.GeneralLimit(adminMiddleware.AuthenticateAdmin(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) < 4 || parts[0] != "api" || parts[1] != "v1" || parts[2] != "admin" {
			http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
			return
		}

		sub := parts[3]
		switch sub {
		case "dashboard":
			adminHandler.GetDashboard(w, r)
			return

		case "users":
			if len(parts) == 4 {
				adminHandler.GetUsers(w, r)
				return
			}
			if len(parts) >= 5 {
				userID, err := uuid.Parse(parts[4])
				if err != nil {
					http.Error(w, `{"error":"invalid user_id"}`, http.StatusBadRequest)
					return
				}
				if len(parts) == 5 {
					adminHandler.GetUserByID(w, r, userID)
					return
				}
				if len(parts) == 6 && parts[5] == "status" {
					adminHandler.UpdateUserStatus(w, r, userID)
					return
				}
			}

		case "drivers":
			if len(parts) == 4 {
				adminHandler.GetDrivers(w, r)
				return
			}
			if len(parts) >= 5 {
				driverID, err := uuid.Parse(parts[4])
				if err != nil {
					http.Error(w, `{"error":"invalid driver_id"}`, http.StatusBadRequest)
					return
				}
				if len(parts) == 5 {
					adminHandler.GetDriverByID(w, r, driverID)
					return
				}
				if len(parts) == 6 {
					switch parts[5] {
					case "approve":
						adminHandler.ApproveDriver(w, r, driverID)
						return
					case "reject":
						adminHandler.RejectDriver(w, r, driverID)
						return
					}
				}
			}

		case "vehicles":
			if len(parts) == 4 {
				adminHandler.GetVehicles(w, r)
				return
			}
			if len(parts) == 5 {
				vehicleID, err := uuid.Parse(parts[4])
				if err != nil {
					http.Error(w, `{"error":"invalid vehicle_id"}`, http.StatusBadRequest)
					return
				}
				adminHandler.GetVehicleByID(w, r, vehicleID)
				return
			}

		case "trips":
			if len(parts) == 4 {
				adminHandler.GetTrips(w, r)
				return
			}
			if len(parts) == 5 {
				tripID, err := uuid.Parse(parts[4])
				if err != nil {
					http.Error(w, `{"error":"invalid trip_id"}`, http.StatusBadRequest)
					return
				}
				adminHandler.GetTripByID(w, r, tripID)
				return
			}

		case "bookings":
			if len(parts) == 4 {
				adminHandler.GetBookings(w, r)
				return
			}
			if len(parts) == 5 {
				bookingID, err := uuid.Parse(parts[4])
				if err != nil {
					http.Error(w, `{"error":"invalid booking_id"}`, http.StatusBadRequest)
					return
				}
				adminHandler.GetBookingByID(w, r, bookingID)
				return
			}

		case "payments":
			if len(parts) == 4 {
				adminHandler.GetPayments(w, r)
				return
			}
			if len(parts) == 5 {
				paymentID, err := uuid.Parse(parts[4])
				if err != nil {
					http.Error(w, `{"error":"invalid payment_id"}`, http.StatusBadRequest)
					return
				}
				adminHandler.GetPaymentByID(w, r, paymentID)
				return
			}

		case "earnings":
			if len(parts) == 4 {
				adminHandler.GetEarnings(w, r)
				return
			}
			if len(parts) == 5 {
				earningID, err := uuid.Parse(parts[4])
				if err != nil {
					http.Error(w, `{"error":"invalid earning_id"}`, http.StatusBadRequest)
					return
				}
				adminHandler.GetEarningByID(w, r, earningID)
				return
			}

		case "payouts":
			if len(parts) == 4 {
				adminHandler.GetPayouts(w, r)
				return
			}
			if len(parts) >= 5 {
				payoutID, err := uuid.Parse(parts[4])
				if err != nil {
					http.Error(w, `{"error":"invalid payout_id"}`, http.StatusBadRequest)
					return
				}
				if len(parts) == 5 {
					adminHandler.GetPayoutByID(w, r, payoutID)
					return
				}
				if len(parts) == 6 {
					switch parts[5] {
					case "process", "approve":
						adminHandler.ProcessPayout(w, r, payoutID)
						return
					case "reject":
						adminHandler.RejectPayout(w, r, payoutID)
						return
					}
				}
			}
		}

		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	})))

	// RATINGS & REVIEWS DIRECT (AUTHENTICATED)
	mux.HandleFunc("/api/v1/ratings/", rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) == 4 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "ratings" {
			ratingID, err := uuid.Parse(parts[3])
			if err != nil {
				http.Error(w, `{"error":"invalid rating_id"}`, http.StatusBadRequest)
				return
			}
			reviewHandler.UpdateReview(w, r, ratingID)
			return
		}
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	})))

	// AUTHENTICATION ENDPOINTS
	mux.HandleFunc("/api/v1/auth/register", middleware.RequireMethods([]string{http.MethodPost}, rateLimitMiddleware.LoginLimit(authHandler.Register)))
	mux.HandleFunc("/api/v1/auth/login", middleware.RequireMethods([]string{http.MethodPost}, rateLimitMiddleware.LoginLimit(authHandler.Login)))

	// CHAT ENDPOINTS (AUTHENTICATED)
	mux.HandleFunc("/api/v1/chat/trips/", rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		// Expected path: /api/v1/chat/trips/{trip_id}/messages
		if len(parts) == 6 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "chat" && parts[3] == "trips" && parts[5] == "messages" {
			tripID, err := uuid.Parse(parts[4])
			if err != nil {
				http.Error(w, `{"error":"invalid trip_id"}`, http.StatusBadRequest)
				return
			}
			chatHandler.HandleTripMessages(w, r, tripID)
			return
		}
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	})))

	// TRACKING ENDPOINTS (AUTHENTICATED)
	mux.HandleFunc("/api/v1/tracking/trips/", rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		// Expected path: /api/v1/tracking/trips/{trip_id}/location
		if len(parts) == 6 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "tracking" && parts[3] == "trips" && parts[5] == "location" {
			tripID, err := uuid.Parse(parts[4])
			if err != nil {
				http.Error(w, `{"error":"invalid trip_id"}`, http.StatusBadRequest)
				return
			}
			trackingHandler.HandleTripLocation(w, r, tripID)
			return
		}
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	})))

	// SAFETY ENDPOINTS (AUTHENTICATED)
	mux.HandleFunc("/api/v1/safety/sos", middleware.RequireMethods([]string{http.MethodPost}, rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(safetyHandler.TriggerSOS))))
	mux.HandleFunc("/api/v1/safety/report", middleware.RequireMethods([]string{http.MethodPost}, rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(safetyHandler.SubmitReport))))
	mux.HandleFunc("/api/v1/safety/incidents", middleware.RequireMethods([]string{http.MethodGet}, rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(safetyHandler.ListIncidents))))

	// KYC ENDPOINTS (AUTHENTICATED)
	mux.HandleFunc("/api/v1/kyc/submit", middleware.RequireMethods([]string{http.MethodPost}, rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(kycHandler.SubmitKYC))))
	mux.HandleFunc("/api/v1/kyc/status", middleware.RequireMethods([]string{http.MethodGet}, rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(kycHandler.GetKYCStatus))))

	// ADMIN KYC ENDPOINTS (ADMIN ROLE ONLY)
	mux.HandleFunc("/api/v1/admin/kyc", rateLimitMiddleware.GeneralLimit(adminMiddleware.AuthenticateAdmin(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodGet {
			kycHandler.AdminListKYC(w, r)
			return
		}
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
	})))
	mux.HandleFunc("/api/v1/admin/kyc/", rateLimitMiddleware.GeneralLimit(adminMiddleware.AuthenticateAdmin(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		// /api/v1/admin/kyc/{id}/review
		if len(parts) == 6 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "admin" && parts[3] == "kyc" && parts[5] == "review" {
			subID, err := uuid.Parse(parts[4])
			if err != nil {
				http.Error(w, `{"error":"invalid submission_id"}`, http.StatusBadRequest)
				return
			}
			kycHandler.AdminReviewKYC(w, r, subID)
			return
		}
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	})))

	// ROUTE & MAPS ENDPOINTS (PUBLIC)
	mux.HandleFunc("/api/v1/route/calculate", middleware.RequireMethods([]string{http.MethodPost}, mapsHandler.CalculateRoute))

	// OTP ENDPOINTS (PROTECTED BY OTP RATE LIMITER & METHOD VALIDATION)
	mux.HandleFunc("/api/v1/otp/request", middleware.RequireMethods([]string{http.MethodPost}, rateLimitMiddleware.OTPLimit(otpHandler.RequestOTP)))
	mux.HandleFunc("/api/v1/otp/verify", middleware.RequireMethods([]string{http.MethodPost}, rateLimitMiddleware.OTPLimit(otpHandler.VerifyOTP)))

	// USERS & PASSENGER BOOKINGS/RIDES/NOTIFICATIONS/REVIEWS
	mux.HandleFunc("/api/v1/users", middleware.RequireMethods([]string{http.MethodPost}, rateLimitMiddleware.LoginLimit(userHandler.Create)))
	mux.HandleFunc("/api/v1/users/", rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 4 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "users" {
			userID, err := uuid.Parse(parts[3])
			if err != nil {
				http.Error(w, `{"error":"invalid user_id"}`, http.StatusBadRequest)
				return
			}

			if !auth.ValidateOwnershipOrAdmin(r.Context(), userID) {
				http.Error(w, `{"error":"forbidden: resource does not belong to user"}`, http.StatusForbidden)
				return
			}

			if len(parts) == 5 && parts[4] == "reviews" {
				reviewHandler.GetUserReviews(w, r, userID)
				return
			}

			if len(parts) >= 5 && parts[4] == "notifications" {
				if len(parts) == 5 {
					notifHandler.ListByUser(w, r, userID)
					return
				}
				if len(parts) == 6 {
					if parts[5] == "unread" {
						notifHandler.GetUnread(w, r, userID)
						return
					}
					if parts[5] == "read-all" {
						notifHandler.MarkAllAsRead(w, r, userID)
						return
					}
					notifID, err := uuid.Parse(parts[5])
					if err != nil {
						http.Error(w, `{"error":"invalid notification_id"}`, http.StatusBadRequest)
						return
					}
					notifHandler.MarkAsRead(w, r, userID, notifID)
					return
				}
				if len(parts) == 7 && parts[6] == "read" {
					notifID, err := uuid.Parse(parts[5])
					if err != nil {
						http.Error(w, `{"error":"invalid notification_id"}`, http.StatusBadRequest)
						return
					}
					notifHandler.MarkAsRead(w, r, userID, notifID)
					return
				}
			}

			if len(parts) >= 5 && parts[4] == "bookings" {
				if len(parts) == 5 {
					bookingHandler.ListByUserPaginated(w, r, userID)
					return
				}
				if len(parts) >= 6 {
					bookingID, err := uuid.Parse(parts[5])
					if err != nil {
						http.Error(w, `{"error":"invalid booking_id"}`, http.StatusBadRequest)
						return
					}
					if len(parts) == 6 {
						bookingHandler.GetPassengerBookingByID(w, r, userID, bookingID)
						return
					}
					if len(parts) == 7 && parts[6] == "cancel" {
						bookingHandler.CancelPassengerBooking(w, r, userID, bookingID)
						return
					}
				}
			}

			if len(parts) >= 5 && parts[4] == "rides" {
				if len(parts) == 5 {
					bookingHandler.ListPassengerRides(w, r, userID, "all")
					return
				}
				if len(parts) == 6 {
					switch parts[5] {
					case "upcoming":
						bookingHandler.ListPassengerRides(w, r, userID, "upcoming")
						return
					case "active":
						bookingHandler.ListPassengerRides(w, r, userID, "active")
						return
					case "completed":
						bookingHandler.ListPassengerRides(w, r, userID, "completed")
						return
					case "cancelled":
						bookingHandler.ListPassengerRides(w, r, userID, "cancelled")
						return
					}
				}
			}
		}

		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	})))

	// BOOKINGS & BOOKING PAYMENTS / OTP RIDE VERIFY / RATINGS
	mux.HandleFunc("/api/v1/bookings", rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(bookingHandler.Create)))
	mux.HandleFunc("/api/v1/bookings/", rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 4 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "bookings" {
			bookingID, err := uuid.Parse(parts[3])
			if err != nil {
				http.Error(w, `{"error":"invalid booking_id"}`, http.StatusBadRequest)
				return
			}

			if len(parts) == 4 {
				bookingHandler.GetByID(w, r)
				return
			}

			if len(parts) == 5 && parts[4] == "rating" {
				reviewHandler.RateDriver(w, r, bookingID)
				return
			}

			if len(parts) == 5 && parts[4] == "verify-ride-otp" {
				otpHandler.VerifyRideOTP(w, r, bookingID)
				return
			}

			if len(parts) == 5 && parts[4] == "cancel" {
				bookingHandler.Cancel(w, r, bookingID)
				return
			}

			if len(parts) == 5 && parts[4] == "payment" {
				paymentHandler.GetByBookingID(w, r, bookingID)
				return
			}

			if len(parts) == 6 && parts[4] == "payment" && parts[5] == "order" {
				paymentHandler.CreateOrder(w, r, bookingID)
				return
			}
		}

		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	})))

	// DRIVER BOOKING RATING
	mux.HandleFunc("/api/v1/driver/bookings/", rateLimitMiddleware.GeneralLimit(authMiddleware.RequireAnyRole([]string{"driver", "admin"}, func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) == 6 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "driver" && parts[3] == "bookings" && parts[5] == "rating" {
			bookingID, err := uuid.Parse(parts[4])
			if err != nil {
				http.Error(w, `{"error":"invalid booking_id"}`, http.StatusBadRequest)
				return
			}
			reviewHandler.RatePassenger(w, r, bookingID)
			return
		}
		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	})))

	// PAYMENTS DIRECT
	mux.HandleFunc("/api/v1/payments/verify", middleware.RequireMethods([]string{http.MethodPost}, rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(paymentHandler.VerifyPayment))))
	mux.HandleFunc("/api/v1/payments/webhook", middleware.RequireMethods([]string{http.MethodPost}, paymentHandler.HandleWebhook))

	// DRIVERS & DRIVER TRIPS / RATINGS / REVIEWS / EARNINGS / PAYOUTS
	mux.HandleFunc("/api/v1/drivers", rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(driverHandler.Create)))
	mux.HandleFunc("/api/v1/drivers/", rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 4 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "drivers" {
			driverID, err := uuid.Parse(parts[3])
			if err != nil {
				http.Error(w, `{"error":"invalid driver_id"}`, http.StatusBadRequest)
				return
			}

			isOwner := auth.ValidateOwnershipOrAdmin(r.Context(), driverID)
			if !isOwner && db != nil {
				var driverUserID uuid.UUID
				err := db.QueryRow(r.Context(), `SELECT user_id FROM drivers WHERE id = $1`, driverID).Scan(&driverUserID)
				if err == nil {
					isOwner = auth.ValidateOwnershipOrAdmin(r.Context(), driverUserID)
				}
			}

			if !isOwner && db != nil {
				http.Error(w, `{"error":"forbidden: driver resource does not belong to user"}`, http.StatusForbidden)
				return
			}

			if len(parts) == 6 && parts[4] == "earnings" && parts[5] == "summary" {
				earningsHandler.GetEarningsSummary(w, r, driverID)
				return
			}

			if len(parts) == 5 && parts[4] == "earnings" {
				earningsHandler.GetEarningsHistory(w, r, driverID)
				return
			}

			if len(parts) == 5 && parts[4] == "payouts" {
				if r.Method == http.MethodPost {
					earningsHandler.RequestPayout(w, r, driverID)
					return
				}
				earningsHandler.GetPayouts(w, r, driverID)
				return
			}

			if len(parts) == 6 && parts[4] == "payouts" {
				payoutID, err := uuid.Parse(parts[5])
				if err != nil {
					http.Error(w, `{"error":"invalid payout_id"}`, http.StatusBadRequest)
					return
				}
				earningsHandler.GetPayoutByID(w, r, driverID, payoutID)
				return
			}

			if len(parts) == 5 && parts[4] == "rating" {
				reviewHandler.GetDriverRatingSummary(w, r, driverID)
				return
			}

			if len(parts) == 5 && parts[4] == "reviews" {
				reviewHandler.GetDriverReviews(w, r, driverID)
				return
			}

			if len(parts) >= 5 && parts[4] == "trips" {
				if len(parts) == 5 {
					tripHandler.ListByDriver(w, r, driverID)
					return
				}

				if len(parts) == 6 {
					tripID, err := uuid.Parse(parts[5])
					if err != nil {
						http.Error(w, `{"error":"invalid trip_id"}`, http.StatusBadRequest)
						return
					}
					tripHandler.GetDriverTripByID(w, r, driverID, tripID)
					return
				}
			}
		}

		http.Error(w, `{"error":"not found"}`, http.StatusNotFound)
	})))

	// VEHICLES
	mux.HandleFunc("/api/v1/vehicles", rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(vehicleHandler.Create)))

	// VEHICLE SEATS
	mux.HandleFunc(
		"/api/v1/vehicles/",
		rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
			if len(r.URL.Path) >= len("/api/v1/vehicles/") {
				seatHandler.ListByVehicle(w, r)
				return
			}
		})),
	)

	// TRIPS
	mux.HandleFunc("/api/v1/trips", rateLimitMiddleware.GeneralLimit(authMiddleware.RequireAnyRole([]string{"driver", "admin"}, tripHandler.Create)))
	mux.HandleFunc("/api/v1/trips/search", tripHandler.Search)
	mux.HandleFunc("/api/v1/trips/", func(w http.ResponseWriter, r *http.Request) {
		parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
		if len(parts) >= 4 && parts[0] == "api" && parts[1] == "v1" && parts[2] == "trips" {
			if parts[3] == "search" {
				tripHandler.Search(w, r)
				return
			}

			tripID, err := uuid.Parse(parts[3])
			if err != nil {
				http.Error(w, `{"error":"invalid trip_id"}`, http.StatusBadRequest)
				return
			}

			if len(parts) == 5 && parts[4] == "route" {
				mapsHandler.GetTripRoute(w, r, tripID)
				return
			}

			if len(parts) == 5 {
				switch parts[4] {
				case "start", "complete", "cancel":
					rateLimitMiddleware.GeneralLimit(authMiddleware.Authenticate(func(w http.ResponseWriter, r *http.Request) {
						switch parts[4] {
						case "start":
							tripHandler.StartTrip(w, r, tripID)
						case "complete":
							tripHandler.CompleteTrip(w, r, tripID)
						case "cancel":
							tripHandler.CancelTrip(w, r, tripID)
						}
					}))(w, r)
					return
				}
			}
		}

		tripHandler.GetByID(w, r)
	})

	// ROOT WELCOME ENDPOINT
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{
  "service": "Blublu API Server",
  "status": "online",
  "version": "1.0.0",
  "health": "/health",
  "api": "/api/v1",
  "message": "Welcome to Blublu Backend API 🚀"
}`))
	})

	// HEALTH CHECK
	mux.HandleFunc("/health", healthHandler)

	// Wrap ServeMux with global security middleware chain: RequestID -> Recovery -> SecurityHeaders -> CORS -> RequestBodyLimit
	globalHandler := middleware.Chain(
		mux,
		secMw.RequestID,
		secMw.Recovery,
		secMw.SecurityHeaders,
		secMw.CORS,
		secMw.RequestBodyLimit,
	)

	port := strings.TrimSpace(cfg.Port)
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           globalHandler,
		ReadTimeout:       10 * time.Second,
		ReadHeaderTimeout: 5 * time.Second,
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
	}

	idleConnsClosed := make(chan struct{})
	go func() {
		sigint := make(chan os.Signal, 1)
		signal.Notify(sigint, os.Interrupt, syscall.SIGTERM)
		<-sigint

		fmt.Println("\nShutting down server gracefully...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		if err := server.Shutdown(ctx); err != nil {
			fmt.Printf("HTTP server Shutdown error: %v\n", err)
		}
		close(idleConnsClosed)
	}()

	fmt.Printf("🚀 Blublu API Server running on http://localhost:%s\n", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		fmt.Printf("HTTP server ListenAndServe error: %v\n", err)
	}

	<-idleConnsClosed
	fmt.Println("Server stopped cleanly.")
}
