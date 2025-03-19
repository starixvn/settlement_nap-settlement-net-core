import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { MatchDetail } from './models/match.model';
import { ResourceIds } from '../../constants';
import { ResultDetail } from '../../models';
import { CommonModule } from '@angular/common';
import { ResultSettingQuery } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { ResultSettingType, ResultStatusId, SettlementStatusId } from '../../../shared/constants';
import { AioService, MessageBoxService } from '../../../shared/services';
import * as _ from 'lodash';
import { CalculateStorage } from '../../storage/calculate.storage';
import { CalculateService } from './services/calculate.service';
import { Permission } from '../../../shared/models/sportsbook-sop';
import { GoalIconService } from './services/goal-icon.service';
import { GoalRecordWithOutSemicolonService } from './services/goal-record-with-out-semicolon.service';
import { OnlyGoalRecordDirective } from '../../directives/only-goal-record.directive.native';
import { ScoreService } from './services/score.service';
import { OnlyIntegerDirective } from '../../../shared/directives';
import { VerifyScoreGoalService } from './services/verify-score-goal.service';


@Component({
  selector: 'calculation-action',
  standalone: true,
  imports: [CommonModule, FormsModule, OnlyGoalRecordDirective, OnlyIntegerDirective],
  providers: [GoalIconService, GoalRecordWithOutSemicolonService],
  templateUrl: './calculation-action.component.html',
})
export class CalculationActionComponent implements OnInit {
  #calculateService = inject(CalculateService);
  #messageBoxService = inject(MessageBoxService);
  #goalIconService = inject(GoalIconService);
  #aioService = inject(AioService);
  #scoreService = inject(ScoreService);
  #storage = inject(CalculateStorage);
  #verifyScoreGoalService = inject(VerifyScoreGoalService);

  matchDetail: MatchDetail;
  permission: Permission;
  halfTimeResult: ResultDetail;
  fullTimeResult: ResultDetail;

  outsideHtResult: ResultDetail;
  outsideFtResult: ResultDetail;
  traderHtResult: ResultDetail;
  traderFtResult: ResultDetail;

  enableAction = false;
  disableGoalRecordCheckbox = false;

