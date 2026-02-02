FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY angular.json tsconfig*.json ./
COPY src ./src

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist/frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 4200

HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q -O- http://localhost:4200/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
