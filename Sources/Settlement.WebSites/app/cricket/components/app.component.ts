import { Component, OnInit, ElementRef, ComponentFactoryResolver, ComponentFactory } from '@angular/core';
import * as _ from 'lodash';
import {
    BlockUIService,
    HttpRequestService,
    MessageBoxService,
    ClosePopupService,
    AioService
} from '../../shared/services';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { CricketService, EarlyConstraintService, VerificationService } from '../services';
import { ResultByPlayerNamePipe, ResultNameByIdPipe, ResultValuePipe } from '../pipes';
import { CalculationActionsComponent as CalculationCricket } from './calculation-actions.component';
import { RefundActionsComponent as RefundCricket } from './refund-actions.component';
import { EarlySettlementComponent as EarlyCricket } from './early-settlement.component';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { EarlyBaseService } from '../../core/services/early-base.service';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { PageType } from '../../shared/constants';
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
        IntervalBackgroundPipe,
        ResultNameByIdPipe,
        EarlyConstraintService,
        VerificationService,
        VerificationBaseService,
        CricketService,
        AioService,
        ResultByTeamNamePipe,
        EarlyBaseService,
        ResultValuePipe,
        ResultByPlayerNamePipe,
    ],
})

export class AppComponent extends AppBaseComponent implements OnInit {
    public blockUI = false;

    constructor(
        protected blockUIService: BlockUIService,
        protected componentFactoryResolver: ComponentFactoryResolver,
        protected elementRef: ElementRef<HTMLElement>) {
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
                return this.componentFactoryResolver.resolveComponentFactory(CalculationCricket);
            case PageType.Refund:
                return this.componentFactoryResolver.resolveComponentFactory(RefundCricket);
            case PageType.EarlySettlement:
                return this.componentFactoryResolver.resolveComponentFactory(EarlyCricket);
            default:
                throw new Error('Not implemented yet');
        }
    }
}