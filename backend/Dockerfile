# ==========================================
# Multi-Stage Production Dockerfile for Go
# ==========================================
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Enable automatic toolchain and install build tools
ENV GOTOOLCHAIN=auto
ENV CGO_ENABLED=0

RUN apk add --no-cache git ca-certificates tzdata

# Cache Go modules
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build statically linked binary
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /app/server ./cmd/server

# ==========================================
# Minimal Alpine Runtime
# ==========================================
FROM alpine:3.19

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata

# Copy binary from builder
COPY --from=builder /app/server /app/server
COPY --from=builder /app/migrations /app/migrations

EXPOSE 8080

ENV PORT=8080
ENV APP_ENV=production

CMD ["/app/server"]
