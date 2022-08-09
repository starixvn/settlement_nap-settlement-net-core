import { Component, OnInit, ElementRef, ComponentRef, ViewContainerRef, ViewChild, ComponentFactoryResolver, ComponentFactory } from '@angular/core';
import * as _ from 'lodash';
import {
  BlockUIService,
  HttpRequestService,
  MessageBoxService,
  ClosePopupService,
  AioService,
  IntervalCalculationService
} from '../../shared/services';
import { TennisService, VerificationService } from '../services';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { ResourceNameByIdPipe } from '../pipes';
import { PageType } from '../../shared/constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { CalculateActionsComponent as CalculationTennis } from './calculate-actions.component';
import { RefundActionsComponent as RefundTennis } from './refund-actions.component';
import { AppBaseComponent } from '../../shared/components/sportsbook-sop/app-base.component';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [
    BlockUIService,
    HttpRequestService,
    TennisService,
    MessageBoxService,
    ClosePopupService,
    VerificationService,
    VerificationBaseService,
    ResourceNameByIdPipe,
    AioService,
    ResultByTeamNamePipe,
    IntervalBackgroundPipe,
    IntervalCalculationService,],
})
export class AppComponent extends AppBaseComponent implements OnInit {
  public pageType: string;
  public blockUI = true;
  public component: ComponentRef<SportTemplate>;

  constructor(
    protected blockUIService: BlockUIService,
    protected elementRef: ElementRef<HTMLElement>,
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
        return this.componentFactoryResolver.resolveComponentFactory(CalculationTennis);
      case PageType.Refund:
        return this.componentFactoryResolver.resolveComponentFactory(RefundTennis);
      default:
        throw new Error('Not implemented yet');
    }
  }
}