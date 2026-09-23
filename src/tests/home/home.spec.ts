import { TestBed } from '@angular/core/testing';
import { Home } from '../../app/home/home';

describe('Home', () => {
  it('renders the hero banner and three articles', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain('Protecting what matters most');
    expect(el.querySelectorAll('article').length).toBe(3);
  });
});
