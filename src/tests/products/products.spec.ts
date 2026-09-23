import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { API_URL, Audience } from '../../app/products/api';
import { Products } from '../../app/products/products';

describe('Products', () => {
  const audiences: Audience[] = [
    { id: 'individual', name: 'Individuals and families', description: 'For you' },
    { id: 'senior', name: 'Seniors and retirees', description: 'For seniors' },
  ];

  function setup() {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(Products);
    fixture.detectChanges();
    TestBed.tick();
    return { fixture, http: TestBed.inject(HttpTestingController) };
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

  it('renders a card per audience linking to its plans', async () => {
    const { fixture, http } = setup();
    http.expectOne(`${API_URL}/audiences`).flush(audiences);
    await fixture.whenStable();
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    const titles = [...el.querySelectorAll('.card-title')].map((t) => t.textContent);
    expect(titles).toEqual(['Individuals and families', 'Seniors and retirees']);
    const links = [...el.querySelectorAll('a.btn')].map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/individual', '/senior']);
  });

  it('shows an error when the API fails', async () => {
    const { fixture, http } = setup();
    http.expectOne(`${API_URL}/audiences`).flush(null, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.alert-danger')).not.toBeNull();
  });
});
