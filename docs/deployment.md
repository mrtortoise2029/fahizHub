# Deployment

Build the frontend with `npm run build`; deploy `frontend/dist` to a static host and run `backend/src/server.js` on a Node.js service connected to MySQL 8.

Production configuration must use a strong `JWT_SECRET`, HTTPS, a restricted `CLIENT_URL`, non-root database credentials, and external durable storage for uploads. Apply migrations before starting the new application version. Health checks can use `/api/health`.

