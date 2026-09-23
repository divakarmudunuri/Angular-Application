# Not implemented

Samples from [angular-interview-questions.md](angular-interview-questions.md) that this project doesn't demonstrate yet, logged to implement at a later date. For the samples already in the project, see [implemented.md](implemented.md).

The list was built by checking the source code in `src/app/`, `src/html/` and `src/main.ts` for each API the questions mention. Test files don't count. Parts of a question the project already covers are left out.

**Fit** says how naturally each item suits the app as it is:

- **Good:** fits the existing pages without inventing features.
- **Needs a feature:** only makes sense once the app has something new, such as a login or a form.

Tick an item when it's implemented, and add a link to where it's used.

## Fundamentals and components

| Done | Topic | Missing sample | Fit | Suggested use in this app |
|---|---|---|---|---|
| [ ] | Directives | `[ngClass]` / `[ngStyle]`. Library attribute directives (`routerLink`, `ngbNav`) are already used. | Good | Highlight the cheapest plan card on the plans page |
| [ ] | Directives | A custom attribute directive with `@Directive` | Good | `appTrackClick` to log clicks on "Get a Quote" and "See plans" |
| [ ] | Directives | `@switch` | Good | Show a different badge style per plan type (PPO, HMO, Discount plan) |
| [ ] | Two-way binding | `model()` with `[(value)]` | Needs a feature | A quote form or a plan filter component |
| [ ] | Two-way binding | `[(ngModel)]` | Needs a feature | Fields in a "Get a Quote" form |
| [ ] | Parent to child through a template | `input()` bound by a parent, such as `<app-plan-card [plan]="p" />`. Inputs are currently only filled by the router. | Good | A plan-card child component used by the plans page |
| [ ] | Child to parent | `output()` and `.emit()` | Good | The same plan-card component emits "Select plan" |
| [ ] | Sharing through a service | A service holding signals shared by several components | Good | Remember the selected plan across pages |
| [ ] | Selecting template elements | `viewChild()`, `viewChildren()`, `ElementRef` | Good | Scroll to the comparison table or focus a field |

## Decorators and pipes

| Done | Topic | Missing sample | Fit | Suggested use in this app |
|---|---|---|---|---|
| [ ] | Function replacements for decorators | `contentChild()` / `contentChildren()` | Good | A card component that reads projected content. `output()` and `viewChild()` are listed under Fundamentals. |
| [ ] | Function replacements for decorators | `host: { ... }` component setting | Good | Close the mobile menu with the Escape key |
| [ ] | Custom pipe | `@Pipe` implementing `PipeTransform` | Good | A `money` pipe for the comparison table's amounts and "None" / "Not applicable" fallbacks |

## Signals and RxJS

| Done | Topic | Missing sample | Fit | Suggested use in this app |
|---|---|---|---|---|
| [ ] | Core signals | `signal()` | Good | Turn `menuCollapsed` in `app.ts` into a signal |
| [ ] | Core signals | `computed()` | Good | "Cheapest plan" or "plan count" on the plans page |
| [ ] | Core signals | `effect()` | Good | Save the last viewed audience to `localStorage` |
| [ ] | Core signals | `linkedSignal()` | Good | A selected plan that resets when the audience changes |
| [ ] | Core signals | `toObservable()` | Good | Debounce a search or filter signal with RxJS |
| [ ] | Resources | `resource()` | Good | Load data from a non-HTTP async source |
| [ ] | Resources | `httpResource()` | Good | An alternative to `rxResource` for a simple page (the product pages used it before `ProductsService` and `@LogCall` replaced it) |
| [ ] | RxJS error handling | `catchError`, `retry` | Good | Retry failed API calls once in `ProductsService` |

## Services, HTTP, lifecycle and change detection