  ngOnInit() {
    this.permission = this.#storage.getPermission();
    const { matchDetail } = this.#storage.match();
    this.matchDetail = matchDetail;

    this.halfTimeResult = this.#storage.getHalfTimeResult();
    this.fullTimeResult = this.#storage.getFullTimeResult();

    this.outsideHtResult = this.#storage.outsideHtResult;
    this.outsideFtResult = this.#storage.outsideFtResult;
    this.traderHtResult = this.#storage.traderHtResult;
    this.traderFtResult = this.#storage.traderFtResult;

    this.halfTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.halfTimeResult);
    this.fullTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.fullTimeResult);
    this.scoreChanged(this.halfTimeResult);
    this.scoreChanged(this.fullTimeResult);

    this.matchDetail.applyGoalRecord = this.disableGoalRecordCheckbox = this.calculateGoalRecordState(matchDetail);
    // this.matchDetail.isWarningGoalRecord = true;
  }

  private disabledInputScore() {
    return !this.permission.isLeader
  }

  private calculateGoalRecordState(matchDetail: MatchDetail): boolean {
    return matchDetail.isExistFgLg ||
      matchDetail.isExistHtFgLg ||
      matchDetail.isExistResultAndFirstTeamScore ||
      matchDetail.isEnabledGoalRecordHt ||
      matchDetail.isEnabledGoalRecordFt;
  }

  copyScore() {
    this.#storage.clear();
    this.#calculateService.copyScore();
  }

  selectResult() {
    this.#storage.clear();
    this.enableAction = this.halfTimeResult.checked || this.fullTimeResult.checked;
  }

  isChangeSetting(resultDetail: ResultDetail) {
    this.#storage.clear();
    const query = new ResultSettingQuery(this.matchDetail.matchId, ResultSettingType.holdResult,
      !resultDetail.resultSettingData.isHoldResult, resultDetail.resourceId);
    this.#storage.setConfirmMessage(Language.holdResultConfirmMessage);

    this.#messageBoxService.confirm(this.#storage.getConfirmMessage(), async () => {
      const result = await this.#aioService.changeResultSetting(query);
      resultDetail.resultSettingData.isHoldResult = result;
      resultDetail.resultSettingData.iconHoldResult = this.getResultSettingIcon(resultDetail);
      if (result) {
        this.halfTimeResult.checked = false;
        this.fullTimeResult.checked = false;
        this.enableAction = false;
      }
    });
  }

  scoreChanged(resultDetail: ResultDetail) {
    this.#storage.clear();
    this.#storage.changeScore();

    const isHalfTime = resultDetail.resourceId === ResourceIds.halfTime;
    const { homeExScore, awayExScore, homeValue, awayValue } = this.getScores(isHalfTime);

    resultDetail.isMismatch = this.checkMismatch(homeExScore, awayExScore, homeValue, awayValue);

    this.#scoreService.changeResultState();
  }

  changeOutsideScore(resultDetail: ResultDetail) {
    const settledResultStatus = [ResultStatusId.AutoCompleted, ResultStatusId.ManualCompleted];
    if(!this.isValidScore(resultDetail)) {
      return;
    }

    if(resultDetail.resourceId === ResourceIds.halfTime
      && !settledResultStatus.includes(this.halfTimeResult.resultStatusId)
      && ((resultDetail.homeValue === this.traderHtResult.homeValue && resultDetail.awayValue === this.traderHtResult.awayValue)
      || (resultDetail.homeValue === this.matchDetail.exHTHomeScore && resultDetail.awayValue === this.matchDetail.exHTAwayScore))
    ) {
      this.#storage.setHaftTimeScore(resultDetail.homeValue, resultDetail.awayValue);
    }

    if(resultDetail.resourceId === ResourceIds.fullTime
      && !settledResultStatus.includes(this.fullTimeResult.resultStatusId)
      && ((resultDetail.homeValue === this.traderFtResult.homeValue && resultDetail.awayValue === this.traderFtResult.awayValue)
      || (resultDetail.homeValue === this.matchDetail.exFTHomeScore && resultDetail.awayValue === this.matchDetail.exFTAwayScore))
    ) {
      this.#storage.setFullTimeScore(resultDetail.homeValue, resultDetail.awayValue);
    }
  }

  isValidScore(resultDetail: ResultDetail) {
    return !_.isEmpty(resultDetail.homeValue) && !_.isEmpty(resultDetail.awayValue);
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
    this.#storage.clear();
    this.matchDetail.goalRecord = value;
    this.matchDetail.goalIcon = this.#goalIconService.generateGoalIcon(this.matchDetail, this.halfTimeResult, this.fullTimeResult);
    this.matchDetail.isWarningGoalRecord =  !_.isEmpty(value) && this.verifyGoalRecord(this.matchDetail);
  }
  
  private verifyGoalRecord(matchDetail: MatchDetail) {
    if(this.halfTimeResult.checked) {
      return this.#verifyScoreGoalService.isFullTimeGoalRecordInvalidWithResultDetail(matchDetail, this.halfTimeResult);
    }

    if(this.fullTimeResult.checked) {
      return this.#verifyScoreGoalService.isFullTimeGoalRecordInvalidWithResultDetail(matchDetail, this.fullTimeResult);
    }

    return false;
  }

  private getResultSettingIcon(result: ResultDetail) {
    return result.resultSettingData?.isHoldResult ? 'icon-yes' : 'icon-no';
  }

  private isEmptyScore(value: string) {
    return _.isNull(value) || _.isEmpty(value) || _.isNaN(value);
  }

  private getScores(isHalfTime: boolean) {
    return {
      homeExScore: isHalfTime ? this.matchDetail.exHTHomeScore : this.matchDetail.exFTHomeScore,
      awayExScore: isHalfTime ? this.matchDetail.exHTAwayScore : this.matchDetail.exFTAwayScore,
      homeValue: isHalfTime ? this.halfTimeResult.homeValue : this.fullTimeResult.homeValue,
      awayValue: isHalfTime ? this.halfTimeResult.awayValue : this.fullTimeResult.awayValue,
    };
  }

  private checkMismatch(homeExScore: string, awayExScore: string, homeValue: string, awayValue: string) {
    return !this.isEmptyScore(homeExScore) &&
      !this.isEmptyScore(awayExScore) &&
      !this.isEmptyScore(homeValue) &&
      !this.isEmptyScore(awayValue) &&
      (!_.isEqual(homeValue, homeExScore) || !_.isEqual(awayValue, awayExScore));
  }
}
