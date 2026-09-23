import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NgbCollapse, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { filter, map } from 'rxjs';

@Component({
  imports: [RouterOutlet, RouterLink, NgbNavModule, NgbCollapse],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: '../html/app.html',
})
export class App {
  private router = inject(Router);
  protected menuCollapsed = true;
  protected readonly tabs = [
    { path: '/insurance-products', label: 'Insurance Products' },
    { path: '/member-tools', label: 'Member Tools' },
    { path: '/providers', label: 'Providers' },
    { path: '/about-us', label: 'About Us' },
  ];
  protected readonly activeTab = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => topLevel(e.urlAfterRedirects)),
    ),
    { initialValue: topLevel(this.router.url) },
  );
}

// '/insurance-products/senior' -> '/insurance-products' so the parent tab stays highlighted
function topLevel(url: string) {
  return '/' + url.split(/[/?#]/)[1];
}
