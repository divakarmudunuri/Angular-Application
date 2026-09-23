# Code coverage

Code coverage measures which parts of the source code ran while the tests ran. It shows code that no test touches. It can't show whether the tests check the right things: a line counts as covered as soon as it runs, even if no `expect` looks at its result.

For the commands, see [testing.md](testing.md#running-the-tests). In short:

```bash
npx ng test --watch=false --coverage
```

```bash
cd local-api-server && npm run test:coverage
```

## The four numbers

Both suites report the same four metrics:

| Metric | Counts | Example in this project |
|---|---|---|
| **Statements** | Each statement or expression that ran | `topLevel(url)` in `app.ts` |
| **Branches** | Each path through a decision: both sides of an `if`, `? :`, `??`, `&&` | `p.copay === null ? 'Not applicable' : ...` in `audience-products.html` needs one plan with a copay and one without |
| **Functions** | Each function or callback called at least once, including template event handlers | `(click)="menuCollapsed = true"` on the logo in `app.html` |
| **Lines** | Each source line where at least one statement ran | |

Branches are usually the most useful number. A line with a `? :` counts as covered as soon as either side runs, but branch coverage only reaches 100% when both sides run.

## How the Angular coverage works

### 1. V8 counts what runs

`ng test` builds the app and the specs with esbuild, then runs them in Vitest using jsdom in Node.js. With `--coverage`, the `@vitest/coverage-v8` provider switches on the coverage counters built into V8, the JavaScript engine in Node and Chrome. V8 records how many times each function and block of code runs. The code isn't changed or instrumented, so tests run at almost normal speed.

### 2. Source maps map it back to your files

V8 counts positions in the compiled JavaScript, not in the TypeScript or HTML. The build writes source maps, and the coverage provider uses them to convert each counted position back to a line in the original file.

That's why the report lists `src/html/*.html` files. Angular compiles each template into a JavaScript function, and the source map links that code back to the HTML. Template control flow is counted as branches:

- `@if` / `@else` count as branches, so `products.html` needs a success test and an API error test to reach 100%.
- `@for` bodies only count as run when the list has at least one item.
- Event bindings such as `(click)` count as functions, which is why the logo's click handler shows up as the one uncovered function.

### 3. Which files are included

Only source files the tests load are measured. Right now that's:

- `src/app/`: `app.ts`, `app.routes.ts`, `home/home.ts`, `page/page.ts`, `products/api.ts`, `products/products.service.ts`, `products/products.ts`, `products/audience-products.ts`, `decorators/log-call.ts`
- `src/html/`: all five templates

These files are not in the report:

- **Spec files** under `src/tests/`: they are the tests themselves.
- **`main.ts` and `app.config.ts`:** no test imports them. The tests set up their own providers with `TestBed`, not `appConfig`.
- **Files no test imports:** a new component with no spec is missing from the report instead of showing 0%. Check the file list, not just the percentage.

To narrow or widen the files measured, pass glob patterns:

```bash
npx ng test --watch=false --coverage --coverage-include "src/app/products/**" --coverage-include "src/html/*products.html"
```

Templates live in `src/html/`, not next to their components, so include them with a separate pattern.

### 4. Reports

| Report | Where | Use |
|---|---|---|
| Terminal table and summary | printed after the test run | Quick check. Files at 100% are hidden from the table. |
| HTML | `coverage/sri-insurance/index.html` | Browse each file line by line. Uncovered code is highlighted in red, and branches that never ran are marked `I` (if) or `E` (else). |
| `coverage-final.json`, `clover.xml` | `coverage/sri-insurance/` | Machine-readable, for CI tools. |

Choose specific reports with `--coverage-reporters`, for example `--coverage-reporters html text-summary`. The `coverage/` folder is in `.gitignore`.

## How the API coverage works

The API uses Node's built-in coverage, which also reads V8's counters, so no package is installed. `npm run test:coverage` runs:

```bash
node --test --experimental-test-coverage --test-coverage-exclude="tests/**" "tests/**/*.test.js"
```

- `--experimental-test-coverage` switches coverage on. It still carries the "experimental" label in Node, but it's stable enough for this use.
- `--test-coverage-exclude="tests/**"` keeps the test files out of the report, leaving `app.js`.
- `server.js` never runs during tests, because the tests import `app.js` directly, so it isn't in the report.
- The API is plain JavaScript, so no source maps are needed. The report prints to the terminal only; there's no HTML report.

## Current results

| Suite | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| Angular | 99.18% | 98.61% (71/72) | 96.29% (26/27) | 100% |
| API (`app.js`) | 100% | 100% | 100% | 100% |

The Angular gaps:

- **The logo's `(click)` handler** in `src/html/app.html`, which closes the mobile menu. A test in `src/tests/app.spec.ts` that opens the menu and then clicks the logo would cover it.
- **The production branch of `@LogCall`** (`if (!isDevMode()) return result;`, line 10 of `src/app/decorators/log-call.ts`). Tests always run in dev mode, so this path never runs. Covering it would mean mocking `isDevMode`, which adds complexity for a one-line early return.

## Reading the numbers

- **Look for uncovered branches first.** They usually mean an error or empty state that no test checks. That's how the tests found the crash when the API was down.
- **100% doesn't mean bug-free.** It means every line ran, not that every result was checked.
- **Don't chase 100%.** Covering a simple one-line handler adds little value. Focus on logic, data formatting and error handling.
