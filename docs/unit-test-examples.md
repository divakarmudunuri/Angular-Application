# Unit test examples

This walks through two tests from the project line by line, one from each suite:

1. **Angular:** the comparison-table test for the audience plans page, which renders a component against a fake API.
2. **API:** the 404 test for an unknown audience, which calls the real Express app over HTTP.

For how to run the tests, see [testing.md](testing.md). For how the fake API is wired in, see [dependency-injection.md](dependency-injection.md).

Both tests follow the same three steps, often called **Arrange, Act, Assert**:

| Step | Angular example | API example |
|---|---|---|
| **Arrange**: set up what the test needs | Build a test injector, create the component, prepare fake data | Start the Express app on a free port |
| **Act**: do the thing being tested | Answer the component's HTTP requests and let it render | Send `GET /api/audiences/xyz` |
| **Assert**: check the result | Read the table cells from the DOM | Check the status code and JSON body |

---

## Example 1: Angular comparison table

**File:** `src/tests/products/audience-products.spec.ts`
**Tests:** `src/app/products/audience-products.ts` with its template `src/html/audience-products.html`

### What it protects

The "Compare plans" table formats each value, and has special wording when a value is missing:

```html
<!-- src/html/audience-products.html -->
<td>{{ p.deductible ? (p.deductible | currency: 'USD' : 'symbol' : '1.0-0') : 'None' }}</td>
<td>{{ p.copay === null ? 'Not applicable' : (p.copay | currency: 'USD' : 'symbol' : '1.0-0') }}</td>
<td>{{ p.coverage === null ? 'Discounts only' : (p.coverage | currency: 'USD' : 'symbol' : '1.0-0') }}</td>
```

Each cell has two paths: a formatted amount, or a fallback word. The test checks both paths for every row.

### Arrange: test data

```ts
const audience: Audience = { id: 'senior', name: 'Seniors and retirees', description: 'For seniors' };
const products: Product[] = [
  { id: 4, ..., monthlyPremium: 95, deductible: 250, copay: 15,   coverage: 300000, ... },
  { id: 9, ..., monthlyPremium: 20, deductible: 0,   copay: null, coverage: null,   ... },
];
```

The two plans are chosen on purpose. Plan 4 has every value, so it takes the "formatted amount" path. Plan 9 has `0` and `null`, so it takes every fallback path. Together they cover both sides of each `? :`, which is why the template reaches 100% branch coverage. The data is typed with `Audience` and `Product` from `api.ts`, so if the API's data shape changes, this file stops compiling.

### Arrange: the `setup` helper

All tests in the file share one helper:

```ts
function setup(audienceId: string) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(AudienceProducts);
  fixture.componentRef.setInput('audienceId', audienceId);
  fixture.detectChanges();
  TestBed.tick();
  return { fixture, http: TestBed.inject(HttpTestingController), el: fixture.nativeElement as HTMLElement };
}
```

| Line | What it does |
|---|---|
| `configureTestingModule({ providers })` | Builds a fresh injector for this test. `provideRouter([])` is needed because the template has a `routerLink` back to All products. `provideHttpClientTesting()` replaces the real network backend with a fake. |
| `createComponent(AudienceProducts)` | Creates the component and its DOM, but doesn't render the template yet. |
| `setInput('audienceId', ...)` | Sets the input the router would normally set from the URL `/insurance-products/senior`. No real navigation is needed. |
| `detectChanges()` | Renders the template for the first time. |
| `TestBed.tick()` | Runs pending effects. `rxResource` calls the `ProductsService` methods from an effect, so without this the next step would find no requests. |
| `TestBed.inject(HttpTestingController)` | Gets the handle the test uses to see and answer requests. |

### Act: answer the requests

```ts
const { fixture, http, el } = setup('senior');
http.expectOne(`${API_URL}/audiences/senior`).flush(audience);
http.expectOne(`${API_URL}/products?audience=senior`).flush(products);
await fixture.whenStable();
fixture.detectChanges();
```

- `expectOne(url)` does two jobs. It **asserts** the component made exactly one request to that URL, and fails the test otherwise. It also returns the request so the test can answer it.
- `flush(data)` answers the request with a `200` and the given JSON. The component's `rxResource` now holds the data.
- `whenStable()` waits for Angular to finish reacting to the responses, and `detectChanges()` re-renders the template with the data.

### Assert: read the table

```ts
const row = (label: string) =>
  [...el.querySelectorAll('tbody tr')]
    .find((tr) => tr.querySelector('th')?.textContent === label)!
    .querySelectorAll('td');
const cells = (label: string) => [...row(label)].map((td) => td.textContent);

expect(cells('Monthly premium')).toEqual(['$95', '$20']);
expect(cells('Deductible')).toEqual(['$250', 'None']);
expect(cells('Copay')).toEqual(['$15', 'Not applicable']);
expect(cells('Coverage')).toEqual(['$300,000', 'Discounts only']);
```

