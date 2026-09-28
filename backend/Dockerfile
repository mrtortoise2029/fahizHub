FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --omit=dev -w backend
COPY backend backend
COPY database database
RUN mkdir -p uploads
EXPOSE 3000
CMD ["npm", "run", "start", "-w", "backend"]
