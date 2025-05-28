import { Component, Input, OnChanges} from '@angular/core';
import { BackGroundService, RequestService, PopupService } from '../../services';
import { League, Calculation, CalculationMatch, FilterQuery } from '../../models';
import {Remark } from '../../../shared/models';
import { Permission } from '../../../shared/models/sportsbook-sop';
import { BackgroundColor, CalculationStatus } from '../../../shared/constants';
import * as _ from 'lodash';
import { LeagueBaseComponent } from '../../../shared/components/sport-listing/league-base.component';
import { Language } from '../../../shared/language.native';
@Component({
    selector: 'matches-base',
    template: '',
    standalone: true
})
export class MatchesBaseComponent extends LeagueBaseComponent implements OnChanges {
  @Input() public calculation: Calculation;
  public leagues: League[];
  public permission: Permission;
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

  public popupCalc(match: CalculationMatch, filterQuery: FilterQuery | null = null) {
    const src = `/apps/soccer-recalculate?matchId=${match.matchId}&filterOver=${filterQuery?.filterOver}`;
    this.popupService.openAndHandlePopup(src, Language.CalcPopupTitle, '800px', '800px', match);
  }

  public popupRefund(match: CalculationMatch) {
    const src = `/apps/soccer-refund?matchId=${match.matchId}`;
    this.popupService.openAndHandlePopup(src, Language.RefundPopupTitle, '790px', '600px', match);
  }

  public popupChangeRemarkSetting(match: CalculationMatch) {
    if (this.isChangeSetting(match)) {
      this.popupService.popupChangeRemark(match);
    }
  }

  public rowColor(remark: Remark, isEven: boolean) {
    const backgroundRemark =  remark.isMtdHold || remark.isUndecided || remark.isUnderSettle || remark.isKeyHold ? BackgroundColor.undecidedRow : '';
    const backGroundEven = isEven ? 'even' : '';
    return `${backgroundRemark} ${backGroundEven}`;
  }


  public isShowCalculationLink(match: CalculationMatch) {
    return this.backGroundService.isShowLink(match) && this.permission.canCalculate ? BackgroundColor.codeLink : '';
  }

  public isShowRefundLink(match: CalculationMatch) {
    return this.backGroundService.isShowLink(match) && this.permission.canRefund ? BackgroundColor.codeLink : '';
  }

  public isChangeSetting(match: CalculationMatch) {
    return match.isCalculatingSingle !== CalculationStatus.waiting && match.isCalculatingSingle !== CalculationStatus.calculating
      && match.isCalculatingMP !== CalculationStatus.waiting && match.isCalculatingMP !== CalculationStatus.calculating;
  }
}
