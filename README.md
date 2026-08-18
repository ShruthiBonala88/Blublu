# 🚗 Blublu — Full-Stack Ride-Sharing Platform

[![Go Version](https://img.shields.io/badge/Go-1.26%2B-00ADD8?style=flat&logo=go)](https://go.dev/)
[![Expo](https://img.shields.io/badge/Expo-v54-000000?style=flat&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17%20%2B%20PostGIS-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-v8.0-DC382D?style=flat&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://www.docker.com/)

**Blublu** is a high-performance, production-ready, zero-cost free-tier compatible ride-sharing platform. It features a scalable **Go** backend leveraging **PostgreSQL + PostGIS** for spatial geospatial queries, **Redis** for rate-limiting & caching, **OSRM (Open Source Routing Machine)** for free turn-by-turn routing, **Razorpay Sandbox** for payments, real-time driver location tracking, in-app messaging, driver KYC verification, safety SOS triggers, and a cross-platform **React Native (Expo)** mobile application.

---

## 📸 Key Features

### 🚘 Rider Features
- **Smart Route Calculation**: Distance & duration estimation powered by open-source OSRM routing.
- **Trip Search & Booking**: Real-time pickup/drop-off matching, seat selection, and booking management.
- **In-App Payment Integration**: Razorpay payment gateway support in sandbox/test mode.
- **Live Location Tracking**: Real-time driver location updates during active trips.
- **In-App Messaging**: Instant chat between riders and drivers for pickup coordination.
- **Safety & Emergency SOS**: Instant SOS alerts and safety reporting mechanism for rider protection.

### 🚙 Driver & Partner Platform
- **Vehicle & Seat Management**: Multi-vehicle registration and seat capacity configuration.
- **KYC Verification Workflow**: Upload identity and driver license documents for admin approval.
- **Trip Management**: Schedule upcoming trips, manage route waypoints, and view rider bookings.
- **Earnings & Payouts**: Real-time trackable earnings dashboard and payout management.

### 🛡️ Admin & Operational Controls
- **Driver KYC Management**: Review and approve/reject driver applications.
- **System Dashboard**: Monitoring overall system health, active trips, and platform metrics.
- **Security & Authorization**: Role-based access control (RBAC) via secure JWT authentication.

---

## 🛠️ Architecture & Tech Stack

```
                                  +-----------------------+
                                  |   Mobile App (Expo)   |
                                  | React Native + TS     |
                                  +-----------+-----------+
                                              |
                                              | REST API / WebSockets
                                              v
                                  +-----------------------+
                                  |   Go Backend API      |
                                  |   (High Performance)  |
                                  +----+-------------+----+
                                       |             |
                     +-----------------+             +-----------------+
                     |                                                 |
                     v                                                 v
        +-------------------------+                       +-------------------------+
        |  PostgreSQL + PostGIS   |                       |    Redis Cache & Pub    |
        |  (Geospatial Storage)   |                       |  (Rate Limiting/State)  |
        +-------------------------+                       +-------------------------+
                     |
                     v
        +-------------------------+
        |   OSRM Routing Engine   |
        |   (OpenStreetMap Data)  |
        +-------------------------+
```

### Stack Breakdown

| Component | Technology | Description |
|---|---|---|
| **Backend Core** | Go 1.26 | Standard library `net/http` with high throughput and minimal latency |
| **Database** | PostgreSQL 17 + PostGIS 3.5 | Relational data persistence with geospatial indexing & distance queries |
| **Cache & Rate-Limit** | Redis 8 | Token bucket rate limiting, session storage, and pub/sub caching |
| **Routing & Maps** | OpenStreetMap OSRM | Zero-cost route distance, duration, and geometry calculation |
| **Payment Gateway** | Razorpay Sandbox | Secure order creation and payment signature verification |
| **Mobile App** | React Native 0.81 + Expo 54 | Cross-platform (Android, iOS, Web) with Expo Router |
| **Security** | JWT (HS256) | Stateless authentication with 24-hour expiration & role claims |

---

## 📂 Project Structure

```text
Blublu/
├── backend/                  # Go Backend Microservice / API
│   ├── cmd/
│   │   └── server/          # Application entry point (main.go)
│   ├── config/              # Configuration loading & environment parser
│   ├── docs/                # API documentation & architecture specs
│   ├── internal/            # Core business domain logic
│   │   ├── admin/           # Admin dashboard & driver approvals
│   │   ├── auth/            # Authentication & JWT handlers
│   │   ├── bookings/        # Booking creation, status & lifecycle
│   │   ├── chat/            # In-trip messaging handlers
│   │   ├── database/        # PostgreSQL / PostGIS connection pool
│   │   ├── drivers/         # Driver profile & vehicle management
│   │   ├── earnings/        # Driver earnings aggregation
│   │   ├── kyc/             # Driver KYC submission & review logic
│   │   ├── maps/            # OSRM routing integration
│   │   ├── matching/        # Rider-driver matching algorithm
│   │   ├── middleware/      # JWT auth, rate limiter & CORS middleware
│   │   ├── notifications/   # Push & SMS notification services
│   │   ├── payments/        # Razorpay payment orders & verification
│   │   ├── ratelimit/       # Redis-backed rate limiting logic
│   │   ├── reviews/         # Rating & review system
│   │   ├── safety/          # SOS alerts & incident reporting
│   │   ├── search/          # Spatial ride search queries
│   │   ├── tracking/        # Live driver GPS location tracking
│   │   ├── trips/           # Trip scheduling & management
│   │   └── users/           # User profile & credentials management
│   ├── migrations/          # SQL database migration files (goose format)
│   ├── pkg/                 # Exportable helper packages
│   └── README.md            # Detailed Backend Guide
├── mobile/                  # React Native Mobile App (Expo)
│   ├── app/                 # Expo Router file-based screens & navigation
│   ├── assets/              # Static media, icons & splash images
│   ├── src/                 # Reusable components, hooks & API clients
│   ├── app.json             # Expo configuration manifest
│   ├── package.json         # Node.js dependencies
│   └── README.md            # Detailed Mobile Client Guide
├── docker-compose.yml       # Docker orchestration for PostgreSQL & Redis
└── README.md                # Root Project Documentation (This File)
```

---

## 🚀 Quick Start Guide

### Prerequisites

Ensure you have the following tools installed locally:
- [Docker & Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Go 1.26+](https://go.dev/dl/)
- [Node.js (v18+) & npm](https://nodejs.org/)
- [Expo Go App](https://expo.dev/go) (for physical mobile device testing) or Android Studio / Xcode

---

### Step 1: Start Infrastructure Services

Spin up the required database and cache containers via Docker Compose:

```bash
docker compose up -d
```

This launches:
- **PostgreSQL 17 + PostGIS 3.5**: Accessible at `localhost:5433`
- **Redis 8**: Accessible at `localhost:6379`

---

### Step 2: Configure & Start the Backend

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   # Windows (PowerShell)
   Copy-Item .env.example .env

   # Linux / macOS
   cp .env.example .env
   ```

3. Ensure `.env` is configured for local development:
   ```env
   PORT=8080
   DATABASE_URL=postgres://blublu:blublu_dev_password@localhost:5433/blublu?sslmode=disable
   REDIS_URL=redis://127.0.0.1:6379
   APP_ENV=development
   PAYMENT_ENV=test
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. Run unit tests to verify system integrity:
   ```bash
   go test ./...
   ```

5. Launch the Go API server:
   ```bash
   go run ./cmd/server
   ```

   *Expected Server Output:*
   ```text
   ✅ Loaded environment variables from .env
   ✅ PostgreSQL connected successfully
   ✅ Redis connected successfully
   🚀 Blublu API Server running on http://localhost:8080
   ```

---

### Step 3: Run the Mobile Application

1. Open a new terminal and navigate to the `mobile/` directory:
   ```bash
   cd mobile
   ```

2. Install client dependencies:
   ```bash
   npm install
   ```

3. Start the Expo development server:
   ```bash
   npx expo start
   ```

4. Scan the QR code using **Expo Go** on your Android/iOS device, or press `a` for Android Emulator / `i` for iOS Simulator / `w` for Web.

---

## 📡 API Endpoints Overview

| Category | Endpoint | Method | Description | Access |
|---|---|---|---|---|
| **Health** | `/health` | `GET` | Server health & readiness check | Public |
| **Auth** | `/api/v1/auth/register` | `POST` | User registration (Rider/Driver) | Public |
| **Auth** | `/api/v1/auth/login` | `POST` | User login & JWT issuance | Public |
| **Route** | `/api/v1/route/calculate` | `POST` | OSRM distance/time calculation | Authenticated |
| **Trips** | `/api/v1/trips` | `POST` | Driver schedules new trip | Driver |
| **Trips** | `/api/v1/trips/search` | `GET` | Spatial ride search | Authenticated |
| **Bookings**| `/api/v1/bookings` | `POST` | Reserve seats on a trip | Rider |
| **Payments**| `/api/v1/bookings/{id}/payment/order` | `POST` | Generate Razorpay order | Rider |
| **Payments**| `/api/v1/payments/verify` | `POST` | Confirm Razorpay signature | Rider |
| **Chat** | `/api/v1/chat/trips/{id}/messages` | `GET/POST` | In-trip chat messages | Trip Participants |
| **Tracking**| `/api/v1/tracking/trips/{id}/location` | `GET/POST` | Driver live GPS location stream | Trip Participants |
| **Safety** | `/api/v1/safety/sos` | `POST` | Trigger emergency SOS signal | Authenticated |
| **KYC** | `/api/v1/kyc/submit` | `POST` | Driver uploads identity docs | Driver |
| **Admin** | `/api/v1/admin/drivers/{id}/approve` | `POST` | Approve driver verification | Admin |

---

## 🧪 Testing & Quality Assurance

Run all backend Go tests:
```bash
cd backend
go test -v -cover ./...
```

Format & lint backend code:
```bash
go fmt ./...
go vet ./...
```

Lint mobile app codebase:
```bash
cd mobile
npm run lint
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](mobile/LICENSE) file for details.
