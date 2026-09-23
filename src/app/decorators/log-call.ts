import { isDevMode } from '@angular/core';
import { Observable, tap } from 'rxjs';

// Method decorator: logs each call's arguments and its response (or error) in dev mode.
// Observable results are logged when they emit, so HTTP responses are logged on arrival.
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
