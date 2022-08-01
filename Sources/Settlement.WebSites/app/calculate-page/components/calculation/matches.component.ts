import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BackGroundService, RequestService, PopupService } from '../../services';
import { Match} from '../../../shared/models';
import { BackgroundColor, EventStatus } from '../../../shared/constants';
import * as _ from 'lodash';
import { Language } from '../../../shared/language';
import { MatchesBaseComponent } from '../base-component/matches-base.component';
import { CalculationMatch } from '../../models';
import { ISubscription } from 'rxjs-compat/Subscription';
import { interval } from 'rxjs';

@Component({
  selector: 'matches',
  templateUrl: './matches.component.html'
})
export class MatchesComponent extends MatchesBaseComponent implements OnChanges, OnInit, OnDestroy {
  private subscriber: ISubscription;
  private readonly period = 5000;
  private intervalTimer = interval(this.period);
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

  private refreshMatches() {
    this.subscriber = this.intervalTimer.subscribe(() => {
      if (this.leagues.length > 0) {
        this.requestService.refreshMatches(this.filterQuery.leagueId, this.leagues);
      }
    });
  }


  public popupEarly(match: CalculationMatch) {
    if (this.isShowEarlySettleLink(match)) {
      const src = `apps/soccer-early?matchId=${match.matchId}`;
      this.popupService.openAndHandlePopup(src, Language.EarlyPopupTitle, '910px', '890px', match);
    }
  }

  public popupFastMarkets(match: CalculationMatch) {
    if (this.isMatchNotSingleOrMp(match)) {
      this.popupService.popupFastMarkets(match);
    }
  }

  public getEarlySettleBackground(match: CalculationMatch) {
    const isRunning = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), EventStatus.running.toLowerCase())
      && _.isEqual(match.eventStatus.toLowerCase(), EventStatus.completed.toLowerCase());
    const isCompleted = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), EventStatus.completed.toLowerCase());
    const backgroundColor = isRunning ? BackgroundColor.autoSettleRunning : isCompleted ? BackgroundColor.calculated : '';
    return backgroundColor;
  }

  public getFastMarketsBackground(match: CalculationMatch) {
    const isRunning = !_.isNull(match.fastMarketStatus) && _.isEqual(match.fastMarketStatus.toLowerCase(), EventStatus.running.toLowerCase());
    const fastMarketBlinking = isRunning ? this.backGroundService.completedBackground(match) : this.backGroundService.fastMarkedCompletedBackground(match);
    return match.enableFastMarket ? this.getEarlySettleBackground(match) : fastMarketBlinking;
  }
  
  public isShowEarlySettleLink(match: CalculationMatch) {
    return this.backGroundService.isShowLink(match) && (this.permission.canCalculate || this.permission.canRefund || this.permission.canUncalculate) ? BackgroundColor.codeLink : '';
  }

  public isMatchNotSingleOrMp(match: Match) {
    return _.isNull(match.isCalculatingSingle) && _.isNull(match.isCalculatingMP);
  }
}
