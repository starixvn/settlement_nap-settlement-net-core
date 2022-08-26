import {
    BasketballService,
    EarlyService,
    VerificationService,
    BetStatusService,
} from '../services';
import { BlockUIService, HttpRequestService, MessageBoxService, ClosePopupService, AioService } from '../../shared/services';
import { Component, ComponentFactory, ComponentFactoryResolver, ElementRef, OnInit } from '@angular/core';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import * as _ from 'lodash';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { CalculationActionsComponent as CalculationBasketball } from './calculation-actions.component';
import { RefundActionsComponent as RefundBasketball } from './refund-actions.component';
import { EarlySettlementComponent as EarlyBasketball } from './early-settlement.component';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { EarlyBaseService } from '../../core/services/early-base.service';
import { PageType } from '../../shared/constants';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { AppBaseComponent } from '../../shared/components/sportsbook-sop/app-base.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        BlockUIService,
        HttpRequestService,
        BasketballService,
        BetStatusService,
        ClosePopupService,
        EarlyService,
        MessageBoxService,
        AioService,
        VerificationService,
        VerificationBaseService,
        ResourceNameByIdPipe,
        IntervalBackgroundPipe,
        ResultByTeamNamePipe,
        EarlyBaseService,
    ],
})

export class AppComponent extends AppBaseComponent implements OnInit {
    public blockUI = true;

    constructor(
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected elementRef: ElementRef<HTMLElement>,
        protected blockUIService: BlockUIService) {
        super(blockUIService, elementRef, componentFactoryResolver);
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.createTemplateComponent(() => this.getComponentFactory());
    }

    private getComponentFactory(): ComponentFactory<SportTemplate> {
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        switch (pageType) {
            case PageType.ReCalculate:
                return this.componentFactoryResolver.resolveComponentFactory(CalculationBasketball);
            case PageType.Refund:
                return this.componentFactoryResolver.resolveComponentFactory(RefundBasketball);
            case PageType.EarlySettlement:
                return this.componentFactoryResolver.resolveComponentFactory(EarlyBasketball);
            default:
                throw new Error('Not implemented yet');
        }
    }
}