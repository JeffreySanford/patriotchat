FROM golang:1.21-alpine AS builder

WORKDIR /build

COPY go.mod go.sum* ./
RUN go mod download || go mod tidy

COPY src ./src

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o policy ./src/main.go

FROM alpine:latest

RUN apk --no-cache add ca-certificates curl

WORKDIR /app

COPY --from=builder /build/policy .

EXPOSE 4003

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4003/health || exit 1

CMD ["./policy"]
