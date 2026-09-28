# Architecture

FahizHub uses a workspace with a React client and Express API. Public portfolio data is fetched from REST endpoints backed by MySQL; authenticated operations use a short-lived JWT stored in an HTTP-only cookie.

The frontend is separated into pages, layouts, reusable components, context, hooks, and services. Public and admin layouts are independent so the portfolio stays lightweight while the dashboard can evolve into a productivity application. The responsive strategy begins at phone width and progressively adds columns and persistent navigation.

The backend separates configuration, controllers, middleware, routes, and utilities. SQL remains parameterized through `mysql2`. New feature modules should follow the existing route/controller/validation pattern.

