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
  providers: [GoalIconService, GoalRecordWithOutSemicolonService],
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
    
    this.halfTimeResult = this.initializeResultDetail(resultDetails, ResourceIds.halfTime);
    this.fullTimeResult = this.initializeResultDetail(resultDetails, ResourceIds.fullTime);

    this.halfTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.halfTimeResult);
    this.fullTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.fullTimeResult);
    this.changeResultState(this.halfTimeResult);
    this.changeResultState(this.fullTimeResult);

    this.matchDetail.applyGoalRecord = this.disableGoalRecordCheckbox = this.calculateGoalRecordState(matchDetail);
  }

  private initializeResultDetail(resultDetails: ResultDetail[] | undefined, resourceId: string): ResultDetail {
    return resultDetails?.find((item) => item.sourceId === 0 && item.resourceId === resourceId) ?? new ResultDetail();
  }

  private calculateGoalRecordState(matchDetail: MatchDetail): boolean {
    return matchDetail.isExistFgLg ||
      matchDetail.isExistHtFgLg ||
      matchDetail.isExistResultAndFirstTeamScore ||
      matchDetail.isEnabledGoalRecordHt ||
      matchDetail.isEnabledGoalRecordFt;
  }

  copyScore() {
    this.#calculateService.copyScore();
  }

  selectResult() {
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
      if (result) {
        resultDetail.checked = false;
      }
    });
  }

  scoreChanged(resultDetail: ResultDetail) {
    this.#storage.clear();
    this.#storage.changeScore();
    const isHalfTime = resultDetail.resourceId === ResourceIds.halfTime;
    const homeScore = isHalfTime ? this.matchDetail.exHTHomeScore : this.matchDetail.exFTHomeScore;
    const awayScore = isHalfTime ? this.matchDetail.exHTAwayScore : this.matchDetail.exFTAwayScore;
    const homeValue = isHalfTime ? this.halfTimeResult.homeValue : this.fullTimeResult.homeValue;
    const awayValue = isHalfTime ? this.halfTimeResult.awayValue : this.fullTimeResult.awayValue;

    resultDetail.isMismatch = !this.isEmptyScore(homeScore) &&
      !this.isEmptyScore(awayScore) &&
      (!_.isEqual(homeValue, homeScore) || !_.isEqual(awayValue, awayScore));

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

  unCalcInstant() {
    this.#storage.clear();
    this.#calculateService.unCalcInstant();
  }

  saveScore() {
    this.#storage.clear();
    this.#calculateService.saveScore();
  }

  goalRecordModelChange(value: string) {
    this.matchDetail.goalRecord = value;
    this.matchDetail.goalIcon = this.#goalIconService.generateGoalIcon(this.matchDetail);
  }

  private changeResultState(resultDetail: ResultDetail) {
    resultDetail.resultState = `${_.isNull(resultDetail.ticketStatus) ? '' : resultDetail.ticketStatus.toLowerCase()} ${resultDetail.isMismatch ? 'mismatched' : ''}`;
  }

  private getResultSettingIcon(result: ResultDetail) {
    return result.resultSettingData?.isHoldResult ? 'icon-yes' : 'icon-no';
  }

  private isEmptyScore(value: string) {
    return _.isNull(value) || _.isEmpty(value) || _.isNaN(value); 
  }
}
