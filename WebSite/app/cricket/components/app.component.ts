import { Component, OnInit, ElementRef, ViewContainerRef, Type } from '@angular/core';
import * as _ from 'lodash';
import { CalculationActionsComponent as CalculationCricket } from './calculation-actions.component';
import { RefundActionsComponent as RefundCricket } from './refund-actions.component';
import { EarlySettlementComponent as EarlyCricket } from './early-settlement.component';
import { PageType } from '../../shared/constants';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { AppBaseComponent } from '../../shared/components/sportsbook-sop/app-base.component';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true
})

export default class AppComponent extends AppBaseComponent implements OnInit {
   
    constructor(protected viewContainerRef: ViewContainerRef,
        protected elementRef: ElementRef<HTMLElement>) {
        super(elementRef, viewContainerRef);
    }

    public ngOnInit() {
        this.createTemplateComponent(this.getComponentFactory());
    }

    private getComponentFactory(): Type<SportTemplate> {
        // const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        // switch (pageType) {
        //     case PageType.ReCalculate:
        //         return CalculationCricket;
        //     case PageType.Refund:
        //         return RefundCricket;
        //     case PageType.EarlySettlement:
                return EarlyCricket;
        //     default:
        //         throw new Error('Not implemented yet');
        // }
    }
}