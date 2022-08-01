import { Component, OnInit, ViewContainerRef, ViewChild, ComponentFactoryResolver, ComponentFactory, ComponentRef, ElementRef } from '@angular/core';
import * as _ from 'lodash';
import { Soccer } from './soccer.model';
import { UrlHelper } from '../../helper';
import { EarlySettlementComponent } from './early/early-settlement.component';
import { BlockUIService, HttpRequestService, MessageBoxService, AioService, ClosePopupService } from '../../shared/services';
import { CalculationComponent } from './calc/calculation.component';
import { PageType } from '../../shared/constants';
import { RefundComponent } from './refund/refund.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    providers: [
        AioService,
        BlockUIService,
        HttpRequestService,
        MessageBoxService,
        ClosePopupService,
    ],
})

export class AppComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public blockUI = false;
    public component: ComponentRef<Soccer>;
    public matchId: number;
    constructor(
        private readonly blockUIService: BlockUIService,
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly componentFactoryResolver: ComponentFactoryResolver) {
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.createTemplateComponent();
    }

    private createTemplateComponent(): ComponentRef<Soccer> {
        const factory = this.getComponentFactory();
        this.component = this.container.createComponent(factory);
        const matchId = Number(UrlHelper.getUrlParameter('matchId'));
        this.component.instance.getMatch(matchId);
        return this.component;
    }


    private getComponentFactory(): ComponentFactory<Soccer> {
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        switch (pageType) {
            case PageType.Calculation:
                return this.componentFactoryResolver.resolveComponentFactory(CalculationComponent);
            case PageType.Refund:
                return this.componentFactoryResolver.resolveComponentFactory(RefundComponent);
            case PageType.EarlySettlement:
                return this.componentFactoryResolver.resolveComponentFactory(EarlySettlementComponent);
            default:
                throw new Error('Not implemented yet');
        }
    }
}
