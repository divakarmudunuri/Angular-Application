import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { NgbConfig } from '@ng-bootstrap/ng-bootstrap';
import { App } from '../app/app';
import { routes } from '../app/app.routes';

describe('App', () => {
  async function setup(url = '/') {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(NgbConfig).animation = false;
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const activeTab = () => el.querySelector('.nav-link.active')?.textContent?.trim();
    return { fixture, el, activeTab };
  }

  it('renders the logo linking to home', async () => {
    const { el } = await setup();
    const logo = el.querySelector('a.navbar-brand');
    expect(logo?.getAttribute('href')).toBe('/');
    expect(logo?.querySelector('img')?.getAttribute('alt')).toBe('Sri Insurance');
  });

  it('renders the four tabs', async () => {
    const { el } = await setup();
    const tabs = [...el.querySelectorAll('.nav-link')].map((a) => a.textContent?.trim());
    expect(tabs).toEqual(['Insurance Products', 'Member Tools', 'Providers', 'About Us']);
  });

  it('highlights no tab on the home page', async () => {
    const { activeTab } = await setup('/');
    expect(activeTab()).toBeUndefined();
  });

  it('highlights the tab for the current page', async () => {
    const { activeTab } = await setup('/providers');
    expect(activeTab()).toBe('Providers');
  });

  it('keeps Insurance Products highlighted on an audience page', async () => {
    const { activeTab } = await setup('/insurance-products/senior');
    expect(activeTab()).toBe('Insurance Products');
  });

  it('toggles the collapsible menu', async () => {
    const { fixture, el } = await setup();
    const menu = el.querySelector('.navbar-collapse')!;
    expect(menu.classList).not.toContain('show');

    el.querySelector<HTMLButtonElement>('.navbar-toggler')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(menu.classList).toContain('show');

    el.querySelector<HTMLAnchorElement>('.nav-link')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(menu.classList).not.toContain('show');
  });
});