| Done | Topic | Missing sample | Fit | Suggested use in this app |
|---|---|---|---|---|
| [ ] | HTTP interceptors | Functional interceptor with `withInterceptors` | Good | Add a request-ID header, or show a global loading indicator |
| [ ] | Lifecycle hooks | `ngOnInit`, `ngOnDestroy` or others | Good | Only as a comparison with the signal-based alternatives below |
| [ ] | Lifecycle alternatives | `afterNextRender()` / `afterRender()` | Good | Measure or focus DOM elements after render |
| [ ] | Lifecycle alternatives | `DestroyRef` / `takeUntilDestroyed()` | Good | Clean up a manual subscription |
| [ ] | Change detection | `ChangeDetectionStrategy.OnPush` | Good | The components already rely mostly on signals |
| [ ] | Change detection | Zoneless (`provideZonelessChangeDetection`) | Good | Replace `provideZoneChangeDetection` in `app.config.ts` and remove zone.js |
| [ ] | View encapsulation | Explicit `ViewEncapsulation` setting | Good | Demonstrate `ShadowDom` or `None` on one component. `Emulated` is already used by default. |

## Build and rendering

| Done | Topic | Missing sample | Fit | Suggested use in this app |
|---|---|---|---|---|
| [ ] | SSR and hydration | Server-side rendering, incremental hydration | Needs a feature | Worth it if SEO matters for the product pages |
| [ ] | `@defer` | Deferred template blocks | Good | Load the comparison table when it scrolls into view |
| [ ] | Lazy loading | `loadChildren` | Needs a feature | A section with several routes, such as Member Tools |
| [ ] | SASS | `.scss` styles | Good | Convert `styles.css` and `app.css`, and use Bootstrap's Sass variables |
| [ ] | Angular Material | Material components | Needs a feature | The app uses ng-bootstrap; mixing both isn't recommended |

## Routing

| Done | Topic | Missing sample | Fit | Suggested use in this app |
|---|---|---|---|---|
| [ ] | Guards | `canActivate`, `canMatch`, `canDeactivate` | Needs a feature | Protect Member Tools behind a login |
| [ ] | Guards | Redirect with `createUrlTree` | Needs a feature | Send logged-out users to a login page |
| [ ] | Resolvers | `ResolveFn` | Good | Load the audience before the plans page opens, to compare with `rxResource` |
| [ ] | Reading route parameters | `ActivatedRoute`, `snapshot`, `paramMap` | Good | Only as a comparison; the app uses input binding |
| [ ] | Route query parameters | `queryParams` in the URL. HTTP query parameters are already used by `ProductsService`. | Good | Sort the comparison table with `?sort=price` |
| [ ] | `pathMatch: 'full'` | Empty-path redirect | Good | Only needed with an empty-path redirect, such as `''` to `home` |
| [ ] | Child routes | `children: [...]` with a nested `<router-outlet>` | Needs a feature | Sub-pages under Member Tools |
| [ ] | Named outlets | `<router-outlet name="...">` | Needs a feature | A side panel, such as plan details next to the list |
| [ ] | Programmatic navigation | `router.navigate()` / `navigateByUrl()` in app code. `navigateByUrl` is already used in `src/tests/app.spec.ts`. | Good | Navigate after choosing a plan or submitting a form |
| [ ] | `routerLinkActive` | Active link styling | Good | Only as a comparison; the tabs use `ngbNav` with router events |
| [ ] | `RouteReuseStrategy` | Custom reuse strategy | Needs a feature | Keep the plans page state when returning to it |
| [ ] | Scroll restoration | `withInMemoryScrolling` | Good | Restore scroll position on back navigation and support `#anchor` links |

## Suggested first batch

These are small, fit the existing pages, and would each come with tests:

1. `signal()` / `computed()`: make `menuCollapsed` a signal, and add a "cheapest plan" computed value.
2. A plan-card child component: a parent-to-child `input()`, an `output()` that emits "Select plan", and `viewChild()` in the parent.
3. A custom `money` pipe for the comparison table.
4. A functional HTTP interceptor that adds a request-ID header.
