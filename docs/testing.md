# Testing

The project has two independent test suites:

| Suite | Location | Runner | What it tests |
|---|---|---|---|
| Angular unit tests | `src/tests/` | [Vitest](https://vitest.dev/) via `ng test`, in jsdom | Components, templates, routing and tab behavior |
| API tests | `local-api-server/tests/` | Node's built-in `node:test` | Express endpoints over real HTTP |

Neither suite needs the other app running. The Angular tests fake all HTTP calls, and the API tests start their own server.

## Running the tests

### Angular

From the project root:

```bash
npm test -- --watch=false
```

Leave out `--watch=false` to keep Vitest running and re-run tests when files change.

Run the tests in one folder or file:

```bash
npx ng test --watch=false --include src/tests/products
```

Run only the tests whose suite or test name matches a regular expression:

```bash
npx ng test --watch=false --filter "^App"
```

Coverage (uses `@vitest/coverage-v8`, installed as a dev dependency):

```bash
npx ng test --watch=false --coverage
```

A summary prints in the terminal and a full HTML report is written to `coverage/sri-insurance/index.html`. The `coverage/` folder is in `.gitignore`. Files with 100% coverage are left out of the terminal table. See [coverage.md](coverage.md) for how coverage works.

### API

From `local-api-server/`:

```bash
npm test
```

Coverage (Node's built-in coverage, no extra install; prints to the terminal):

```bash
npm run test:coverage
```

To run only tests whose name matches a pattern, call Node directly. The filter must come before the file pattern, so it can't be appended to `npm test`:

```bash
node --test --test-name-pattern="404" "tests/**/*.test.js"
```

## How the Angular tests work

For a line-by-line walkthrough of one Angular test and one API test, see [unit-test-examples.md](unit-test-examples.md).

### Layout

`src/tests/` mirrors `src/app/`. Each spec imports the code it tests from the matching folder:

| Spec | Tests |
|---|---|
| `src/tests/app.spec.ts` | `src/app/app.ts`: logo, tabs, active tab, collapsible menu |
| `src/tests/home/home.spec.ts` | `src/app/home/home.ts`: hero banner and articles |
| `src/tests/page/page.spec.ts` | `src/app/page/page.ts`: title from its input |
| `src/tests/products/products.spec.ts` | `src/app/products/products.ts`: audience cards and API error |
| `src/tests/products/audience-products.spec.ts` | `src/app/products/audience-products.ts`: plans, compare table, not-found and failure states |

`ng test` finds every `*.spec.ts` file under the project by default, and `tsconfig.app.json` excludes them from the production build. `ng generate` still creates specs next to the component, so move new ones into the matching `src/tests/` folder.

### Rendering a component

Each test creates the component with Angular's `TestBed`, runs change detection, then checks the rendered DOM:

```ts
const fixture = TestBed.createComponent(Home);
fixture.detectChanges();
expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Protecting what matters most');
```

Components that take route inputs are given them directly, with no router involved:

```ts
fixture.componentRef.setInput('audienceId', 'senior');
```

### Faking the API

`Products` and `AudienceProducts` load data through `ProductsService`, using `rxResource`. The tests swap the real HTTP backend for Angular's `HttpTestingController`, so no request leaves the test:

```ts
providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()]
```

Each test then follows the same steps:

1. **Create the component** and call `fixture.detectChanges()`, then `TestBed.tick()`. The tick is needed because `rxResource` starts loading from an effect.
2. **Answer the request** with `http.expectOne(url).flush(data)`. Pass a status to simulate a failure, for example `flush(null, { status: 500, statusText: 'Server Error' })`.
3. **Re-render** with `await fixture.whenStable()` and `fixture.detectChanges()`, then check the DOM.

`afterEach(() => http.verify())` fails the test if the component made a request the test didn't expect.

### Testing the app shell

`app.spec.ts` uses the real routes from `app.routes.ts` and navigates with the `Router`. This checks the right tab is highlighted for each URL, including `/insurance-products/senior`, which should still highlight Insurance Products.

ng-bootstrap's collapse animation is switched off with `NgbConfig.animation = false`. The menu's `show` class then changes immediately when the ☰ button or a tab is clicked, instead of after an animation.

## How the API tests work

The Express app is split into two files so tests can load it without starting the real server:

- `app.js` builds the Express app and exports it.
- `server.js` imports it and calls `listen(PORT)`.

`tests/app.test.js` starts the app on port `0`, which makes the OS pick a free port, so tests never clash with a running server on 3000. Each test then calls the API with `fetch` and checks the status code, JSON body and headers:

```js
before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}/api`;
});

after(() => server.close());
```

The tests cover all four endpoints: normal results, 404 responses, the `?audience=` filter, and the CORS header that lets the Angular dev server call the API.

## Adding tests

- **New Angular component:** add a spec under `src/tests/` in the folder matching its location in `src/app/`. If it calls the API, use the "Faking the API" steps above.
- **New API endpoint:** add a `describe` block to `local-api-server/tests/app.test.js`, or a new `*.test.js` file in the same folder. The `npm test` pattern picks up any `tests/**/*.test.js` file.
