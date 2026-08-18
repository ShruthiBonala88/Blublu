# Mobile Frontend Integration Guide — Blublu Ride-Sharing

This guide provides mobile developers (React Native / Expo / Flutter / Native iOS & Android) with the exact integration patterns, authentication flows, error handling guidelines, and user journey sequences for connecting to the Blublu backend.

---

## 1. Environment & Base URL Setup

| Environment | Base URL | Notes |
|---|---|---|
| Development | `http://localhost:8080` (or `http://10.0.2.2:8080` for Android Emulator) | Local backend server |
| Staging | `https://staging-api.blublu.app` | Staging cluster |
| Production | `https://api.blublu.app` | Production environment |

---

## 2. Authentication Flow & Token Management

### Login & Registration Flow
1. User submits details to `POST /api/v1/auth/register` or `POST /api/v1/auth/login`.
2. Backend returns signed 24-hour JWT token + user metadata:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1Ni...",
     "token_type": "Bearer",
     "expires_in": 86400,
     "user": {
       "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
       "role": "passenger"
     }
   }
   ```
3. Secure Token Storage:
   - **React Native / Expo**: Use `expo-secure-store` or `react-native-keychain`.
   - **Flutter**: Use `flutter_secure_storage`.
   - **Do NOT** store JWT tokens in `AsyncStorage` or unencrypted local storage.

### Authenticated Request Headers
Every protected API request MUST include the `Authorization` header:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Logout Handling
1. Delete stored token from secure storage.
2. Reset local app state.
3. Redirect user to Login screen.

---

## 3. Core User Flows

### A. Passenger Journey Flow
1. **Search Trips**: Call `GET /api/v1/trips/search?origin=Bangalore&destination=Mysore&date=2026-08-25`.
2. **View Route**: Call `POST /api/v1/route/calculate` with origin/destination coordinates to draw polylines on map.
3. **Select & Book Seat**: Call `POST /api/v1/bookings` specifying `trip_id` and `seats_booked`.
4. **Payment Sandbox Order**: Call `POST /api/v1/bookings/{id}/payment/order`.
5. **Complete Test Payment**: Call `POST /api/v1/payments/verify`.
6. **Chat & Live Track Driver**:
   - Post/get messages via `POST/GET /api/v1/chat/trips/{trip_id}/messages`.
   - Track driver location via `GET /api/v1/tracking/trips/{trip_id}/location`.
7. **Rate Driver**: Call `POST /api/v1/bookings/{id}/rating` after ride completion.

### B. Driver Journey Flow
1. **Submit KYC**: Call `POST /api/v1/kyc/submit` with license number.
2. **Create Profile & Vehicle**:
   - `POST /api/v1/drivers`
   - `POST /api/v1/vehicles`
3. **Publish Trip**: Call `POST /api/v1/trips` specifying origin/destination lat/lng, price, and departure date/time. Supports **any arbitrary route**.
4. **Trip Execution**:
   - Start trip: `POST /api/v1/trips/{id}/start`
   - Update live location: `POST /api/v1/tracking/trips/{id}/location`
   - Complete trip: `POST /api/v1/trips/{id}/complete`
5. **View Earnings & Request Payout**:
   - `GET /api/v1/drivers/{id}/earnings/summary`
   - `POST /api/v1/drivers/{id}/payouts`

### C. Safety & Emergency (SOS) Flow
- User taps Emergency / SOS button -> Call `POST /api/v1/safety/sos` sending current lat/lng.
- User files incident report -> Call `POST /api/v1/safety/report`.

---

## 4. API Request Examples (JavaScript / Fetch)

### Authenticated Request Helper
```javascript
const API_BASE_URL = 'http://localhost:8080';

async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = { method, headers };
  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API Request Failed');
  }

  return data;
}
```

---

## 5. Error Code Handling Reference

| HTTP Status | Trigger Condition | Frontend Handling Action |
|---|---|---|
| `400 Bad Request` | Missing or invalid parameters | Display inline form error |
| `401 Unauthorized` | Missing/expired JWT | Clear storage & navigate to Login |
| `403 Forbidden` | Accessing unauthorized resource | Show access denied banner |
| `404 Not Found` | Invalid resource ID | Show resource missing state |
| `429 Too Many Requests` | Rate limit hit | Disable submit button & show countdown timer |
| `500 Server Error` | Unexpected backend error | Show generic retry prompt |
