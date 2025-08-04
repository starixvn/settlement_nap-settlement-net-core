import { Component, inject, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BackGroundService, RequestService, PopupService } from '../../services';
import { Match, MoreScore, Score } from '../../../shared/models';
import { BackgroundColor, CalculationStatus, EventStatus } from '../../../shared/constants';
import * as _ from 'lodash';
import { Language } from '../../../shared/language.native';
import { MatchesBaseComponent } from '../base-component/matches-base.component';
import { CalculationMatch, FilterQuery, League } from '../../models';
import { ISubscription } from 'rxjs-compat/Subscription';
import { interval } from 'rxjs';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { DynamicHeightDirective } from '../../../shared/directives/dynamic-height.directive.native';
import { NgTemplateOutlet, NgClass, DatePipe } from '@angular/common';
import { AutoSettingsService } from '../../services/auto-settings.service';

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
  private readonly intervalTimer = interval(this.period);
  private readonly autoSettingFailed = 3;
 private readonly providerReady = '(provider ready)';
  private readonly autoSettingsService = inject(AutoSettingsService);

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
    return this.backGroundService.isShowLink(match) && this.permission.canRefund && !this.disableRefund ? BackgroundColor.codeLink : '';
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
    const colorStatus = _.isEqual(match.autoPayoutStatus, this.autoSettingFailed) ? 'auto-setting-failed' : '';

    return colorStatus;
  }


  public getFinalScore(score: MoreScore, isHalfTime: boolean, isHome: boolean) {
    if(isHalfTime) {
      return this.getHtScore(score, isHome);
    }
    return this.getFtScore(score, isHome);
  }

  private getHtScore(score: MoreScore, isHome: boolean) {
    const {halfTimeScore} = score;
    if(!halfTimeScore.isNotSettled) {
      return isHome ? halfTimeScore.home : halfTimeScore.away;
    }

    if(halfTimeScore.isConfirmed && this.permission.isLeader) {
      return isHome ? halfTimeScore.home : halfTimeScore.away;
    }

    return '-';
  }   

  private getFtScore(score: MoreScore, isHome: boolean) {
    const {finalScore} = score;
    if(!finalScore.isNotSettled) {
      return isHome ? finalScore.home : finalScore.away;
    } 

    if(finalScore.isConfirmed && this.permission.isLeader) {
      return isHome ? finalScore.home : finalScore.away;
    }

    return '-';
  }

  public getConfirmScore(match: CalculationMatch, isHalfTime: boolean) {
    const {halfTimeScore, finalScore} = match.moreScores;

    if (isHalfTime) {
      return this.getHalfTimeConfirmScore(match, halfTimeScore);
    }
    
    return this.getFullTimeConfirmScore(match, finalScore);
  }

  private getHalfTimeConfirmScore(match: CalculationMatch, halfTimeScore: Score): string {
    if (!halfTimeScore.isNotSettled || this.permission.isLeader) {
      return match.confirmHalfTimeScore;
    }

    if (halfTimeScore.isNotSettled && !this.permission.isLeader && match.confirmHalfTimeScore) {
      return this.providerReady;
    }

    return '';
  }

  private getFullTimeConfirmScore(match: CalculationMatch, finalScore: Score): string {
    if (!finalScore.isNotSettled || this.permission.isLeader) {
      return match.confirmFullTimeScore;
    }

    if (finalScore.isNotSettled && !this.permission.isLeader && match.confirmFullTimeScore) {
      return this.providerReady;
    }

    return '';
  }

  getStatusAutoPayout(league: League, match: CalculationMatch) {
    return this.autoSettingsService.getStatusAutoPayoutMatch(match, league);
  }
}
