# Decorators

A decorator is a function, written as `@Name` just above a class or method, that TypeScript calls when the class is defined. It can attach settings to the class or wrap a method with extra behavior, without changing the class body.

The project uses three decorators:

| Decorator | Kind | Where | What it does |
|---|---|---|---|
| `@Component` | Angular, class | Every component in `src/app/` | Marks a class as a component and sets its selector, template and imports |
| `@Injectable` | Angular, class | `src/app/products/products.service.ts` | Registers `ProductsService` with the root injector, so pages can `inject()` it |
| `@LogCall` | Custom, method | `src/app/decorators/log-call.ts`, used in `ProductsService` | Logs each API call's arguments and its response or error |

For how `@Injectable` and `inject()` work together, see [dependency-injection.md](dependency-injection.md). The rest of this page covers the custom `@LogCall` decorator.

## `@LogCall`: logging API calls

### What you see

With the dev server running, open the browser's developer console and browse the Insurance Products pages:

```text
[LogCall] ProductsService.getAudience ['senior']
[LogCall] ProductsService.getProducts ['senior']
[LogCall] ProductsService.getAudience response {id: 'senior', name: 'Seniors and retirees', ...}
[LogCall] ProductsService.getProducts response [{...}, {...}]
```

For an unknown audience such as `/insurance-products/xyz`, the failed request is logged as an error:

```text
[LogCall] ProductsService.getAudience failed HttpErrorResponse {status: 404, statusText: 'Not Found', ...}
```

### Where it's used

```ts
// src/app/products/products.service.ts
@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  @LogCall
  getAudiences() {
    return this.http.get<Audience[]>(`${API_URL}/audiences`);
  }

  @LogCall
  getAudience(id: string) {
    return this.http.get<Audience>(`${API_URL}/audiences/${id}`);
  }

  @LogCall
  getProducts(audienceId: string) {
    return this.http.get<Product[]>(`${API_URL}/products`, { params: { audience: audienceId } });
  }
}
```

The method bodies contain no logging code. Adding or removing `@LogCall` switches logging on or off for that method.

The pages call these methods through `rxResource`, which subscribes to the returned Observable and exposes the result as signals (`value()`, `error()`, `hasValue()`):

```ts
// src/app/products/audience-products.ts
protected readonly audience = rxResource({
  params: () => this.audienceId(),
  stream: ({ params: id }) => this.api.getAudience(id),
});
```

### How it works

```ts
// src/app/decorators/log-call.ts
export function LogCall(target: object, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (this: unknown, ...args: unknown[]) {
    const result = original.apply(this, args);
    if (!isDevMode()) return result;

    // The build renames decorated classes (ProductsService -> _ProductsService), so drop the prefix
    const name = `${target.constructor.name.replace(/^_+/, '')}.${key}`;
    console.log(`[LogCall] ${name}`, args);
    if (!(result instanceof Observable)) {
      console.log(`[LogCall] ${name} returned`, result);
      return result;
    }
    return result.pipe(
      tap({
        next: (response) => console.log(`[LogCall] ${name} response`, response),
        error: (error) => console.error(`[LogCall] ${name} failed`, error),
      }),
    );
  };
}
```

**1. TypeScript calls the decorator once, when the class is defined.** It isn't called on every method call. It receives three things:

| Parameter | Value for `getAudience` |
|---|---|
| `target` | `ProductsService.prototype`, the object that holds the class's methods |
| `key` | `'getAudience'` |
| `descriptor` | The property descriptor. `descriptor.value` is the original `getAudience` function. |

**2. It replaces the method with a wrapper.** The decorator saves the original function, then sets `descriptor.value` to a new function. From then on, every call to `getAudience` runs the wrapper.

**3. The wrapper calls the original.** `original.apply(this, args)` runs the real method with the same `this` and arguments, so `this.http` still works. The wrapper uses `function`, not an arrow function, so that `this` is the service instance.

**4. It logs the call.** The class and method name are logged with the arguments, for example `ProductsService.getAudience ['senior']`.

**5. It logs the response when it arrives.** `HttpClient.get` returns an Observable, and no request is sent until something subscribes. The wrapper can't log the response straight away, so it adds a `tap` step to the Observable:

- `next` logs each response as it arrives.
- `error` logs a failed request with `console.error`.
- `tap` only watches. The same response or error still reaches `rxResource`, so the page behaves exactly as it would without the decorator.

If a decorated method returns a plain value, not an Observable, the wrapper logs it straight away and returns it unchanged.

**6. It only logs in development.** `isDevMode()` is `true` under `ng serve` and in tests, and `false` in a production build (`npm run build`). In production the wrapper returns the result without logging, so response data never ends up in users' browser consoles.

### Why the class name has an underscore

The build tool compiles a class with decorators into a class named `_ProductsService`, so `target.constructor.name` returns that name. The decorator strips leading underscores so the log shows `ProductsService`. In a production build names are shortened anyway, but nothing is logged there.

### The TypeScript setting it depends on

`tsconfig.json` has `"experimentalDecorators": true`, which Angular projects use. That selects TypeScript's older decorator format, with the `(target, key, descriptor)` parameters above. TypeScript also supports the newer standard decorator format, which uses different parameters, but the two can't be mixed in one project. Any new custom decorator here must use the older form.

## Testing

`src/tests/decorators/log-call.spec.ts` tests the decorator on its own, using a small example class instead of the real service:

| Test | Checks |
|---|---|
| logs the arguments and the Observable response | The call and its response are both logged, and the value still reaches the subscriber |
| does not log the response until the Observable is subscribed | Only the call is logged. Nothing else happens until something subscribes. |
| logs errors and still passes them on | The error is logged with `console.error`, and the subscriber still receives it |
| logs and returns plain return values unchanged | Non-Observable results are logged and returned as they are |

Each test replaces `console.log` and `console.error` with Vitest spies (`vi.spyOn(console, 'log')`), so the test can check what was logged without printing anything.

The component tests in `src/tests/products/` also go through `@LogCall`, because they use the real `ProductsService`. They silence `console` in `beforeEach` to keep the test report clean. See [unit-test-examples.md](unit-test-examples.md#cleanup).

## Adding `@LogCall` to another method

1. Import it: `import { LogCall } from '../decorators/log-call';`, adjusting the path.
2. Put `@LogCall` on the line above the method.

It works on any class method, not just in services. Methods that return Observables get their responses logged, and all other methods get their return value logged.
