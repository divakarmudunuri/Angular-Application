# Implemented

Samples from [angular-interview-questions.md](angular-interview-questions.md) that this project already demonstrates, with links to where each one is used. The ones still to do are logged in [not-implemented.md](not-implemented.md).

Only application code in `src/app/`, `src/html/` and `src/main.ts` counts. Test files aren't included, except where noted. Line numbers are as of this writing and may drift as the code changes.

## Fundamentals

### Single-page application

The app loads `index.html` once, and the router swaps pages inside `<router-outlet />` as the tabs change the URL.

| Where | What |
|---|---|
| [app.html:17](../src/html/app.html#L17) | `<router-outlet />`, where every page is rendered |
| [app.routes.ts](../src/app/app.routes.ts) | The route table that maps URLs to pages |

### How the app starts: `bootstrapApplication`

| Where | What |
|---|---|
| [main.ts:7](../src/main.ts#L7) | `bootstrapApplication(App, appConfig)`. There's no `AppModule`. |
| [app.config.ts:11-16](../src/app/app.config.ts#L11-L16) | App-wide providers: `provideBrowserGlobalErrorListeners`, `provideZoneChangeDetection`, `provideRouter`, `provideHttpClient` |

### Standalone components, and services

Every component is standalone and lists what its template uses in `imports`. There are no NgModules in the project.

| Where | What |
|---|---|
| [app.ts:8](../src/app/app.ts#L8) | `imports: [RouterOutlet, RouterLink, NgbNavModule, NgbCollapse]` |
| [products.ts:8](../src/app/products/products.ts#L8) | `imports: [RouterLink]` |
| [audience-products.ts:9](../src/app/products/audience-products.ts#L9) | `imports: [RouterLink, CurrencyPipe]` |
| [products.service.ts:6](../src/app/products/products.service.ts#L6) | `ProductsService`, a service that holds the API calls |

### Templates and built-in control flow

| Where | What |
|---|---|
| [products.html:2-4](../src/html/products.html#L2-L4) | `@if` / `@else`: error message or audience cards |
| [audience-products.html:2-5](../src/html/audience-products.html#L2-L5) | `@if` / `@else if (...; as a)`, plus `@let` for a local template variable |
| [audience-products.html:14](../src/html/audience-products.html#L14) | `@for (p of plans; track p.id)` for the plan cards |
| [app.html:9](../src/html/app.html#L9) | `@for` over the tabs |
| [html/](../src/html/) | All templates are in separate files, loaded with `templateUrl` |

### Data binding

| Kind | Where | Example |
|---|---|---|
| Interpolation | [products.html:10](../src/html/products.html#L10) | `{{ a.name }}` |
| Property binding | [app.html:7-8](../src/html/app.html#L7-L8) | `[ngbCollapse]="menuCollapsed"`, `[activeId]="activeTab()"` |
| Property binding to a directive input | [products.html:12](../src/html/products.html#L12) | `[routerLink]="a.id"` |
| Event binding | [app.html:4](../src/html/app.html#L4) | `(click)="menuCollapsed = !menuCollapsed"` |

Two-way binding isn't used yet.

### Attribute directives

`routerLink` ([app.html:3](../src/html/app.html#L3)) and ng-bootstrap's `ngbNav`, `ngbNavItem`, `ngbNavLink` and `ngbCollapse` ([app.html:7-10](../src/html/app.html#L7-L10)) are attribute directives, adding behavior to existing elements.

## Decorators

### Class decorators

| Decorator | Where |
|---|---|
| `@Component` | [app.ts:7](../src/app/app.ts#L7), [home.ts:3](../src/app/home/home.ts#L3), [page.ts:3](../src/app/page/page.ts#L3), [products.ts:6](../src/app/products/products.ts#L6), [audience-products.ts:7](../src/app/products/audience-products.ts#L7) |
| `@Injectable({ providedIn: 'root' })` | [products.service.ts:6](../src/app/products/products.service.ts#L6) |

### A custom method decorator: `@LogCall`

| Where | What |
|---|---|
| [log-call.ts:6](../src/app/decorators/log-call.ts#L6) | The decorator. It wraps a method and logs its arguments, then the Observable's response or error. |
| [products.service.ts:10](../src/app/products/products.service.ts#L10), [15](../src/app/products/products.service.ts#L15), [20](../src/app/products/products.service.ts#L20) | Applied to `getAudiences`, `getAudience` and `getProducts` |

See [decorators.md](decorators.md).

### Function-based replacements for decorators

| Older decorator | Used instead | Where |
|---|---|---|
| `@Input()` | `input()` | [page.ts:8](../src/app/page/page.ts#L8): `title = input<string>()` |
| `@Input()` (required) | `input.required()` | [audience-products.ts:14](../src/app/products/audience-products.ts#L14): `audienceId = input.required<string>()` |
| Constructor injection | `inject()` | [app.ts:14](../src/app/app.ts#L14), [products.ts:12](../src/app/products/products.ts#L12), [audience-products.ts:13](../src/app/products/audience-products.ts#L13), [products.service.ts:8](../src/app/products/products.service.ts#L8) |

## Pipes

### Built-in pipe with parameters

| Where | What |
|---|---|
| [audience-products.html:39-42](../src/html/audience-products.html#L39-L42) | `currency: 'USD' : 'symbol' : '1.0-0'`, a built-in pure pipe taking three parameters: currency code, display style and digits |
| [audience-products.ts:9](../src/app/products/audience-products.ts#L9) | `CurrencyPipe` imported by the standalone component |

A custom `@Pipe` isn't implemented yet.

## Sharing data between components

### Inputs filled from the URL

The pages receive data through inputs, but the router fills them from the URL, not a parent template:

| Where | What |
|---|---|
| [app.config.ts:14](../src/app/app.config.ts#L14) | `withComponentInputBinding()` |
| [audience-products.ts:14](../src/app/products/audience-products.ts#L14) | `audienceId` filled from the route parameter `:audienceId` |
| [page.ts:8](../src/app/page/page.ts#L8) | `title` filled from the route's `data` |

Parent-to-child through a template (`[message]="..."`), `output()` and `model()` aren't implemented yet.

## Signals and RxJS

### Observables and RxJS operators

| Where | What |
|---|---|
| [products.service.ts:12-22](../src/app/products/products.service.ts#L12-L22) | `HttpClient.get()` returns Observables |
| [app.ts:22-28](../src/app/app.ts#L22-L28) | `router.events.pipe(filter(...), map(...))` |
| [log-call.ts:19-24](../src/app/decorators/log-call.ts#L19-L24) | `tap({ next, error })` to watch responses without changing them |

### Converting between observables and signals

| Where | What |
|---|---|
| [app.ts:22-28](../src/app/app.ts#L22-L28) | `toSignal(router.events...)` with `initialValue`, giving the `activeTab()` signal |

### Loading async data with resources

| Where | What |
|---|---|
| [products.ts:13](../src/app/products/products.ts#L13) | `rxResource({ stream: () => this.api.getAudiences() })` |
| [audience-products.ts:15-22](../src/app/products/audience-products.ts#L15-L22) | Two `rxResource`s with `params: () => this.audienceId()`. They re-fetch when the id changes. |
| [audience-products.html:5](../src/html/audience-products.html#L5) | `hasValue()` and `value()` used in the template |

### Handling errors

| Where | What |
|---|---|
| [products.html:2-3](../src/html/products.html#L2-L3) | `audiences.error()` shows "Unable to load products" |
| [audience-products.html:2-3](../src/html/audience-products.html#L2-L3) | `audience.error()` shows "Product group not found" on a 404 |
| [audience-products.html:5](../src/html/audience-products.html#L5) | Falls back to an empty list if only the plans request fails |
| [log-call.ts:22](../src/app/decorators/log-call.ts#L22) | Logs failed requests with `console.error` |

## Services, DI and HTTP

### Dependency injection

| Where | What |
|---|---|
| [app.config.ts:14-15](../src/app/app.config.ts#L14-L15) | Providers registered with the root injector: `provideRouter`, `provideHttpClient` |
| [products.service.ts:6](../src/app/products/products.service.ts#L6) | `providedIn: 'root'`: an app-wide instance, with no entry needed in `app.config.ts` |
| [products.ts:12](../src/app/products/products.ts#L12) → [products.service.ts:8](../src/app/products/products.service.ts#L8) | Two levels of `inject()`: the page asks for the service, and the service asks for `HttpClient` |
| [src/tests/products/](../src/tests/products/) (tests) | `provideHttpClientTesting()` overrides one provider, `HttpBackend`, to fake the network |

See [dependency-injection.md](dependency-injection.md).

### HTTP with `HttpClient`

| Where | What |
|---|---|
| [app.config.ts:15](../src/app/app.config.ts#L15) | `provideHttpClient()`, not the deprecated `HttpClientModule` |
| [products.service.ts:22](../src/app/products/products.service.ts#L22) | A GET with HTTP query parameters: `{ params: { audience: audienceId } }` |

Interceptors aren't implemented yet.

## Change detection and styles

| Topic | Where | What |
|---|---|---|
| Change detection | [app.config.ts:13](../src/app/app.config.ts#L13) | Classic zone.js change detection: `provideZoneChangeDetection({ eventCoalescing: true })` |
| View encapsulation | [app.css](../src/app/app.css) | Component styles use the default `Emulated` encapsulation, so they only apply to `App` |

`OnPush` and zoneless aren't implemented yet.

## Build and rendering

| Topic | Where | What |
|---|---|---|
| AOT and the esbuild builder | [angular.json:18](../angular.json#L18) | `@angular/build:application`. AOT and TypeScript transpiling happen at build time. |
| Client-side rendering | [angular.json](../angular.json) | No SSR configured. The browser renders everything. |
| Lazy loading | [app.routes.ts:8-15](../src/app/app.routes.ts#L8-L15) | `loadComponent` with a dynamic `import()` for both product pages |
| Eager loading | [app.routes.ts:6](../src/app/app.routes.ts#L6), [16-18](../src/app/app.routes.ts#L16-L18) | `component:` for Home and the shared `Page` |

See [lazy-loading.md](lazy-loading.md).

## Routing

| Topic | Where | What |
|---|---|---|
| Configuring routes | [app.config.ts:14](../src/app/app.config.ts#L14), [app.routes.ts](../src/app/app.routes.ts) | `provideRouter(routes, withComponentInputBinding())`, with no `RouterModule.forRoot()` |
| 404 handling | [app.routes.ts:19](../src/app/app.routes.ts#L19) | `{ path: '**', redirectTo: '' }`, placed **last** |
| `redirectTo` | [app.routes.ts:19](../src/app/app.routes.ts#L19) | Unknown URLs redirect to Home |
| Path parameters | [app.routes.ts:13](../src/app/app.routes.ts#L13) | `insurance-products/:audienceId`, read as an input rather than through `ActivatedRoute` |
| Static route data | [app.routes.ts:16-18](../src/app/app.routes.ts#L16-L18) | `data: { title: 'Providers' }`, read as the `title` input |
| Absolute `routerLink` | [app.html:3](../src/html/app.html#L3), [audience-products.html:1](../src/html/audience-products.html#L1) | Logo to `/`, back link to `/insurance-products` |
| Relative `routerLink` | [products.html:12](../src/html/products.html#L12) | `[routerLink]="a.id"` resolves to `/insurance-products/<id>` |
| Router events | [app.ts:22-33](../src/app/app.ts#L22-L33) | `NavigationEnd` and `urlAfterRedirects` to highlight the current tab, including on child URLs |
| Programmatic navigation | [src/tests/app.spec.ts](../src/tests/app.spec.ts) (tests only) | `router.navigateByUrl(url)`, not used in the app itself |

See [routing.md](routing.md).

## Summary

| Section | Implemented | Not yet |
|---|---|---|
| Fundamentals | SPA, `bootstrapApplication`, standalone components, services, `@if` / `@for` / `@let`, interpolation, property and event binding, library attribute directives (`routerLink`, `ngbNav`, `ngbCollapse`) | `[ngClass]`, custom `@Directive`, `@switch`, two-way binding, `viewChild()` |
| Decorators | `@Component`, `@Injectable`, custom `@LogCall`, `input()`, `inject()` | `@Directive`, `@Pipe`, `output()`, `viewChild()`, `contentChild()`, `host: {}` |
| Pipes | Built-in `currency` with parameters | Custom `@Pipe` |
| Sharing data | Inputs from route parameters and route data | Template inputs from a parent, `output()`, `model()`, a shared state service |
| Signals and RxJS | Observables, `pipe` / `filter` / `map` / `tap`, `toSignal`, `rxResource`, `error()` | `signal()`, `computed()`, `effect()`, `linkedSignal()`, `toObservable()`, `resource()`, `httpResource()`, `catchError`, `retry` |
| Services, DI, HTTP | `provideHttpClient`, `providedIn: 'root'`, `inject()`, HTTP query parameters | Interceptors |
| Change detection and styles | Classic zone.js, default `Emulated` encapsulation | Lifecycle hooks and their signal-based alternatives, `OnPush`, zoneless, explicit `ViewEncapsulation` |
| Build and rendering | AOT, esbuild `application` builder, client-side rendering, `loadComponent` | SSR, `@defer`, `loadChildren`, SASS, Angular Material |
| Routing | `provideRouter`, `**` wildcard, `redirectTo`, path parameters and static data as inputs, `routerLink`, router events | Guards, resolvers, `ActivatedRoute`, route query parameters, `pathMatch: 'full'`, child and named outlets, programmatic navigation in app code, `routerLinkActive`, `RouteReuseStrategy`, scroll restoration |

For details of what's missing, see [not-implemented.md](not-implemented.md).
