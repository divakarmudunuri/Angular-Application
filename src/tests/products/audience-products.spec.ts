import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { API_URL, Audience, Product } from '../../app/products/api';
import { AudienceProducts } from '../../app/products/audience-products';

describe('AudienceProducts', () => {
  const audience: Audience = { id: 'senior', name: 'Seniors and retirees', description: 'For seniors' };
  const products: Product[] = [
    { id: 4, audience: 'senior', name: 'Golden Years PPO', planType: 'PPO', networkSize: 'Large', monthlyPremium: 95, deductible: 250, copay: 15, coverage: 300000, description: 'Broad' },
    { id: 9, audience: 'senior', name: 'Senior Saver', planType: 'Discount plan', networkSize: 'Small', monthlyPremium: 20, deductible: 0, copay: null, coverage: null, description: 'Discounts' },
  ];

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

  // Keep @LogCall output out of the test report
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });

  it('loads the audience and its plans', async () => {
    const { fixture, http, el } = setup('senior');
    http.expectOne(`${API_URL}/audiences/senior`).flush(audience);
    http.expectOne(`${API_URL}/products?audience=senior`).flush(products);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('h2')?.textContent).toBe('Seniors and retirees');
    const cards = [...el.querySelectorAll('.card-title')].map((t) => t.textContent);
    expect(cards).toEqual(['Golden Years PPO', 'Senior Saver']);
  });

  it('formats the comparison table, including missing values', async () => {
    const { fixture, http, el } = setup('senior');
    http.expectOne(`${API_URL}/audiences/senior`).flush(audience);
    http.expectOne(`${API_URL}/products?audience=senior`).flush(products);
    await fixture.whenStable();
    fixture.detectChanges();

    const row = (label: string) =>
      [...el.querySelectorAll('tbody tr')]
        .find((tr) => tr.querySelector('th')?.textContent === label)!
        .querySelectorAll('td');
    const cells = (label: string) => [...row(label)].map((td) => td.textContent);

    expect(cells('Monthly premium')).toEqual(['$95', '$20']);
    expect(cells('Deductible')).toEqual(['$250', 'None']);
    expect(cells('Copay')).toEqual(['$15', 'Not applicable']);
    expect(cells('Coverage')).toEqual(['$300,000', 'Discounts only']);
  });

  it('shows a not-found message for an unknown audience', async () => {
    const { fixture, http, el } = setup('xyz');
    http.expectOne(`${API_URL}/audiences/xyz`).flush({ message: 'Audience not found' }, { status: 404, statusText: 'Not Found' });
    http.expectOne(`${API_URL}/products?audience=xyz`).flush([]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('.alert-warning')?.textContent).toContain('Product group not found');
    expect(el.querySelector('table')).toBeNull();
  });

  it('still shows the audience when the plans request fails', async () => {
    const { fixture, http, el } = setup('senior');
    http.expectOne(`${API_URL}/audiences/senior`).flush(audience);
    http.expectOne(`${API_URL}/products?audience=senior`).flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(el.querySelector('h2')?.textContent).toBe('Seniors and retirees');
    expect(el.querySelectorAll('.card').length).toBe(0);
  });
});
