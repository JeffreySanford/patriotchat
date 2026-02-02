FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy everything
COPY . .

# Ensure go.sum is present
RUN go mod tidy

# Build
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o auth src/main.go

# Final stage
FROM alpine:3.19

RUN apk --no-cache add ca-certificates curl

WORKDIR /root/

COPY --from=builder /app/auth .

EXPOSE 4001

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4001/health || exit 1

CMD ["./auth"]
