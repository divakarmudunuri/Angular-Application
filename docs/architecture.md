# Architecture

Sri Insurance is an Angular 22 single-page app (styled with Bootstrap / ng-bootstrap) backed by a small Express API that serves sample insurance data from memory.

```mermaid
flowchart LR
  User(["User / Browser"])

  subgraph Angular["Angular app - localhost:4200"]
    direction TB
    App["App shell<br/>logo + ngbNav tabs + ngbCollapse<br/>html/app.html"]
    Router["Angular Router<br/>app.routes.ts"]
    Home["Home<br/>hero + articles"]
    Products["Products<br/>audience cards"]
    Audience["AudienceProducts<br/>plan cards + compare table"]
    Page["Page<br/>Member Tools / Providers / About Us"]
    Service["ProductsService<br/>@LogCall logs each call"]
    Http["HttpClient<br/>products/api.ts - API_URL"]

    App --> Router
    Router -->|"/"| Home
    Router -->|"/insurance-products"| Products
    Router -->|"/insurance-products/:audienceId"| Audience
    Router -->|"/member-tools, /providers, /about-us"| Page
    Products --> Service
    Audience --> Service
    Service --> Http
  end

  subgraph API["Express API - localhost:3000"]
    direction TB
    CORS["CORS middleware<br/>allow localhost:4200"]
    Routes["GET /api/audiences<br/>GET /api/audiences/:id<br/>GET /api/products?audience=<br/>GET /api/products/:id"]
    Data[("In-memory data<br/>audiences + products")]
    CORS --> Routes --> Data
  end

  User --> App
  Http -->|"HTTP GET, JSON"| CORS
```

## Folder layout

| Path | Purpose |
|---|---|
| `src/app/` | Components, routes and app config |
| `src/app/products/api.ts` | API base URL and `Audience` / `Product` types |
| `src/app/products/products.service.ts` | API calls used by the product pages |
| `src/app/decorators/log-call.ts` | `@LogCall` decorator |
| `src/html/` | All component HTML templates |
| `src/tests/` | Angular unit tests, mirroring the `src/app/` folders |
| `public/logo.svg` | Sri Insurance logo |
| `local-api-server/app.js` | Express routes and sample data |
| `local-api-server/server.js` | Starts the API on `PORT` |
| `local-api-server/tests/` | API tests |
