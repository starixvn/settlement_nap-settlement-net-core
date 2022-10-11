import { Component, ElementRef } from '@angular/core';
import { ReCheckInService } from '../../../shared/services';
import { PageBaseComponent } from '../base-component';

@Component({
  selector: 'calculate-page',
  templateUrl: './page.component.html',
  providers: [
    ReCheckInService,
  ],
})
export class PageComponent extends PageBaseComponent {
  public disableRefund: boolean;
  constructor(protected reCheckInService: ReCheckInService,
    protected elementRef: ElementRef<HTMLElement>,
  ) { super(reCheckInService, elementRef); }

    public getInfoDisableRefund(event) {
      this.disableRefund = event;
    }
}
