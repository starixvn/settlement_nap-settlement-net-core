import { Component, OnInit, ElementRef, ComponentFactoryResolver, ComponentFactory } from '@angular/core';
import * as _ from 'lodash';
import {
    BlockUIService,
    HttpRequestService,
    MessageBoxService,
    ClosePopupService,
    AioService
} from '../../shared/services';
import { ResourceNameByIdPipe } from '../pipes';
import { VerificationService, EarlyConstraintService, ESportsService } from '../services';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { PageType } from '../../shared/constants';
import { CalculationActionsComponent as CalculationESport } from './calculation-actions.component';
import { RefundActionsComponent as RefundESport } from './refund-actions.component';
import { EarlySettlementComponent as EarlyESport } from './early-settlement.component';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { AppBaseComponent } from '../../shared/components/sportsbook-sop/app-base.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        BlockUIService,
        HttpRequestService,
        MessageBoxService,
        ClosePopupService,
        VerificationService,
        VerificationBaseService,
        ResourceNameByIdPipe,
        ExternalSourceNamePipe,
        IntervalBackgroundPipe,
        EarlyConstraintService,
        ResultByTeamNamePipe,
        ESportsService,
        AioService
    ],
})

export class AppComponent extends AppBaseComponent implements OnInit {
    public blockUI = false;
    constructor(
        protected elementRef: ElementRef<HTMLElement>,
        protected blockUIService: BlockUIService,
        protected componentFactoryResolver: ComponentFactoryResolver) {
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
                return this.componentFactoryResolver.resolveComponentFactory(CalculationESport);
            case PageType.Refund:
                return this.componentFactoryResolver.resolveComponentFactory(RefundESport);
            case PageType.EarlySettlement:
                return this.componentFactoryResolver.resolveComponentFactory(EarlyESport);
            default:
                throw new Error('Not implemented yet');
        }
    }
}