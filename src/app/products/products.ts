import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-products',
  imports: [RouterLink],
  templateUrl: '../../html/products.html',
})
export class Products {
  private api = inject(ProductsService);
  protected readonly audiences = rxResource({ stream: () => this.api.getAudiences() });
}
