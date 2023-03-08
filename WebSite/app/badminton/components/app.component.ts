import { Component, OnInit, ElementRef, ViewContainerRef, Type, Injector } from '@angular/core';
import { CalculateActionsComponent } from './calculate-actions.component';
import { RefundActionsComponent } from './refund-actions.component';
import { EarlySettlementComponent } from './early-settlement.component';
import { PageType } from '../../shared/constants';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { AppBaseComponent } from '../../shared/components/sportsbook-sop/app-base.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
})
export class AppComponent extends AppBaseComponent implements OnInit {
  constructor(
    protected injector: Injector,
    protected elementRef: ElementRef<HTMLElement>,
    protected viewContainerRef: ViewContainerRef) {
    super (elementRef, viewContainerRef);
  }

  public ngOnInit() {
    this.createTemplateComponent(this.getComponentFactory());
  }

  private getComponentFactory(): Type<SportTemplate> {
    const pageType = this.elementRef.nativeElement.getAttribute('page-type');
    switch (pageType) {
      case PageType.ReCalculate:
        return CalculateActionsComponent;
      case PageType.Refund:
        return RefundActionsComponent;
      case PageType.EarlySettlement:
        return EarlySettlementComponent;
      default:
        throw new Error('Not implemented yet');
    }
  }
}