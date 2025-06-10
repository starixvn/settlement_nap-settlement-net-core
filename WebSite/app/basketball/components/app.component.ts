
import { Component, ElementRef, OnInit, Type, ViewContainerRef } from '@angular/core';
import { CalculationActionsComponent as CalculationBasketball } from './calculation-actions.component';
import { RefundActionsComponent as RefundBasketball } from './refund-actions.component';
import { EarlySettlementComponent as EarlyBasketball } from './early-settlement.component';
import { PageType } from '../../shared/constants';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { AppBaseComponent } from '../../shared/components/sportsbook-sop/app-base.component';

@Component({
    selector: 'app-root',
    template: '<div #container></div>',
    standalone: true
})

export class AppComponent extends AppBaseComponent implements OnInit {
    constructor(
        protected viewContainerRef: ViewContainerRef,
        protected elementRef: ElementRef<HTMLElement>) {
        super(elementRef, viewContainerRef);
    }

    public ngOnInit() {
        this.createTemplateComponent(this.getComponentFactory());
    }

    private getComponentFactory(): Type<SportTemplate> {
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        
        switch (pageType) {
            case PageType.ReCalculate:
                return CalculationBasketball;
            case PageType.Refund:
                return RefundBasketball;
            case PageType.EarlySettlement:
                return EarlyBasketball;
            default:
                throw new Error('Not implemented yet');
        }
    }
}