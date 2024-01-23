import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BackGroundService, RequestService, PopupService } from '../../services';
import { Match } from '../../../shared/models';
import { BackgroundColor, CalculationStatus, EventStatus } from '../../../shared/constants';
import * as _ from 'lodash';
import { Language } from '../../../shared/language.native';
import { MatchesBaseComponent } from '../base-component/matches-base.component';
import { CalculationMatch, FilterQuery } from '../../models';
import { ISubscription } from 'rxjs-compat/Subscription';
import { interval } from 'rxjs';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { DynamicHeightDirective } from '../../../shared/directives/dynamic-height.directive.native';
import { NgTemplateOutlet, NgClass, DatePipe } from '@angular/common';

@Component({
    selector: 'matches',
    templateUrl: './matches.component.html',
    standalone: true,
    imports: [NgTemplateOutlet, DynamicHeightDirective, NgClass, NgbTooltip, DatePipe]
})
export class MatchesComponent extends MatchesBaseComponent implements OnChanges, OnInit, OnDestroy {
  @Input() public disableRefund: boolean;
  @Input() public filterQuery: FilterQuery;
  @Input() public disableRefresh: boolean;
  private subscriber: ISubscription;
  private readonly period = 6000;
  private intervalTimer = interval(this.period);
  private readonly autoSettingCompleted = 2;
  private readonly autoSettingFailed = 3;
  constructor(
    protected popupService: PopupService,
    protected requestService: RequestService,
    protected backGroundService: BackGroundService) {
    super(popupService, requestService, backGroundService);
  }

  ngOnInit() {
    this.refreshMatches();
  }

  ngOnDestroy() {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  public isShowRefundLink(match: CalculationMatch) {
    return this.backGroundService.isShowLink(match) && this.permission.canRefund && !this.disableRefund  ? BackgroundColor.codeLink : '';
  }

  private refreshMatches() {
    this.subscriber = this.intervalTimer.subscribe(() => {
      if (!this.disableRefresh && this.leagues.length > 0) {
        this.requestService.refreshMatches(this.filterQuery.leagueIds, this.leagues);
      }
    });
  }

  public getLog(matchId: string) {
    this.popupService.popupLog(matchId, this.filterQuery.fromDate, this.filterQuery.toDate);
  }

  public popupEarly(match: CalculationMatch) {
    if (this.isShowEarlySettleLink(match)) {
      const src = `/apps/soccer-early?matchId=${match.matchId}`;
      this.popupService.openAndHandlePopup(src, Language.EarlyPopupTitle, '910px', '910px', match);
    }
  }

  public popupFastMarkets(match: CalculationMatch) {
    if (this.isMatchNotSingleOrMp(match)) {
      this.popupService.popupFastMarkets(match);
    }
  }

  public getStatusBackground(currentStatus: string, eventStatus: string) {
    const isRunning = !_.isNull(currentStatus) && _.isEqual(currentStatus.toLowerCase(), EventStatus.running.toLowerCase())
      && _.isEqual(eventStatus.toLowerCase(), EventStatus.completed.toLowerCase());
    const isCompleted = !_.isNull(currentStatus) && _.isEqual(currentStatus.toLowerCase(), EventStatus.completed.toLowerCase());
    const backgroundColor = isRunning ? BackgroundColor.autoSettleRunning : isCompleted ? BackgroundColor.calculated : '';
    return backgroundColor;
  }

  public getFastMarketsBackground(match: CalculationMatch) {
    const isRunning = !_.isNull(match.fastMarketStatus) && _.isEqual(match.fastMarketStatus.toLowerCase(), EventStatus.running.toLowerCase());
    const fastMarketBlinking = isRunning ? this.backGroundService.completedBackground(match) : this.backGroundService.fastMarkedCompletedBackground(match);
    return match.enableFastMarket ? this.getStatusBackground(match.fastMarketStatus, match.eventStatus) : fastMarketBlinking;
  }

  public isShowEarlySettleLink(match: CalculationMatch) {
    return this.backGroundService.isShowLink(match) && (this.permission.canCalculate || this.permission.canRefund || this.permission.canUncalculate) ? BackgroundColor.codeLink : '';
  }

  public isMatchNotSingleOrMp(match: Match) {
    return _.isNull(match.isCalculatingSingle)
      || (!_.isEqual(match.isCalculatingSingle, CalculationStatus.waiting)
        && !_.isEqual(match.isCalculatingSingle, CalculationStatus.calculating));
  }

  public getBackgroundAutoSetting(match: Match) {
    const colorStatus = _.isEqual(match.autoPayoutStatus, this.autoSettingCompleted) ? 'auto-setting-completed' :
      _.isEqual(match.autoPayoutStatus, this.autoSettingFailed) ? 'auto-setting-failed' : '';

    return colorStatus;
  }
}
