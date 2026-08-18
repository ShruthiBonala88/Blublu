# Blublu Ride-Sharing Backend — Production Readiness & Operations Guide

This guide details the complete production architecture, security controls, database backup/restore procedures, Redis resilience strategy, Razorpay LIVE migration protocol, SMS gateway configuration, monitoring alerts, and deployment launch checklists for the Blublu ride-sharing backend.

---

## 1. Production Architecture Overview

```text
               +----------------------------------+
               |  Mobile Apps (iOS / Android)     |
               |  Expo / React Native Frontend    |
               +----------------------------------+
                                |
                                | HTTPS (TLS 1.3)
                                v
               +----------------------------------+
               | Nginx / Caddy Reverse Proxy      |
               | SSL Termination & Rate Limiting  |
               +----------------------------------+
                                |
                                | HTTP (Internal Network)
                                v
               +----------------------------------+
               | Blublu Go Backend API Cluster    |
               | Port 8080 (Stateless Services)   |
               +----------------------------------+
                  /             |              \
                 /              |               \
                v               v                v
     +------------------+ +-------------+ +-------------------+
     | PostgreSQL 15+   | | Redis 7+    | | OpenStreetMap OSRM|
     | + PostGIS        | | Rate Limit  | | Free Engine       |
     | DB Port 5432     | | Port 6379   | | Routing Server    |
     +------------------+ +-------------+ +-------------------+
```

---

## 2. Secrets Management & Environment Loading

### Security Guidelines
1. **Never Commit Secrets**: Secrets must never be stored in Git repositories, Dockerfiles, or client mobile applications.
2. **Environment Variable Injection**: Set environment variables via OS systemd units, AWS Secrets Manager, HashiCorp Vault, or Docker secret mounts.
3. **High-Entropy JWT Secret**: Generate a cryptographically random 256-bit secret key for production:
   ```bash
   openssl rand -hex 32
   ```

### Production `.env` Template
```env
PORT=8080
APP_ENV=production
PAYMENT_ENV=live
JWT_SECRET=f8a1c9e3b7d5a2f4e6c8b0d2e4f6a8c1b3d5e7f9a1c3e5b7d9f1a3c5e7b9d1f3
DATABASE_URL=postgres://blublu_user:SECURE_DB_PASSWORD@prod-db.blublu.internal:5432/blublu_prod?sslmode=require
REDIS_URL=redis://:SECURE_REDIS_PASSWORD@prod-redis.blublu.internal:6379
CORS_ALLOWED_ORIGINS=https://blublu.app,https://admin.blublu.app
RAZORPAY_KEY_ID=rzp_live_PROD_KEY_ID
RAZORPAY_KEY_SECRET=PROD_RAZORPAY_SECRET
RAZORPAY_WEBHOOK_SECRET=PROD_WEBHOOK_SECRET
SMS_PROVIDER=twilio
SMS_API_KEY=PROD_TWILIO_API_KEY
```

---

## 3. Database Management (PostgreSQL + PostGIS)

### Database Migrations
Migrations execute sequentially using `goose` or standard schema files (`001_create_users.sql` through `017_create_chat_messages.sql`).

Run migrations:
```bash
goose -dir ./migrations postgres "$DATABASE_URL" up
```

### Production Backup Strategy
- **Daily Automated Backups**: Execute `pg_dump` at 02:00 UTC daily.
- **Retention Period**: Retain daily backups for 30 days and monthly backups for 12 months in encrypted S3 bucket storage.

#### Backup Command
```bash
pg_dump -h prod-db.blublu.internal -U blublu_user -d blublu_prod -F c -b -v -f /backups/blublu_backup_$(date +%Y%m%d_%H%M%S).dump
```

#### Restore Procedure
```bash
pg_restore -h prod-db.blublu.internal -U blublu_user -d blublu_prod -v /backups/blublu_backup_20260817_020000.dump
```

---

## 4. Redis Caching & Resiliency

- **Failure Isolation**: If Redis experiences network degradation or failover, the Go backend falls back gracefully to in-memory rate limiting without crashing active HTTP requests.
- **MaxMemory Eviction Policy**: Set `maxmemory-policy volatile-lru` in `redis.conf` to automatically evict expired rate limit tokens.

---

## 5. Razorpay LIVE Mode Migration Protocol

When transitioning from Sandbox test mode (`PAYMENT_ENV=test`) to Live Production (`PAYMENT_ENV=live`):

1. **Activate Razorpay Account**: Complete KYC on the Razorpay Dashboard.
2. **Generate Live API Keys**: Obtain `rzp_live_...` Key ID and Secret from Razorpay Dashboard -> Settings -> API Keys.
3. **Configure Webhook Endpoint**:
   - Register URL: `https://api.blublu.app/api/v1/payments/webhook`
   - Active Events: `order.paid`, `payment.captured`, `payment.failed`, `refund.created`
   - Set secret matching `RAZORPAY_WEBHOOK_SECRET`.
4. **Update Production Environment**:
   ```env
   PAYMENT_ENV=live
   RAZORPAY_KEY_ID=rzp_live_YourKeyHere
   RAZORPAY_KEY_SECRET=YourSecretHere
   RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
   ```

---

## 6. Production SMS Gateway Integration

To replace simulated console SMS (`SMS_PROVIDER=console`) with production SMS provider:

1. Select provider (`twilio`, `aws_sns`, or `msg91`).
2. Set `SMS_PROVIDER`, `SMS_API_KEY`, and `SMS_SENDER_ID` in production environment.
3. Verify rate limits (max 5 OTP requests per phone per 300 seconds).

---

## 7. Observability, Health Checks, & Alerts

### Health & Readiness Endpoints
- `GET /health`: Returns HTTP 200 `{"status":"ok","service":"blublu-api"}` indicating HTTP process vitality.

### Structured Log Policy
All backend logs output JSON to stdout with standard fields (`timestamp`, `level`, `endpoint`, `status_code`, `duration_ms`, `request_id`).
Secrets, tokens, passwords, and payment HMACs are **never logged**.

---

## 8. Emergency Rollback & Incident Response

In case of critical production deployment failure:

1. **Revert API Cluster Container Image**:
   ```bash
   docker service update --image blublu-api:previous_tag blublu_api_service
   ```
2. **Rollback Database Migration** (if required):
   ```bash
   goose -dir ./migrations postgres "$DATABASE_URL" down
   ```
3. **Restore Database from Snapshot**: Run `pg_restore` procedure documented in Section 3.

---

## 9. Production Launch Checklist

- [ ] Domain name configured (`api.blublu.app`) with TLS 1.3 SSL certificate.
- [ ] High-entropy `JWT_SECRET` generated and loaded via environment variables.
- [ ] PostgreSQL + PostGIS production instance active with daily S3 backup cron job.
- [ ] Redis instance active with password authentication.
- [ ] Razorpay Live API keys and webhook signatures configured (`PAYMENT_ENV=live`).
- [ ] Mobile app `EXPO_PUBLIC_API_URL` pointed to `https://api.blublu.app`.
- [ ] CORS allowed origins configured to match production mobile & web domains.
- [ ] Rate limits enabled and tested on auth & payment endpoints.
- [ ] All automated unit & integration test suites passing cleanly.
