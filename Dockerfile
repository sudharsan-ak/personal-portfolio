# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (better caching)
COPY package*.json ./
RUN npm ci

# Copy the rest and build
COPY . .
RUN npm run build

# ---------- Run stage ----------
FROM nginx:alpine

# Copy built site to nginx
COPY --from=builder /app/dist/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# SPA routing: send all routes to index.html
# RUN printf '%s\n' \
# 'server {' \
# '  listen 80;' \
# '  server_name _;' \
# '  root /usr/share/nginx/html;' \
# '  index index.html;' \
# '  location / {' \
# '    try_files $uri $uri/ /index.html;' \
# '  }' \
# '}' \
# > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
