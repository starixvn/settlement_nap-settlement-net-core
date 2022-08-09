import { Component, OnInit, ElementRef, ComponentFactoryResolver, ComponentFactory } from '@angular/core';
import * as _ from 'lodash';
import {
  BlockUIService,
  HttpRequestService,
  MessageBoxService,
  ClosePopupService,
  AioService,
  IntervalCalculationService
} from '../../shared/services';
import { BadmintonService, VerificationService } from '../services';
import { ResourceNameByIdPipe } from '../pipes';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { CalculateActionsComponent } from './calculate-actions.component';
import { RefundActionsComponent } from './refund-actions.component';
import { EarlySettlementComponent } from './early-settlement.component';
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
    BadmintonService,
    MessageBoxService,
    ClosePopupService,
    VerificationService,
    VerificationBaseService,
    AioService,
    ResourceNameByIdPipe,
    IntervalBackgroundPipe,
    ResultByTeamNamePipe,
    IntervalCalculationService,
  ],
})
export class AppComponent extends AppBaseComponent implements OnInit {
  public pageType: string;
  public blockUI = true;

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
        return this.componentFactoryResolver.resolveComponentFactory(CalculateActionsComponent);
      case PageType.Refund:
        return this.componentFactoryResolver.resolveComponentFactory(RefundActionsComponent);
      case PageType.EarlySettlement:
        return this.componentFactoryResolver.resolveComponentFactory(EarlySettlementComponent);
      default:
        throw new Error('Not implemented yet');
    }
  }
}