import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { LogCall } from '../decorators/log-call';
import { API_URL, Audience, Product } from './api';

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
