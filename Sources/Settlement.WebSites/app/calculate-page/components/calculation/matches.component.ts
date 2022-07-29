import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BackGroundService, RequestService, PopupService } from '../../services';
import { Match} from '../../../shared/models';
import { BackgroundColor, EventStatus } from '../../../shared/constants';
import * as _ from 'lodash';
import { Language } from '../../../shared/language';
import { MatchesBaseComponent } from '../base-component/matches-base.component';

@Component({
  selector: 'matches',
  templateUrl: './matches.component.html'
})
export class MatchesComponent extends MatchesBaseComponent implements OnChanges, OnInit, OnDestroy {
  constructor(
    protected popupService: PopupService,
    protected requestService: RequestService,
    protected backGroundService: BackGroundService) {
    super(popupService, requestService, backGroundService);
  }

  public popupEarly(match: Match) {
    if (this.isShowEarlySettleLink(match)) {
      const src = `${this.rootURL}/sportsbook/soccer/early-settlement?matchId=${match.matchId}`;
      this.popupService.openAndHandlePopup(src, Language.EarlyPopupTitle, '790px', '600px', match);
    }
  }

  public popupFastMarkets(match: Match) {
    if (this.isMatchNotSingleOrMp(match)) {
      const src = `apps/fast-market?matchId=${match.matchId}`;
      this.popupService.openAndHandlePopup(src, Language.FastMarketTile, '985px', '921px', match);
    }
  }

  public getEarlySettleBackground(match: Match) {
    const isRunning = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), EventStatus.running.toLowerCase())
      && _.isEqual(match.eventStatus.toLowerCase(), EventStatus.completed.toLowerCase());
    const isCompleted = !_.isNull(match.earlySettleStatus) && _.isEqual(match.earlySettleStatus.toLowerCase(), EventStatus.completed.toLowerCase());
    const backgroundColor = isRunning ? BackgroundColor.autoSettleRunning : isCompleted ? BackgroundColor.calculated : '';
    return backgroundColor;
  }

  public getFastMarketsBackground(match: Match) {
    const isRunning = !_.isNull(match.fastMarketStatus) && _.isEqual(match.fastMarketStatus.toLowerCase(), EventStatus.running.toLowerCase());
    const fastMarketBlinking = isRunning ? this.backGroundService.completedBackground(match) : this.backGroundService.fastMarkedCompletedBackground(match);
    return match.enableFastMarket ? this.getEarlySettleBackground(match) : fastMarketBlinking;
  }
  
  public isShowEarlySettleLink(match: Match) {
    return this.backGroundService.isShowLink(match) && (this.permission.canCalculate || this.permission.canRefund || this.permission.canUncalculate) ? BackgroundColor.codeLink : '';
  }

  public isMatchNotSingleOrMp(match: Match) {
    return _.isNull(match.isCalculatingSingle) && _.isNull(match.isCalculatingMP);
  }
}
