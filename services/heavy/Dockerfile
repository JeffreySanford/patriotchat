# Multi-stage build: compile with Go, run with a minimal image
FROM golang:1.20-alpine AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags='-s -w' -o /out/heavy ./main.go

FROM alpine:3.18 AS runtime
RUN addgroup -S heavy && adduser -S -G heavy heavy
WORKDIR /app
COPY --from=build /out/heavy ./heavy
RUN chown -R heavy:heavy /app
USER heavy
ENV PORT=4000
EXPOSE 4000
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 CMD wget -qO- http://localhost:${PORT}/health || exit 1
CMD ["./heavy"]
