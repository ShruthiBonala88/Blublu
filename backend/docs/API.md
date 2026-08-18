# Blublu Ride-Sharing Backend — API Specification Contract

**Base URL (Development)**: `http://localhost:8080`  
**Base URL (Production)**: `https://api.blublu.app`  
**Authentication Header**: `Authorization: Bearer <JWT_TOKEN>`  
**Content-Type**: `application/json`

---

## Table of Contents
1. [Authentication & OTP](#1-authentication--otp)
2. [Users & Profile](#2-users--profile)
3. [Drivers & Earnings](#3-drivers--earnings)
4. [Vehicles & Seats](#4-vehicles--seats)
5. [Trips & Routing](#5-trips--routing)
6. [Search & Matching](#6-search--matching)
7. [Bookings](#7-bookings)
8. [Payments (Razorpay Sandbox)](#8-payments-razorpay-sandbox)
9. [Chat](#9-chat)
10. [Live Location Tracking](#10-live-location-tracking)
11. [Notifications](#11-notifications)
12. [Safety & SOS](#12-safety--sos)
13. [Reviews & Ratings](#13-reviews--ratings)
14. [Driver KYC](#14-driver-kyc)
15. [Admin Oversight](#15-admin-oversight)
16. [Standard Error Responses](#16-standard-error-responses)

---

## 1. Authentication & OTP

### POST `/api/v1/auth/register`
- **Auth Required**: No
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "full_name": "John Doe",
    "phone": "+919876543210",
    "email": "john@example.com",
    "gender": "male",
    "role": "passenger"
  }
  ```
- **Success Response** (`201 Created`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "role": "passenger",
      "phone": "+919876543210"
    }
  }
  ```
- **Error Responses**: `400 Bad Request` (missing `full_name` or `phone`, invalid role).
- **Database Effect**: Inserts new record into `users` table.

### POST `/api/v1/auth/login`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "phone": "+919876543210"
  }
  ```
  *OR*
  ```json
  {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "Bearer",
    "expires_in": 86400,
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "role": "passenger",
      "phone": "+919876543210"
    }
  }
  ```
- **Error Responses**: `404 Not Found` (user not found), `401 Unauthorized` (inactive account).

### POST `/api/v1/otp/request`
- **Auth Required**: No
- **Rate Limit**: Max 5 requests per 300 seconds.
- **Request Body**:
  ```json
  {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "purpose": "ride_start"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "message": "OTP generated successfully",
    "expires_in": 300,
    "development_otp": "123456"
  }
  ```

### POST `/api/v1/otp/verify`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "otp": "123456",
    "purpose": "ride_start"
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "verified": true,
    "message": "OTP verified successfully"
  }
  ```

---

## 2. Users & Profile

### GET `/api/v1/users/{id}/bookings`
- **Auth Required**: Yes (Passenger or Admin)
- **Path Parameters**: `id` (User UUID)
- **Success Response** (`200 OK`):
  ```json
  {
    "bookings": [
      {
        "id": "b1a2c3d4-0000-0000-0000-000000000000",
        "trip_id": "t1a2c3d4-0000-0000-0000-000000000000",
        "status": "confirmed",
        "seats_booked": 2,
        "total_amount": 700.0
      }
    ]
  }
  ```

### GET `/api/v1/users/{id}/rides`
- **Auth Required**: Yes (Passenger or Admin)
- **Query Parameters**: `status` (`all`, `upcoming`, `active`, `completed`, `cancelled`)
- **Success Response** (`200 OK`): Array of ride summary objects.

### GET `/api/v1/users/{id}/notifications`
- **Auth Required**: Yes (Passenger or Admin)
- **Success Response** (`200 OK`): List of user notifications.

---

## 3. Drivers & Earnings

### POST `/api/v1/drivers`
- **Auth Required**: Yes (Driver role)
- **Request Body**:
  ```json
  {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "license_number": "DL-12345678",
    "license_expiry_date": "2030-12-31"
  }
  ```
- **Success Response** (`201 Created`): Driver profile object.

### GET `/api/v1/drivers/{id}/earnings/summary`
- **Auth Required**: Yes (Driver owner or Admin)
- **Success Response** (`200 OK`):
  ```json
  {
    "driver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "total_earnings": 14500.00,
    "platform_fees": 1450.00,
    "net_payout": 13050.00,
    "completed_trips": 12
  }
  ```

---

## 4. Vehicles & Seats

### POST `/api/v1/vehicles`
- **Auth Required**: Yes (Driver role)
- **Request Body**:
  ```json
  {
    "driver_id": "d1a2c3d4-0000-0000-0000-000000000000",
    "vehicle_type": "car",
    "make": "Toyota",
    "model": "Innova",
    "year": 2023,
    "registration_number": "KA-01-AB-1234",
    "color": "White",
    "total_seats": 4
  }
  ```
- **Success Response** (`201 Created`): Vehicle object + generated seat map.

---

## 5. Trips & Routing

### POST `/api/v1/route/calculate`
- **Auth Required**: No (Public)
- **Request Body**:
  ```json
  {
    "origin_latitude": 12.971598,
    "origin_longitude": 77.594566,
    "destination_latitude": 12.295810,
    "destination_longitude": 76.639381
  }
  ```
- **Success Response** (`200 OK`):
  ```json
  {
    "distance_meters": 143452,
    "duration_seconds": 7125,
    "geometry": "polyline_string"
  }
  ```

### POST `/api/v1/trips`
- **Auth Required**: Yes (Driver / Admin role)
- **Business Rule**: Supports **arbitrary dynamic routes** (e.g. Bangalore → Mysore, Mumbai → Pune, Hyderabad → Warangal). No hardcoded locations.
- **Request Body**:
  ```json
  {
    "driver_id": "d1a2c3d4-0000-0000-0000-000000000000",
    "vehicle_id": "v1a2c3d4-0000-0000-0000-000000000000",
    "origin_name": "Bangalore Majestic",
    "destination_name": "Mysore Palace",
    "origin_latitude": 12.971598,
    "origin_longitude": 77.594566,
    "destination_latitude": 12.295810,
    "destination_longitude": 76.639381,
    "departure_time": "2026-08-25T10:00:00Z",
    "price_per_seat": 350.0
  }
  ```
- **Success Response** (`201 Created`): Returns created trip with auto-computed distance & duration via OSRM.

### GET `/api/v1/trips/search`
- **Auth Required**: No
- **Query Parameters**:
  - `origin` (e.g., `Bangalore`)
  - `destination` (e.g., `Mysore`)
  - `date` (e.g., `2026-08-25`)
- **Success Response** (`200 OK`): List of matching active trips.

---

## 6. Bookings

### POST `/api/v1/bookings`
- **Auth Required**: Yes (Passenger role)
- **Business Rule**: Uses PostgreSQL transactions and `SELECT FOR UPDATE` to lock available seats, preventing race conditions or double bookings.
- **Request Body**:
  ```json
  {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "trip_id": "t1a2c3d4-0000-0000-0000-000000000000",
    "seats_booked": 2,
    "seat_ids": ["seat-1", "seat-2"]
  }
  ```
- **Success Response** (`201 Created`): Booking confirmation object.

---

## 7. Payments (Razorpay Sandbox)

> [!NOTE]
> **TEST / SANDBOX MODE ONLY**. No real financial charges are made (`PAYMENT_ENV=test`).

### POST `/api/v1/bookings/{id}/payment/order`
- **Auth Required**: Yes
- **Success Response** (`200 OK`):
  ```json
  {
    "order_id": "order_test_1755437890",
    "amount": 70000,
    "currency": "INR",
    "razorpay_key_id": "rzp_test_placeholder"
  }
  ```

### POST `/api/v1/payments/verify`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "booking_id": "b1a2c3d4-0000-0000-0000-000000000000",
    "razorpay_order_id": "order_test_1755437890",
    "razorpay_payment_id": "pay_test_1755437890",
    "razorpay_signature": "signature_hash"
  }
  ```
- **Success Response** (`200 OK`): `{"verified": true, "status": "paid"}`

---

## 8. Chat

### POST `/api/v1/chat/trips/{trip_id}/messages`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "sender_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "sender_name": "John Doe",
    "message": "I am waiting at the main gate"
  }
  ```
- **Success Response** (`201 Created`): Chat message object stored in `chat_messages` table.

### GET `/api/v1/chat/trips/{trip_id}/messages`
- **Auth Required**: Yes
- **Success Response** (`200 OK`): Chronological list of trip chat messages.

---

## 9. Live Location Tracking

### POST `/api/v1/tracking/trips/{trip_id}/location`
- **Auth Required**: Yes (Driver)
- **Request Body**:
  ```json
  {
    "driver_id": "d1a2c3d4-0000-0000-0000-000000000000",
    "latitude": 12.971598,
    "longitude": 77.594566,
    "heading": 180.0,
    "speed": 60.0
  }
  ```
- **Success Response** (`200 OK`): Location update acknowledgement.

### GET `/api/v1/tracking/trips/{trip_id}/location`
- **Auth Required**: Yes (Passenger / Driver of the trip)
- **Success Response** (`200 OK`): Latest driver location object.

---

## 10. Safety & SOS

### POST `/api/v1/safety/sos`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "user_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "latitude": 12.9716,
    "longitude": 77.5946
  }
  ```
- **Success Response** (`201 Created`): SOS trigger record.

### POST `/api/v1/safety/report`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "reporter_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "category": "dangerous_driving",
    "description": "Driver was speeding excessively"
  }
  ```
- **Success Response** (`201 Created`): Incident report object.

---

## 11. Driver KYC

### POST `/api/v1/kyc/submit`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "driver_id": "d1a2c3d4-0000-0000-0000-000000000000",
    "document_type": "driving_license",
    "document_number": "DL-99887766"
  }
  ```
- **Success Response** (`201 Created`): KYC submission object.

---

## 12. Admin Oversight

- `GET /api/v1/admin/dashboard`: Stats overview.
- `GET /api/v1/admin/users`: List users.
- `POST /api/v1/admin/drivers/{id}/approve`: Approve driver KYC.
- `POST /api/v1/admin/kyc/{id}/review`: Review KYC submission.

---

## 13. Standard Error Responses

```json
{
  "error": "Error description message"
}
```

Common status codes:
- `400 Bad Request`: Missing/malformed fields or invalid coordinates.
- `401 Unauthorized`: Missing, invalid, or expired JWT token.
- `403 Forbidden`: Resource does not belong to requesting user or insufficient role.
- `404 Not Found`: Resource ID does not exist.
- `429 Too Many Requests`: Rate limit exceeded.
- `500 Internal Server Error`: Unexpected server issue.
