import { Component, OnInit, ViewContainerRef, ViewChild, Type, ComponentRef, ElementRef } from '@angular/core';
import { BlockUIService } from '../../shared/services';
import { UrlHelper } from "../../helper";
import { FullTimeCalculationComponent } from './only-fulltime/fulltime-calculation.component';
import { FullTimeRefundComponent } from './only-fulltime/fulltime-refund.component';
import { GameTotalCalculationComponent } from './game-total/game-total-calculation.component';
import { GameTotalRefundComponent } from './game-total/game-total-refund.component';
import { TemplateType } from '../constants';
import * as _ from 'lodash';
import { HalfTimeFullTimeCalculationComponent } from './halftime-fulltime/halftime-fulltime-calculation.component';
import { HalfTimeFullTimeRefundComponent } from './halftime-fulltime/halftime-fulltime-refund.component';
import { AppBaseComponent } from '../../shared/components/sportsbook-sop/app-base.component';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { PageType } from '../../shared/constants';
import { GameTotalMatchCalculationComponent } from './game-total-match-flow/game-total-match-calculation.component';
import { GameTotalMatchRefundComponent } from './game-total-match-flow/game-total-match-refund.component';
import { OtherRefundComponent } from './other/other-refund.component';
import { OtherCalculationComponent } from './other/other-calculation.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})

export class AppComponent extends AppBaseComponent implements OnInit {
    @ViewChild('container', { read: ViewContainerRef, static: true }) container: ViewContainerRef;
    public blockUI = false;
    public apiUrl: string;
    public component: ComponentRef<SportTemplate>;
    public sportType: number;

    constructor(
        protected blockUIService: BlockUIService,
        protected elementRef: ElementRef<HTMLElement>,
        protected ViewContainerRef: ViewContainerRef) {
        super(elementRef, ViewContainerRef);
    }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.createTemplateComponent(this.getType());
    }

    private getType(): Type<SportTemplate> {
        this.sportType = Number(UrlHelper.getUrlParameter('sportType'));
        const pageType = this.elementRef.nativeElement.getAttribute('page-type');
        return _.includes(TemplateType.gameTotalTemplate, this.sportType)
            ? this.getComponentGameTotal(pageType)
            : this.getComponentSecondGroup(pageType);
    }

    private getComponentSecondGroup(pageType: string): Type<SportTemplate> {
        return _.includes(TemplateType.halfTimeFullTimeTemplate, this.sportType)
            ? this.getComponentHalfTimeFullTime(pageType)
            : this.getComponentThirdGroup(pageType);
    }

    private getComponentThirdGroup(pageType: string): Type<SportTemplate> {
        return _.includes(TemplateType.gameTotalMatchTemplate, this.sportType)
            ? this.getComponentGameTotalMatch(pageType)
            : this.getComponentFourthGroup(pageType);
    }

    private getComponentFourthGroup(pageType: string): Type<SportTemplate> {
        return _.includes(TemplateType.onlyFullTimeTemplate, this.sportType)
            ? this.getComponentOnlyFullTime(pageType)
            : this.getComponentOther(pageType);
    }

    private getComponentOther(pageType: string): Type<SportTemplate> {
        return pageType === PageType.ReCalculate
            ? OtherCalculationComponent
            : OtherRefundComponent;
    }

    private getComponentOnlyFullTime(pageType: string): Type<SportTemplate> {
        return pageType === PageType.ReCalculate
            ? FullTimeCalculationComponent
            : FullTimeRefundComponent;
    }

    private getComponentHalfTimeFullTime(pageType: string): Type<SportTemplate> {
        return pageType === PageType.ReCalculate
            ? HalfTimeFullTimeCalculationComponent
            : HalfTimeFullTimeRefundComponent;
    }

    private getComponentGameTotal(pageType: string): Type<SportTemplate> {
        return pageType === PageType.ReCalculate
            ? GameTotalCalculationComponent
            : GameTotalRefundComponent;

            // return GameTotalRefundComponent;
    }

    private getComponentGameTotalMatch(pageType: string): Type<SportTemplate> {
        return pageType === PageType.ReCalculate
            ? GameTotalMatchCalculationComponent
            : GameTotalMatchRefundComponent;
    }
}


