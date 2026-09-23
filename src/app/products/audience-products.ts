import { Component, inject, input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ProductsService } from './products.service';

@Component({
  selector: 'app-audience-products',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: '../../html/audience-products.html',
})
export class AudienceProducts {
  private api = inject(ProductsService);
  readonly audienceId = input.required<string>();
  protected readonly audience = rxResource({
    params: () => this.audienceId(),
    stream: ({ params: id }) => this.api.getAudience(id),
  });
  protected readonly products = rxResource({
    params: () => this.audienceId(),
    stream: ({ params: id }) => this.api.getProducts(id),
  });
}
