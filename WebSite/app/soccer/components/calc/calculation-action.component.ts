import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchDetail } from './models/match.model';
import { ResultDetail } from '../../models';
import { ResultSettingQuery } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { ResourceIds } from '../../constants';
import { ResultSettingType } from '../../../shared/constants';
import { AioService, MessageBoxService } from '../../../shared/services';
import { CalculateStorage } from '../../storage/calculate.storage';
import { CalculateService } from './services/calculate.service';
import { Permission } from '../../../shared/models/sportsbook-sop';
import { GoalIconService } from './services/goal-icon.service';
import { GoalRecordWithOutSemicolonService } from './services/goal-record-with-out-semicolon.service';
import { OnlyGoalRecordDirective } from '../../directives/only-goal-record.directive.native';
import { ScoreService } from './services/score.service';
import { OnlyIntegerDirective } from '../../../shared/directives';
import { CalculationState, ScoreState } from './models/calculation-state.model';
import * as _ from 'lodash';

@Component({
  selector: 'calculation-action',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    OnlyGoalRecordDirective, 
    OnlyIntegerDirective
  ],
  providers: [
    GoalIconService, 
    GoalRecordWithOutSemicolonService
  ],
  templateUrl: './calculation-action.component.html',
})
export class CalculationActionComponent implements OnInit {
  // Injected services
  readonly #calculateService = inject(CalculateService);
  readonly #messageBoxService = inject(MessageBoxService);
  readonly #goalIconService = inject(GoalIconService);
  readonly #aioService = inject(AioService);
  readonly #scoreService = inject(ScoreService);
  readonly #storage = inject(CalculateStorage);

  // Public properties
  matchDetail: MatchDetail;
  permission: Permission;
  halfTimeResult: ResultDetail;
  fullTimeResult: ResultDetail;
  state: CalculationState = {
    enableAction: false,
    disableGoalRecordCheckbox: false
  };

  ngOnInit(): void {
    this.initializeComponent();
  }

  // Public methods
  copyScore(): void {
    this.#storage.clear();
    this.#calculateService.copyScore();
  }

  selectResult(): void {
    this.#storage.clear();
    this.state.enableAction = this.halfTimeResult.checked || this.fullTimeResult.checked;
  }

  isChangeSetting(resultDetail: ResultDetail): void {
    this.#storage.clear();
    const query = this.createResultSettingQuery(resultDetail);
    this.#storage.setConfirmMessage(Language.holdResultConfirmMessage);

    this.#messageBoxService.confirm(this.#storage.getConfirmMessage(), async () => {
      const result = await this.#aioService.changeResultSetting(query);
      this.updateResultSetting(resultDetail, result);
    });
  }

  scoreChanged(resultDetail: ResultDetail): void {
    this.#storage.clear();
    this.#storage.changeScore();

    const isHalfTime = resultDetail.resourceId === ResourceIds.halfTime;
    const scores = this.getScores(isHalfTime);
    resultDetail.isMismatch = this.checkMismatch(scores);
    this.#scoreService.changeResultState();
  }

  calculate(): void {
    this.#storage.clear();
    this.#storage.setHaftTimeScore(this.halfTimeResult.homeValue, this.halfTimeResult.awayValue);
    this.#storage.setFullTimeScore(this.fullTimeResult.homeValue, this.fullTimeResult.awayValue);
    
    this.handleCalculation();
  }

  uncalculate(): void {
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

  unCalcInstant(): void {
    this.#storage.clear();
    this.#calculateService.unCalcInstant();
  }

  saveScore(): void {
    this.#storage.clear();
    this.#calculateService.saveScore();
  }

  goalRecordModelChange(value: string): void {
    this.#storage.clear();
    this.matchDetail.goalRecord = value;
    this.matchDetail.goalIcon = this.#goalIconService.generateGoalIcon(
      this.matchDetail, 
      this.halfTimeResult, 
      this.fullTimeResult
    );
  }

  // Private methods
  private initializeComponent(): void {
    this.permission = this.#storage.getPermission();
    const { matchDetail } = this.#storage.match();
    this.matchDetail = matchDetail;

    this.initializeResults();
    this.initializeGoalRecordState();
  }

  private initializeResults(): void {
    this.halfTimeResult = this.#storage.getHalfTimeResult();
    this.fullTimeResult = this.#storage.getFullTimeResult();

    this.halfTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.halfTimeResult);
    this.fullTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.fullTimeResult);
    
    this.scoreChanged(this.halfTimeResult);
    this.scoreChanged(this.fullTimeResult);
  }

  private initializeGoalRecordState(): void {
    this.matchDetail.applyGoalRecord = this.state.disableGoalRecordCheckbox = this.calculateGoalRecordState();
  }

  private calculateGoalRecordState(): boolean {
    return this.matchDetail.isExistFgLg ||
      this.matchDetail.isExistHtFgLg ||
      this.matchDetail.isExistResultAndFirstTeamScore ||
      this.matchDetail.isEnabledGoalRecordHt ||
      this.matchDetail.isEnabledGoalRecordFt;
  }

  private createResultSettingQuery(resultDetail: ResultDetail): ResultSettingQuery {
    return new ResultSettingQuery(
      this.matchDetail.matchId,
      ResultSettingType.holdResult,
      !resultDetail.resultSettingData.isHoldResult,
      resultDetail.resourceId
    );
  }

  private updateResultSetting(resultDetail: ResultDetail, result: boolean): void {
    resultDetail.resultSettingData.isHoldResult = result;
    resultDetail.resultSettingData.iconHoldResult = this.getResultSettingIcon(resultDetail);
    if (result) {
      this.halfTimeResult.checked = false;
      this.fullTimeResult.checked = false;
      this.state.enableAction = false;
    }
  }

  private getResultSettingIcon(result: ResultDetail): string {
    return result.resultSettingData?.isHoldResult ? 'icon-yes' : 'icon-no';
  }

  private getScores(isHalfTime: boolean): ScoreState {
    return {
      homeExScore: isHalfTime ? this.matchDetail.exHTHomeScore : this.matchDetail.exFTHomeScore,
      awayExScore: isHalfTime ? this.matchDetail.exHTAwayScore : this.matchDetail.exFTAwayScore,
      homeValue: isHalfTime ? this.halfTimeResult.homeValue : this.fullTimeResult.homeValue,
      awayValue: isHalfTime ? this.halfTimeResult.awayValue : this.fullTimeResult.awayValue,
    };
  }

  private checkMismatch(scores: ScoreState): boolean {
    return !this.isEmptyScore(scores.homeExScore) &&
      !this.isEmptyScore(scores.awayExScore) &&
      !this.isEmptyScore(scores.homeValue) &&
      !this.isEmptyScore(scores.awayValue) &&
      (!_.isEqual(scores.homeValue, scores.homeExScore) || !_.isEqual(scores.awayValue, scores.awayExScore));
  }

  private isEmptyScore(value: string): boolean {
    return _.isNull(value) || _.isEmpty(value) || _.isNaN(value);
  }

  private handleCalculation(): void {
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
}
