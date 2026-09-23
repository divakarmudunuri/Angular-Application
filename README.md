# Sri Insurance

A sample insurance website built with Angular 22 and ng-bootstrap, backed by a small Express API that serves sample insurance products.

| App | Folder | URL |
|---|---|---|
| Angular web app | project root | http://localhost:4200 |
| Express API | `local-api-server/` | http://localhost:3000/api |

## Prerequisites

- Node.js 22 or later (tested with Node 24 and npm 11)

## Run the apps

Run each app in its own terminal. Start the API first so the Insurance Products pages can load data.

### 1. Express API

```bash
cd local-api-server
npm install
npm start
```

The API runs on port 3000 and restarts automatically when `server.js` changes. To use another port, set `PORT` (for example `PORT=4000 npm start`) and update `API_URL` in `src/app/products/api.ts` to match.

Endpoints:

| Endpoint | Returns |
|---|---|
| `GET /api/audiences` | Audience groups: individual, senior, business |
| `GET /api/audiences/:id` | One audience, or 404 |
| `GET /api/products` | All products; filter with `?audience=senior` |
| `GET /api/products/:id` | One product, or 404 |

### 2. Angular app

From the project root:

```bash
npm install
npm start
```

Open http://localhost:4200. The app reloads automatically when source files change.

## Build

```bash
npm run build
```

Output goes to `dist/sri-insurance/`.

## Run the tests

Angular unit tests (Vitest), from the project root:

```bash
npm test -- --watch=false
```

API tests (Node's built-in test runner):

```bash
cd local-api-server
npm test
```

See [docs/testing.md](docs/testing.md) for filtering, coverage and how the tests work.

## Project layout

| Path | Purpose |
|---|---|
| `src/app/` | Components, routes and app config |
| `src/html/` | All component HTML templates |
| `src/tests/` | Angular unit tests, mirroring the `src/app/` folders |
| `src/app/products/api.ts` | API base URL and data types |
| `src/app/products/products.service.ts` | API calls used by the product pages |
| `src/app/decorators/log-call.ts` | `@LogCall` decorator that logs API calls and responses |
| `public/logo.svg` | Sri Insurance logo |
| `local-api-server/app.js` | Express routes and sample data |
| `local-api-server/server.js` | Starts the API on `PORT` |
| `local-api-server/tests/` | API tests |
| `docs/` | [Architecture](docs/architecture.md), [sequence](docs/sequence-diagram.md), [routing](docs/routing.md), [lazy loading](docs/lazy-loading.md), [testing](docs/testing.md), [unit test examples](docs/unit-test-examples.md), [coverage](docs/coverage.md), [dependency injection](docs/dependency-injection.md), [decorators](docs/decorators.md), [Angular 19+ interview questions](docs/angular-interview-questions.md), [implemented](docs/implemented.md) and [not implemented yet](docs/not-implemented.md) docs |
