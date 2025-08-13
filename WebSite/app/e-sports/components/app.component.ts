import { Component, OnInit, ElementRef, ViewContainerRef, Type } from '@angular/core';
import { PageType } from '../../shared/constants';
import { CalculationActionsComponent as CalculationESport } from './calculation-actions.component';
import { RefundActionsComponent as RefundESport } from './refund-actions.component';
import { EarlySettlementComponent as EarlyESport } from './early-settlement.component';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { AppBaseComponent } from '../../shared/components/sportsbook-sop/app-base.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [CalculationESport, RefundESport, EarlyESport]
})

export class AppComponent extends AppBaseComponent implements OnInit {
    constructor(
        protected viewContainerRef: ViewContainerRef,
        protected elementRef: ElementRef<HTMLElement>,) {
            super(elementRef, viewContainerRef);
    }

    public ngOnInit() {
        this.createTemplateComponent(this.getComponentFactory());
    }

    private getComponentFactory(): Type<SportTemplate> {
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');

        switch (pageType) {
            case PageType.ReCalculate:
                return CalculationESport;
            case PageType.Refund:
                return RefundESport;
            case PageType.EarlySettlement:
                return EarlyESport;
            default:
                throw new Error('Not implemented yet');
        }
    }
}