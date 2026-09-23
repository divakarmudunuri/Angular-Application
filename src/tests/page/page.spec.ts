import { TestBed } from '@angular/core/testing';
import { Page } from '../../app/page/page';

describe('Page', () => {
  it('renders the title input', () => {
    const fixture = TestBed.createComponent(Page);
    fixture.componentRef.setInput('title', 'About Us');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h2').textContent).toBe('About Us');
  });
});
