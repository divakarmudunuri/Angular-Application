# Angular interview questions for Angular 19+

The questions below come from [InterviewBit's Angular interview questions](https://www.interviewbit.com/angular-interview-questions/), filtered to those still relevant for Angular 19 and later. Much of that page was written for the NgModule era (roughly v8–v14), so the answers here are rewritten for modern Angular: standalone components, signals, functional APIs and the esbuild builder. Where it helps, answers point to where this project uses the idea.

Questions that only apply to AngularJS or to outdated APIs are listed at the end, with the reason each was left out.

Samples this project already demonstrates are listed in [implemented.md](implemented.md), with links to the code. Samples it doesn't demonstrate yet are logged in [not-implemented.md](not-implemented.md).

## Contents

1. [Fundamentals](#fundamentals)
2. [Decorators](#decorators)
3. [Pipes](#pipes)
4. [Sharing data between components](#sharing-data-between-components)
5. [Signals and RxJS](#signals-and-rxjs)
6. [Services, DI and HTTP](#services-di-and-http)
7. [Lifecycle and change detection](#lifecycle-and-change-detection)
8. [Build and rendering](#build-and-rendering)
9. [Routing](#routing)
10. [Left out as not relevant to Angular 19+](#left-out-as-not-relevant-to-angular-19)

---

## Fundamentals

### What is Angular, and what is a single-page application (SPA)?

Angular is a TypeScript framework for building web apps. An SPA loads `index.html` once. After that, the router swaps views as the URL changes, with no full page reloads. That's how this project's tabs work.

### Why were client-side frameworks introduced?

They keep the UI in sync with the data automatically, and they give you structure (components, routing, DI) that would otherwise be hand-written DOM code.

### How does an Angular 19+ app start?

`main.ts` calls `bootstrapApplication(App, appConfig)`. `appConfig.providers` sets up app-wide services such as `provideRouter` and `provideHttpClient`. There's no `AppModule`.

```ts
// src/main.ts
bootstrapApplication(App, appConfig);
```

### Explain components, modules and services.

- **Components** are UI building blocks: a class, a template and styles. They're **standalone by default since v19**, and each lists what its template uses in `imports`.
- **NgModules** are optional now, mostly found in older libraries and apps.
- **Services** hold shared logic and data. They're usually declared with `@Injectable({ providedIn: 'root' })` and obtained with `inject()`.

### What are templates and directives?

Templates are HTML with Angular syntax: bindings, pipes and control flow. Directives add behavior to elements:

- **Attribute directives** change an element's appearance or behavior, for example `[ngClass]` or `routerLink`.
- **Structural directives** add or remove elements. The built-in `@if`, `@for` and `@switch` blocks (v17+) replace `*ngIf` and `*ngFor` in new code.

```html
@if (audiences.error()) {
  <div class="alert alert-danger">Unable to load products.</div>
} @else {
  @for (a of audiences.value(); track a.id) { ... }
}
```

### What is data binding?

Keeping the view and the class in sync:

| Kind | Syntax |
|---|---|
| Interpolation | `{{ x }}` |
| Property binding | `[src]="url"` |
| Event binding | `(click)="save()"` |
| Two-way binding | `[(value)]="v"` |

### What's the difference between interpolation and property binding?

Interpolation turns a value into text. Property binding sets a DOM or component property to any value: a boolean, an object, or a signal's value.

### How does two-way binding work in 19+?

`[(ngModel)]` still works for forms. For component-to-component two-way binding, use `model()`. It's a writable signal input, and the parent binds to it with `[(value)]`.

```ts
// child
readonly value = model(0);
```

```html
<!-- parent -->
<app-counter [(value)]="count" />
```

### What are the advantages of Angular over other frameworks, and over React?

Angular is a complete framework:

- routing, forms, HTTP, testing and a CLI all come built in;
- TypeScript and dependency injection throughout;
- signals for fine-grained reactivity;
- strong conventions that suit large teams.

React is a UI library, so you choose those pieces yourself.

---

## Decorators

### What are decorators, and what types exist?

Decorators are functions written as `@Name` that attach configuration or behavior to a class or its members:

- **Class decorators:** `@Component`, `@Directive`, `@Pipe`, `@Injectable`.
- **Property, method and parameter decorators.**

In 19+, many property decorators have **function-based replacements**:

| Older decorator | 19+ equivalent |
|---|---|
| `@Input()` | `input()` / `input.required()` |
| `@Output()` | `output()` |
| `@ViewChild` / `@ContentChild` | `viewChild()` / `contentChild()` |
| `@HostListener` / `@HostBinding` | `host: { '(click)': '...' }` in the component settings |
| Constructor injection | `inject()` |

This project's `@LogCall` ([src/app/decorators/log-call.ts](../src/app/decorators/log-call.ts)) is a custom **method decorator**. See [decorators.md](decorators.md).

### What does the `@Component` decorator do?

It marks a class as a component and sets its selector, template or `templateUrl`, styles, `imports` and change detection strategy.

```ts
@Component({
  selector: 'app-products',
  imports: [RouterLink],
  templateUrl: '../../html/products.html',
})
export class Products { ... }
```

---

## Pipes

### What are pipes, pure and impure pipes, `PipeTransform`, and pipes with parameters?

- **Pipes** transform values in templates, for example `{{ price | currency: 'USD' }}`, where `'USD'` is a parameter.
- **Custom pipes** implement `PipeTransform.transform()`, and are standalone.
- **Pure pipes** (the default) only re-run when their input value changes.
- **Impure pipes** (`pure: false`) run on every change detection cycle and are rarely needed.

```ts
@Pipe({ name: 'money' })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null, fallback = 'None') {
    return value === null ? fallback : `$${value.toLocaleString('en-US')}`;
  }
}
```

With signals, a `computed()` often replaces a custom pipe.

---

## Sharing data between components

### How do you pass data from parent to child, and between components?

| Direction | 19+ approach |
|---|---|
| Parent to child | `input()` |
| Child to parent | `output()` and `.emit()` |
| Two-way | `model()` |
| Unrelated components | A shared service holding signals |
| From the URL | Route parameters and data as inputs, with `withComponentInputBinding()` |

```ts
// child
readonly message = input.required<string>();
readonly saved = output<string>();
```

```html
<!-- parent -->
<app-child [message]="parentMessage" (saved)="onSaved($event)" />
```

This project's [audience-products.ts](../src/app/products/audience-products.ts) declares `audienceId = input.required<string>()`, and the router fills it from the URL.

### How do you select an element from the template?

`viewChild('ref')` or `viewChild(SomeComponent)` returns a signal. Use `viewChildren()` for several elements. Only touch the element through `ElementRef` when necessary.

```ts
readonly search = viewChild<ElementRef<HTMLInputElement>>('search');
focus() {
  this.search()?.nativeElement.focus();
}
```

---

## Signals and RxJS

### What is RxJS used for, and how do observables differ from promises?

| | Observable | Promise |
|---|---|---|
| Values | Many over time | One |
| Starts | When something subscribes | Immediately |
| Cancellable | Yes, by unsubscribing | No |
| Operators | `map`, `switchMap`, `retry`, ... | `then` / `catch` only |

`HttpClient` returns observables.

### How do signals differ from observables?

Signals hold a **current value** for the UI:

- `signal()` holds a value you set;
- `computed()` derives a value from other signals;
- `effect()` runs code when signals change;
- `linkedSignal()` (added in v19) is writable, but resets when its source changes.

Observables model **events over time**, such as clicks, WebSocket messages or router events. Convert between them with `toSignal()` and `toObservable()`. This project's [app.ts](../src/app/app.ts) turns router events into a signal with `toSignal` to highlight the current tab.

### How do you load async data in 19+?

`resource()`, `rxResource()` and `httpResource()` wrap loading into signals: `value()`, `error()`, `isLoading()` and `hasValue()`. They re-fetch automatically when the signals they depend on change.

```ts
protected readonly audience = rxResource({
  params: () => this.audienceId(),
  stream: ({ params: id }) => this.api.getAudience(id),
});
```

This project loads its product data this way, through `ProductsService`.

### How do you handle errors in observables?

- Use `catchError` in the pipe, or the `error` callback in `subscribe`.
- `retry` can retry failed requests.
- With resources, check `error()` in the template. This project shows "Unable to load products" that way.

---

## Services, DI and HTTP

### Explain dependency injection.

Classes ask for what they need instead of creating it. Providers are registered with injectors: in the root, on a route or on a component. When code asks for a dependency, the lookup goes up the injector tree. `inject()` works during construction, a period called the **injection context**.

```ts
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
}
```

See [dependency-injection.md](dependency-injection.md) for a walkthrough of this project's example.

### What are HTTP interceptors?

Code that runs on every request and response, for example to add an auth header, log, or handle errors in one place. In 19+ they're **functions**:

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) =>
  next(req.clone({ setHeaders: { Authorization: `Bearer ${inject(AuthService).token()}` } }));

// app.config.ts
provideHttpClient(withInterceptors([authInterceptor]));
```

Class-based `HttpInterceptor` still works, but needs `withInterceptorsFromDi()`. `HttpClientModule` has been deprecated since v18 in favor of `provideHttpClient()`.

---

## Lifecycle and change detection

### What are lifecycle hooks, and what is `ngOnInit`?

`ngOnInit` runs once, after the inputs are first set. `ngOnChanges`, `ngAfterViewInit` and `ngOnDestroy` still exist. In 19+, signals remove the need for many hooks:

| Older hook use | 19+ alternative |
|---|---|
| React to input changes in `ngOnChanges` | `computed()` or `effect()` on signal inputs |
| DOM work in `ngAfterViewInit` | `afterNextRender()` / `afterRender()` |
| Cleanup in `ngOnDestroy` | `DestroyRef.onDestroy()` or `takeUntilDestroyed()` |

### What is change detection, and how does it work?

Change detection updates the DOM when data changes.

- **Classic:** zone.js detects async events, then Angular checks the component tree from the top down.
- **`OnPush`:** skips components whose inputs and signals haven't changed.
- **Zoneless:** no zone.js. Signals and events tell Angular exactly what changed. Zoneless has been stable since v20.

### What is view encapsulation?

How component styles are kept separate:

- `Emulated` (the default) adds unique attributes so styles only apply to that component;
- `ShadowDom` uses the browser's shadow DOM;
- `None` makes styles global.

---

## Build and rendering

### What is AOT compilation?

Ahead-of-time compilation turns templates into JavaScript at build time, not in the browser. That gives faster startup, smaller bundles and template errors at build time. AOT has been the default for years. Builds now use the esbuild-based `application` builder instead of webpack.

### What is transpiling?

Converting TypeScript to JavaScript the browser can run. The CLI does this during `ng build` and `ng serve`.

### What's the difference between client-side and server-side rendering?

- **Client-side rendering** (the default): the browser downloads JavaScript and builds the page.
- **Server-side rendering** (`ng new --ssr`): the server sends ready-made HTML, and the browser then **hydrates** it to make it interactive.
- v19 added **incremental hydration**, which hydrates parts of a page on demand with `@defer`, and per-route render modes: server, client, or prerendered at build time.

### What is eager vs lazy loading?

- **Eager** code is part of the startup bundle.
- **Lazy** code downloads on first use:
  - `loadComponent` for a single page;
  - `loadChildren` for a group of routes;
  - `@defer` for parts of a template.

```ts
{
  path: 'insurance-products',
  loadComponent: () => import('./products/products').then((m) => m.Products),
}
```

This project lazy loads its product pages. See [lazy-loading.md](lazy-loading.md).

### How do you add SASS to a project?

Create the project with `ng new --style=scss`. For an existing project, set `"inlineStyleLanguage": "scss"` in `angular.json` and rename the `.css` files to `.scss`. Global styles are listed under `styles` in `angular.json`.

### What happens when you use a `<script>` tag in a template?

Angular strips it, to protect against cross-site scripting (XSS). Load scripts from `index.html`, `angular.json` or a dynamic `import()` instead.

### What is Angular Material?

Google's UI component library for Angular. Current versions use Material 3 theming. This project uses ng-bootstrap instead.

---

## Routing

For how routing works in this project, see [routing.md](routing.md).

### How do you configure routes in 19+?

Pass a `Routes` array to `provideRouter(routes)` in `app.config.ts`. `RouterModule.forRoot()` and `forChild()` are only needed in NgModule apps. For lazy groups of routes, `loadChildren` returns a `Routes` array directly:

```ts
{ path: 'admin', loadChildren: () => import('./admin/admin.routes').then((m) => m.routes) }
```

### How do you handle 404 and unauthorized routes?

- Add a `**` wildcard route **last**, which redirects or shows a Not Found page. This project redirects it to Home.
- Protect routes with guards that return `false`, or redirect with `router.createUrlTree(['/login'])`.

### What are route guards?

In 19+ they're **functions**:

| Guard | Decides whether... |
|---|---|
| `canActivate` | a route can be opened |
| `canActivateChild` | a route's children can be opened |
| `canDeactivate` | the user can leave a route, for example with unsaved changes |
| `canMatch` | a route can match the URL at all. Also stops lazy code from downloading. |

`CanLoad` is deprecated; use `canMatch`.

```ts
export const authGuard: CanActivateFn = () =>
  inject(AuthService).isLoggedIn() || inject(Router).createUrlTree(['/login']);
```

### What is a resolver, and when should you use one?

A function (`ResolveFn`) that loads data before the route activates. With `withComponentInputBinding()`, the resolved data arrives as an input. Many apps now load data in the component with resources instead, so the page can show a loading state rather than delaying navigation.

### What's the difference between path and query parameters, and between the route snapshot and observables?

- A **path parameter** is part of the URL (`/products/:id`). **Query parameters** follow the `?` (`?sort=price`).
- In the component you can read them:
  - through `ActivatedRoute.snapshot`, which gives the values at one moment;
  - through `paramMap` / `queryParamMap`, which update when the same component is reused for a new URL;
  - most simply, as `input()`s with `withComponentInputBinding()`.

### What does `pathMatch: 'full'` do, and what are the pitfalls of `redirectTo`?

`'full'` matches only if the whole URL matches. It's required for an empty-path redirect, or every URL would match it:

```ts
{ path: '', redirectTo: 'home', pathMatch: 'full' }
```

Other pitfalls: routes are matched in order, and badly placed redirects can create loops. `redirectTo` can also be a function, for redirects that depend on the URL.

### Where should the `**` wildcard route go?

Last. Routes are matched in order, and `**` matches everything, so any route after it can never be reached.

### What are child routes, nested outlets and named outlets?

- `children: [...]` renders routes inside their parent's own `<router-outlet>`, for example tabs within a settings page.
- **Named outlets** (`<router-outlet name="side">`) show extra views in parallel, for example a side panel alongside the main page.

### What's the difference between `router.navigate()` and `navigateByUrl()`, and what are NavigationExtras?

- `navigate(['/products', id], { relativeTo, queryParams })` builds the URL from parts.
- `navigateByUrl('/products/1')` takes a complete URL.
- The extras object adds options such as `queryParams`, `fragment`, `replaceUrl` and `state`.

### How do router links and `routerLinkActive` work?

- `routerLink` navigates without a page reload, and still sets a real `href` so opening in a new tab works.
- `routerLinkActive="active"` adds a class when the route matches.
- `ariaCurrentWhenActive` sets `aria-current` for accessibility.

This project highlights its tabs from router events instead, because ng-bootstrap's `ngbNav` needs an `activeId`.

### What are router events and router state?

- `router.events` emits navigation events such as `NavigationStart`, `NavigationEnd` and `NavigationError`. They're used for loading bars, analytics and highlighting tabs.
- Router state is the tree of activated routes, available through `ActivatedRoute` and `router.routerState`.

### What is `RouteReuseStrategy`?

It decides whether to reuse or keep a component when navigating, for example to keep a list's scroll position and state when the user comes back to it.

### How do you restore scroll position and scroll to anchors?

```ts
provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }));
```

### How do you pass static data to a route?

Add `data` to the route, then read it with `ActivatedRoute.data`, or as an input with `withComponentInputBinding()`:

```ts
{ path: 'providers', component: Page, data: { title: 'Providers' } }
```

This project's shared `Page` component gets its title this way.

---

## Left out as not relevant to Angular 19+

| Question from the source page | Why it's left out |
|---|---|
| Differences between AngularJS and Angular | AngularJS (1.x) reached end of life in 2021 |
| How Angular expressions differ from JavaScript expressions | An AngularJS concept |
| What is scope? | `$scope` is an AngularJS concept; Angular has no scope object |
| What are annotations? | An AngularJS / early Angular 2 concept, replaced by decorators |
| `$digest` loop (inside the change detection answer) | AngularJS; covered by the modern change detection answer above |
| What is a bootstrapping module / `AppModule`? | Replaced by `bootstrapApplication`. Only relevant when maintaining NgModule apps. |
| The `angular.json` walkthrough in "How does an Angular application work?" | It shows the old webpack builder and `polyfills.ts`. New projects use the `application` builder. |
| Class-based guards and interceptors, `HttpClientModule`, `RouterModule.forRoot/forChild` as the main approach | Still supported, but not the 19+ style. Covered by the modern answers above. |
| Create a TypeScript class with a constructor and a function | Generic TypeScript, not specific to any Angular version |
| Explain MVVM architecture | A general pattern question, not specific to any Angular version |
