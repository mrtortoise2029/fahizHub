FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci -w frontend
COPY frontend frontend
ARG VITE_SITE_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build -w frontend
FROM nginx:1.27-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
