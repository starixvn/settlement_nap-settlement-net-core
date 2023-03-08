import { Component, OnInit, ElementRef, ComponentRef, ViewContainerRef, Type } from '@angular/core';
import * as _ from 'lodash';
import { PageType } from '../../shared/constants';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { CalculateActionsComponent as CalculationTennis } from './calculate-actions.component';
import { RefundActionsComponent as RefundTennis } from './refund-actions.component';
import { AppBaseComponent } from '../../shared/components/sportsbook-sop/app-base.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true
})
export class AppComponent extends AppBaseComponent implements OnInit {
  public pageType: string;
  public component: ComponentRef<SportTemplate>;

  constructor(
    protected elementRef: ElementRef<HTMLElement>,
    protected viewContainerRef: ViewContainerRef) {
      super(elementRef, viewContainerRef);
  }

  public ngOnInit() {
    this.createTemplateComponent(this.getComponentFactory());
  }

  private getComponentFactory(): Type<SportTemplate> {
    const pageType = this.elementRef.nativeElement.getAttribute('page-type');
    switch (pageType) {
      case PageType.ReCalculate:
        return CalculationTennis;
      case PageType.Refund:
        return RefundTennis;
      default:
        throw new Error('Not implemented yet');
    }
  }
}