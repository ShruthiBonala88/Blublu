# Blublu Ride-Sharing Backend

A high-performance, zero-cost, free-tier-ready Go ride-sharing backend supporting PostgreSQL + PostGIS, Redis, OSRM OpenStreetMap routing, Razorpay sandbox payments, real-time chat, driver location tracking, safety SOS triggers, and driver KYC management.

---

## Architecture & Technology Stack

- **Core Language**: Go 1.26+
- **Database**: PostgreSQL 15+ with PostGIS extension (Port `5433`)
- **Cache & Rate Limiting**: Redis (Port `6379`)
- **Routing & Maps**: OpenStreetMap OSRM (100% Free - No paid API keys required)
- **Payments**: Razorpay Test/Sandbox Mode (`PAYMENT_ENV=test`)
- **Authentication**: JWT (HS256) with 24-hour expiration & role authorization

---

## Local Development Setup

### 1. Start Infrastructure via Docker

```powershell
docker compose up -d
```

This starts:
- `blublu-postgres` (PostgreSQL + PostGIS on `localhost:5433`)
- `blublu-redis` (Redis on `localhost:6379`)

### 2. Environment Configuration

Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

Ensure `.env` contains development settings:
```env
PORT=8080
DATABASE_URL=postgres://blublu:blublu_dev_password@localhost:5433/blublu?sslmode=disable
REDIS_URL=redis://127.0.0.1:6379
APP_ENV=development
PAYMENT_ENV=test
JWT_SECRET=replace-with-a-long-random-secret
```

### 3. Database Migrations

Migrations run automatically via goose or can be checked against schema `001_create_users.sql` through `017_create_chat_messages.sql`.

### 4. Run the API Server

```powershell
go run ./cmd/server
```

Expected startup output:
```text
✅ Loaded environment variables from .env
✅ PostgreSQL connected successfully
✅ Redis connected successfully
🚀 Blublu API Server running on http://localhost:8080
```

---

## API Testing & Verification

### Health Check

```powershell
curl http://localhost:8080/health
```
Response: `{"status":"ok","service":"blublu-api"}`

### Run Unit Tests

```powershell
go fmt ./...
go vet ./...
go test ./...
```

---

## Key Modules & Endpoints

- **Auth**: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`
- **Route Calculation**: `POST /api/v1/route/calculate`
- **Trips**: `POST /api/v1/trips`, `GET /api/v1/trips/search`
- **Bookings**: `POST /api/v1/bookings`, `GET /api/v1/bookings/{id}`
- **Payments**: `POST /api/v1/bookings/{id}/payment/order`, `POST /api/v1/payments/verify`
- **Chat**: `POST/GET /api/v1/chat/trips/{trip_id}/messages`
- **Tracking**: `POST/GET /api/v1/tracking/trips/{trip_id}/location`
- **Safety**: `POST /api/v1/safety/sos`, `POST /api/v1/safety/report`
- **KYC**: `POST /api/v1/kyc/submit`, `GET /api/v1/kyc/status`
- **Admin**: `GET /api/v1/admin/dashboard`, `POST /api/v1/admin/drivers/{id}/approve`

---

## Security Guidelines

- Never commit real production credentials to source control.
- `JWT_SECRET` is read dynamically from the environment.
- Razorpay remains in sandbox test mode (`PAYMENT_ENV=test`).
