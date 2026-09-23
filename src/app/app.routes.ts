import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Page } from './page/page';

export const routes: Routes = [
  { path: '', component: Home },
  // Product pages are lazy loaded: each is downloaded the first time it's visited
  {
    path: 'insurance-products',
    loadComponent: () => import('./products/products').then((m) => m.Products),
  },
  {
    path: 'insurance-products/:audienceId',
    loadComponent: () => import('./products/audience-products').then((m) => m.AudienceProducts),
  },
  { path: 'member-tools', component: Page, data: { title: 'Member Tools' } },
  { path: 'providers', component: Page, data: { title: 'Providers' } },
  { path: 'about-us', component: Page, data: { title: 'About Us' } },
  { path: '**', redirectTo: '' },
];
