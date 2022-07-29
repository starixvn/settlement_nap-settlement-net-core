import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { BackGroundService, RequestService, PopupService } from '../../services';
import { FilterQuery, League, Calculation } from '../../models';
import { Match, Remark } from '../../../shared/models';
import { Permission } from '../../../shared/models/sportsbook-sop';
import { BackgroundColor, CalculationStatus } from '../../../shared/constants';
import * as _ from 'lodash';
import { LeagueBaseComponent } from '../../../shared/components/sport-listing/league-base.component';
import { Language } from '../../../shared/language';
import { ISubscription } from 'rxjs-compat/Subscription';
import { interval } from 'rxjs';

@Component({
  selector: 'matches-base',
  template: ''
})
export class MatchesBaseComponent extends LeagueBaseComponent implements OnChanges, OnInit, OnDestroy {
  @Input() public calculation: Calculation;
  @Input() public filterQuery: FilterQuery;
  @Input() public rootURL: string;
  public leagues: League[];
  public permission: Permission;
  private subscriber: ISubscription;
  private readonly period = 5000;
  private intervalTimer = interval(this.period);
  constructor(
    protected popupService: PopupService,
    protected requestService: RequestService,
    protected backGroundService: BackGroundService) {
    super();
  }

  ngOnChanges() {
    this.permission = this.calculation.permission;
    this.leagues = this.calculation.leagues;
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

  public popupChangeRemarkSetting(match: Match) {
    if (this.isChangeSetting(match)) {
      this.popupService.popupChangeRemark(match);
    }
  }

  public undecidedColor(remark: Remark) {
    return remark.isMtdHold || remark.isUndecided || remark.isUnderSettle || remark.isKeyHold ? BackgroundColor.undecidedRow : '';
  }


  public isShowCalculationLink(match: Match) {
    return this.backGroundService.isShowLink(match) && this.permission.canCalculate ? BackgroundColor.codeLink : '';
  }

  public isShowRefundLink(match: Match) {
    return this.backGroundService.isShowLink(match) && this.permission.canRefund ? BackgroundColor.codeLink : '';
  }

  public isChangeSetting(match: Match) {
    return match.isCalculatingSingle !== CalculationStatus.waiting && match.isCalculatingSingle !== CalculationStatus.calculating
      && match.isCalculatingMP !== CalculationStatus.waiting && match.isCalculatingMP !== CalculationStatus.calculating;
  }
}