- `cells(label)` finds the table row by its heading text, for example "Deductible", and returns the text of each cell in order: one per plan.
- Rows are found by **visible label**, not position, so reordering the rows in the template doesn't break the test. Renaming a row label does, because users would see that change.
- Each `expect` checks both plans at once. The first value is plan 4's formatted amount, and the second is plan 9's fallback.
- The test checks **what the user sees** (`$300,000`, `Not applicable`), not the component's internal values. It would still pass if the formatting moved from the template into a TypeScript function, as long as the page looks the same.

### Cleanup

```ts
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  TestBed.inject(HttpTestingController).verify();
  vi.restoreAllMocks();
});
```

- The `console` spies silence the `@LogCall` output from `ProductsService`, so it doesn't clutter the test report. `vi.restoreAllMocks()` puts `console` back afterwards.
- After every test, `verify()` fails if the component made a request the test never answered. Unexpected extra API calls are caught this way.

### What a failure looks like

To see the test work, the `'None'` fallback was temporarily changed to `'$0'` in the template. Only the deductible assertion failed:

```text
FAIL  src/tests/products/audience-products.spec.ts > AudienceProducts > formats the comparison table, including missing values
AssertionError: expected [ '$250', '$0' ] to deeply equal [ '$250', 'None' ]

- Expected
+ Received

  [
    "$250",
-   "None",
+   "$0",
  ]

 ❯ src/tests/products/audience-products.spec.ts:63:33
```

The output names the test, shows exactly which value differs, and points to the failing line.

---

## Example 2: API 404 for an unknown audience

**File:** `local-api-server/tests/app.test.js`
**Tests:** the `GET /api/audiences/:id` route in `local-api-server/app.js`

### What it protects

```js
// local-api-server/app.js
app.get('/api/audiences/:id', (req, res) => {
  const audience = audiences.find((a) => a.id === req.params.id);
  audience ? res.json(audience) : res.status(404).json({ message: 'Audience not found' });
});
```

The Angular page relies on this 404. When the request fails with an error status, the page shows "Product group not found". If the API returned `200` with an empty body, the page would try to render an audience with no name.

### Arrange: start the app once for the file

```js
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://localhost:${server.address().port}/api`;
});

after(() => server.close());
```

| Line | What it does |
|---|---|
| `import app from '../app.js'` | Loads the Express app without starting it. `server.js`, which listens on port 3000, is never imported. |
| `app.listen(0)` | Port `0` tells the OS to pick any free port, so the test can't clash with a dev server already on 3000. |
| `server.once('listening', ...)` | Waits until the server is actually accepting connections before any test runs. |
| `server.address().port` | Reads which port the OS picked, to build the base URL. |
| `after(() => server.close())` | Stops the server when the file finishes, so Node can exit. |

`before` and `after` run once for the whole file, not once per test. Starting a server takes a moment, and the API keeps no state between requests, so sharing one server is safe.

### Act: a real HTTP request

```js
const get = async (path) => {
  const res = await fetch(baseUrl + path);
  return { status: res.status, headers: res.headers, body: await res.json() };
};
```

The helper sends a real HTTP request with Node's built-in `fetch`, so the request goes through Express routing, the CORS middleware and JSON serialization, exactly as it would from the browser. It returns the three things tests check.

### Assert: status and body

```js
describe('GET /api/audiences/:id', () => {
  it('returns 404 for an unknown audience', async () => {
    const { status, body } = await get('/audiences/xyz');
    assert.equal(status, 404);
    assert.equal(body.message, 'Audience not found');
  });
});
```

- `describe` groups tests by endpoint, so the output reads like a list of the API's behavior.
- `xyz` is an id that clearly doesn't exist in the sample data.
- `node:assert/strict` makes `assert.equal` use `===`, so `'404'` (a string) wouldn't pass for `404` (a number).
- Checking **both** the status and the message catches two different bugs: the wrong status code, or the right status with the wrong body.

### What a failure looks like

To see the test work, the route was temporarily changed to return `200` with an empty body. Node reported:

```text
✖ returns 404 for an unknown audience (25.048458ms)
...
✖ failing tests:

test at tests/app.test.js:41:3
✖ returns 404 for an unknown audience (25.048458ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
```

It fails on the first assertion, the status code, and points to the test at line 41.

---

## Comparing the two

| | Angular example | API example |
|---|---|---|
| Runner | Vitest, through `ng test` | Node's built-in `node:test` |
| Environment | jsdom, a simulated browser DOM in Node | Real Express server on a random port |
| Network | None. `HttpTestingController` fakes every response | Real HTTP over localhost |
| Assertions | `expect(...).toEqual(...)` | `assert.equal(...)` |
| Checks | Rendered text the user sees | Status code and JSON the client receives |
| Speed | Milliseconds per test | Milliseconds per test |

Together they cover both sides of the same feature. The API test proves the server returns a 404 for an unknown audience. A third test in `audience-products.spec.ts` ("shows a not-found message for an unknown audience") proves the page shows the right message when it gets one.
