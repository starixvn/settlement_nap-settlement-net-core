import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BackGroundService, CalculatePageService, PopupService } from '../services';
import { FilterQuery, League, Matches } from '../models';
import { Match, Remark } from '../../shared/models';
import { Permission } from '../../shared/models/sportsbook-sop';
import { BackgroundColor, CalculationStatus } from '../../shared/constants';
import * as _ from 'lodash';
import { LeagueBaseComponent } from '../../shared/components/sport-listing/league-base.component';
import { Language } from '../../shared/language';
import { ISubscription } from 'rxjs-compat/Subscription';
import { interval } from 'rxjs';

@Component({
  selector: 'matches',
  templateUrl: './matches.component.html'
})
export class MatchesComponent extends LeagueBaseComponent implements OnChanges, OnInit, OnDestroy {
  @Input() public matches: Matches;
  @Input() public filterQuery: FilterQuery;
  @Input() public rootURL: string;
  public leagues: League[];
  public permission: Permission;
  private subscriber: ISubscription;
  private readonly period = 5000;
  private intervalTimer = interval(this.period);
  constructor(
    private readonly popupService: PopupService,
    private readonly calculatePageService: CalculatePageService,
    private readonly backGroundService: BackGroundService) {
    super();
  }

  ngOnChanges() {
    this.permission = this.matches.permission;
    this.leagues = this.matches.leagues;
  }

  ngOnInit() {
    this.refreshMatches();
  }

  ngOnDestroy() {
    if (this.subscriber) {
      this.subscriber.unsubscribe();
    }
  }

  private refreshMatches() {
    this.subscriber = this.intervalTimer.subscribe(() => {
      if (this.leagues.length > 0) {
        this.calculatePageService.refreshMatches(this.filterQuery.leagueId, this.leagues);
      }
    });
  }

  public getLog(matchId: string) {
    this.popupService.popupLog(matchId, this.filterQuery.fromDate, this.filterQuery.toDate);
  }

  public popupCalc(match: Match) {
    const src = `${this.rootURL}/sportsbook/soccer/calculation?matchId=${match.matchId}`;
    this.popupService.openAndHandlePopup(src, Language.CalcPopupTitle, '800px', '800px', match);
  }

  public popupRefund(match: Match) {
    const src = `${this.rootURL}/sportsbook/soccer/refund?matchId=${match.matchId}`;
    this.popupService.openAndHandlePopup(src, Language.RefundPopupTitle, '790px', '600px', match);
  }

  public popupEarly(match: Match) {
    if (this.isShowEarlySettleLink(match)) {
      const src = `${this.rootURL}/sportsbook/soccer/early-settlement?matchId=${match.matchId}`;
      this.popupService.openAndHandlePopup(src, Language.EarlyPopupTitle, '790px', '600px', match);
    }
  }

  public popupFastMarkets(match: Match) {
    if (this.isMatchNotSingleOrMp(match)) {
      const src = `${this.rootURL}/sportsbook/soccer/early-settlement?matchId=${match.matchId}`;
      this.popupService.openAndHandlePopup(src, Language.FastMarketTile, '985px', '921px', match);
    }
  }

  public popupChangeRemarkSetting(match: Match) {
    if (this.isChangeSetting(match)) {
      this.popupService.popupChangeRemark(match);
    }
  }

  public undecidedColor(remark: Remark) {
    return remark.isMtdHold || remark.isUndecided || remark.isUnderSettle || remark.isKeyHold ? BackgroundColor.undecidedRow : '';
  }

  public getEarlySettleBackground(match: Match) {
    const isRunning = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.running)
      && _.isEqual(match.eventStatus.toLowerCase(), BackgroundColor.completed);
    const isCompleted = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), BackgroundColor.completed);
    const backgroundColor = isRunning ? BackgroundColor.autoSettleRunning : isCompleted ? BackgroundColor.calculated : '';
    return backgroundColor;
  }

  public getFastMarketsBackground(match: Match) {
    const isRunning = !_.isNull(match.autoSettleFastMarket) && _.isEqual(match.autoSettleFastMarket.toLowerCase(), BackgroundColor.running);
    const fastMarketBlinking = isRunning ? this.backGroundService.completedBackground(match) : this.backGroundService.fastMarkedCompletedBackground(match);
    return match.enableFastMarket ? this.getEarlySettleBackground(match) : fastMarketBlinking;
  }

  public isShowEarlySettleLink(match: Match) {
    return this.backGroundService.isShowLink(match) && (this.permission.canCalculate || this.permission.canRefund || this.permission.canUncalculate) ? BackgroundColor.codeLink : '';
  }

  public isShowCalculationLink(match: Match) {
    return this.backGroundService.isShowLink(match) && this.permission.canCalculate ? BackgroundColor.codeLink : '';
  }

  public isShowRefundLink(match: Match) {
    return this.backGroundService.isShowLink(match) && this.permission.canRefund ? BackgroundColor.codeLink : '';
  }

  public isMatchNotSingleOrMp(match: Match) {
    return _.isNull(match.isCalculatingSingle) && _.isNull(match.isCalculatingMP);
  }

  public isChangeSetting(match: Match) {
    return match.isCalculatingSingle !== CalculationStatus.waiting && match.isCalculatingSingle !== CalculationStatus.calculating
      && match.isCalculatingMP !== CalculationStatus.waiting && match.isCalculatingMP !== CalculationStatus.calculating;
  }
}
