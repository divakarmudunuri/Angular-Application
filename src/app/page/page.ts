import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page',
  templateUrl: '../../html/page.html',
})
export class Page {
  readonly title = input<string>();
}
