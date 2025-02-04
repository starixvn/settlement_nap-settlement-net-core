import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { MatchDetail } from './models/match.model';
import { ResourceIds } from '../../constants';
import { ResultDetail } from '../../models';
import { CommonModule } from '@angular/common';
import { ResultSettingQuery } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { ResultSettingType, SettlementStatusId } from '../../../shared/constants';
import { AioService, MessageBoxService } from '../../../shared/services';
import * as _ from 'lodash';
import { CalculateStorage } from '../../storage/calculate.storage';
import { CalculateService } from './services/calculate.service';
import { Permission } from '../../../shared/models/sportsbook-sop';
import { GoalIconService } from './services/goal-icon.service';
import { GoalRecordWithOutSemicolonService } from './services/goal-record-with-out-semicolon.service';
import { OnlyGoalRecordDirective } from '../../directives/only-goal-record.directive.native';
import { ScoreService } from './services/score.service';


@Component({
  selector: 'calculation-action',
  standalone: true,
  imports: [CommonModule, FormsModule, OnlyGoalRecordDirective],
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

    this.halfTimeResult = this.#storage.getHalfTimeResult();
    this.fullTimeResult = this.#storage.getFullTimeResult();

    this.halfTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.halfTimeResult);
    this.fullTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.fullTimeResult);
    this.scoreChanged(this.halfTimeResult);
    this.scoreChanged(this.fullTimeResult);

    this.matchDetail.applyGoalRecord = this.disableGoalRecordCheckbox = this.calculateGoalRecordState(matchDetail);
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
        resultDetail.checked = false;
      }
    });
  }

  scoreChanged(resultDetail: ResultDetail) {
    this.#storage.clear();
    this.#storage.changeScore();

    const isHalfTime = resultDetail.resourceId === ResourceIds.halfTime;
    const { homeExScore, awayExScore, homeValue, awayValue } = this.getScores(isHalfTime);

    resultDetail.isMismatch = this.checkMismatch(homeExScore, awayExScore, homeValue, awayValue);

    this.#scoreService.changeResultState(resultDetail);
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

  private checkMismatch(homeScore: string, awayScore: string, homeValue: string, awayValue: string) {
    return !this.isEmptyScore(homeScore) &&
      !this.isEmptyScore(awayScore) &&
      !this.isEmptyScore(homeValue) &&
      !this.isEmptyScore(awayValue) &&
      (!_.isEqual(homeValue, homeScore) || !_.isEqual(awayValue, awayScore));
  }
}
