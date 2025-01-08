import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, inject, Input, input, NgModule, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Match, MatchDetail } from './models/match.model';
import { ResourceIds } from '../../constants';
import { GoalIcon, ResultDetail } from '../../models';
import { CommonModule } from '@angular/common';
import { ModalDialogMessage, Result, ResultSettingQuery } from '../../../shared/models';
import { ToastrService } from 'ngx-toastr';
import { VerifyScoreGoalService } from './services/verify-score-goal.service';
import { Language } from '../../../shared/language.native';
import { CalculateAction, ResultSettingType } from '../../../shared/constants';
import { AioService, MessageBoxService } from '../../../shared/services';
import * as _ from 'lodash';
import { CalculateStorage } from '../../storage/calculate.storage';
import { CalculateService } from './services/calculate.service';
import { Permission } from '../../../shared/models/sportsbook-sop';
import { GoalIconService } from './services/goal-icon.service';
import { GoalRecordWithOutSemicolonService } from './services/goal-record-with-out-semicolon.service';

@Component({
  selector: 'calculation-action',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ GoalIconService, GoalRecordWithOutSemicolonService],
  templateUrl: './calculation-action.component.html',
})
export class CalculationActionComponent implements OnInit {
  #calculateService = inject(CalculateService);
  #messageBoxService = inject(MessageBoxService);
  #goalIconService = inject(GoalIconService);
  #aioService = inject(AioService);
  #storage = inject(CalculateStorage);

  matchDetail: MatchDetail;
  permission: Permission;
  halfTimeResult: ResultDetail;
  fullTimeResult: ResultDetail;
  enableAction = false;
  disableGoalRecordCheckbox = false;

  ngOnInit() {
    this.permission = this.#storage.getPermission();
    const { matchDetail, resultDetails } = this.#storage.match();
    this.matchDetail = matchDetail;
    this.halfTimeResult = resultDetails?.find((item) => item.sourceId === 0 && item.resourceId === ResourceIds.halfTime) ?? new ResultDetail();
    this.fullTimeResult = resultDetails?.find((item) => item.sourceId === 0 && item.resourceId === ResourceIds.fullTime) ?? new ResultDetail();
    this.halfTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.halfTimeResult);
    this.fullTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.fullTimeResult);
    this.changeResultState(this.halfTimeResult);
    this.changeResultState(this.fullTimeResult);
    this.matchDetail.applyGoalRecord = this.disableGoalRecordCheckbox = this.matchDetail.isExistFgLg
    || this.matchDetail.isExistHtFgLg || this.matchDetail.isExistResultAndFirstTeamScore
    || this.matchDetail.isEnabledGoalRecordHt || this.matchDetail.isEnabledGoalRecordFt;
  }

  copyScore() {
    this.#calculateService.copyScore();
  }

  selectResult(){
    this.enableAction = this.halfTimeResult.checked || this.fullTimeResult.checked;
  }

  isChangeSetting(resultDetail: ResultDetail) {
    const query = new ResultSettingQuery(this.matchDetail.matchId, ResultSettingType.holdResult,
      !resultDetail.resultSettingData.isHoldResult, resultDetail.resourceId);
    this.#storage.setConfirmMessage(Language.holdResultConfirmMessage);

    this.#messageBoxService.confirm(this.#storage.getConfirmMessage(), async () => {
      const result = await this.#aioService.changeResultSetting(query);
      resultDetail.resultSettingData.isHoldResult = result;
      resultDetail.resultSettingData.iconHoldResult = this.getResultSettingIcon(resultDetail);
      if(result){
        resultDetail.checked = false;
      }
    });
  }

  scoreChanged(resultDetail: ResultDetail) {
    this.#storage.changeScore();
    if (resultDetail.resourceId === ResourceIds.halfTime) {
      resultDetail.isMismatch = !_.isNaN(this.matchDetail.exHTHomeScore) &&
        !_.isNaN(this.matchDetail.exHTAwayScore) &&
        (!_.isEqual(this.halfTimeResult.homeValue, this.matchDetail.exHTHomeScore) ||
          !_.isEqual(this.halfTimeResult.awayValue, this.matchDetail.exHTAwayScore));
    } else {
      resultDetail.isMismatch = !_.isNaN(this.matchDetail.exFTAwayScore) &&
        _.isNaN(this.matchDetail.exFTAwayScore) &&
        (!_.isEqual(this.fullTimeResult.homeValue, this.matchDetail.exFTHomeScore) ||
          !_.isEqual(this.fullTimeResult.awayValue, this.matchDetail.exFTAwayScore));
    }
    this.changeResultState(resultDetail);
  }

  calculate() {
    this.#storage.clear();
    this.#storage.setHaftTimeScore(this.halfTimeResult.homeValue, this.halfTimeResult.awayValue)
    this.#storage.setFullTimeScore(this.fullTimeResult.homeValue, this.fullTimeResult.awayValue)
    const { checked: isHalfTime } = this.halfTimeResult;
    const { checked: isFullTime } = this.fullTimeResult;
  
    if (isHalfTime && isFullTime) {
      this.#calculateService.calculateALL();
    } else if (isHalfTime) {
      this.#calculateService.calculateHalfTime();
    } else if (isFullTime) {
      this.#calculateService.calculateFullTime();
    }
  }

  uncalculate() {
    this.#storage.clear();
    const { checked: isHalfTime } = this.halfTimeResult;
    const { checked: isFullTime } = this.fullTimeResult;
  
    if (isHalfTime && isFullTime) {
      this.#calculateService.uncalculateAll();
    } else if (isFullTime) {
      this.#calculateService.uncalculateFT();
    } else {
      this.#storage.error(Language.CannotUncalculateHalfTime);
    }
  }

  saveScore() {
    this.#storage.clear();
    this.#calculateService.saveScore();
  }

  goalRecordModelChange(value: string){
    this.matchDetail.goalRecord = value;
    this.matchDetail.goalIcon = this.#goalIconService.generateGoalIcon(this.matchDetail);
  }

  private changeResultState(resultDetail: ResultDetail) {
    resultDetail.resultState = `${resultDetail.ticketStatus.toLowerCase()} ${resultDetail.isMismatch ? 'mismatched' : ''}`;
  }

  private getResultSettingIcon(result: ResultDetail) {
    return result.resultSettingData?.isHoldResult ? 'icon-yes' : 'icon-no';
  }
}
