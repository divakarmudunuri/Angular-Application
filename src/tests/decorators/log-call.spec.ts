import { of, throwError } from 'rxjs';
import { LogCall } from '../../app/decorators/log-call';

class Example {
  @LogCall
  load(id: string) {
    return of({ id });
  }

  @LogCall
  fail() {
    return throwError(() => new Error('boom'));
  }

  @LogCall
  add(a: number, b: number) {
    return a + b;
  }
}

describe('LogCall', () => {
  let log: ReturnType<typeof vi.spyOn>;
  let error: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, 'log').mockImplementation(() => {});
    error = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => vi.restoreAllMocks());

  it('logs the arguments and the Observable response', () => {
    let received: unknown;
    new Example().load('senior').subscribe((value) => (received = value));

    expect(received).toEqual({ id: 'senior' });
    expect(log).toHaveBeenCalledWith('[LogCall] Example.load', ['senior']);
    expect(log).toHaveBeenCalledWith('[LogCall] Example.load response', { id: 'senior' });
  });

  it('does not log the response until the Observable is subscribed', () => {
    new Example().load('senior');
    expect(log).toHaveBeenCalledTimes(1);
  });

  it('logs errors and still passes them on', () => {
    let caught: unknown;
    new Example().fail().subscribe({ error: (e) => (caught = e) });

    expect((caught as Error).message).toBe('boom');
    expect(error).toHaveBeenCalledWith('[LogCall] Example.fail failed', caught);
  });

  it('logs and returns plain return values unchanged', () => {
    expect(new Example().add(2, 3)).toBe(5);
    expect(log).toHaveBeenCalledWith('[LogCall] Example.add returned', 5);
  });
});
