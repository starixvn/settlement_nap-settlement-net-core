import { FormsModule } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { ExternalResult, ExternalResultDetail, ResultDetail } from '../../../shared/models/sportsbook-sop';
import { CommonModule } from '@angular/common';
import { ResultSettingQuery } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { ResourceIds, ResultSettingType, ResultStatus, ResultStatusId, ScoreSourceType, SettlementStatusId, SportType, TicketStatusText } from '../../../shared/constants';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { ExternalLinkPipe } from '../../../score-source-setting/pipes';
import { ExternalSourceNamePipe } from '../../../shared/pipes/external-source-name.pipe';
import { VerificationBaseService } from '../../../core/services/verification-base.service';
import { MatchDetailSoccer } from './models/match.model';
import { VerificationBaseService as sopVerificationService } from '../../../core/services/verification-base.service';
import { ResourceNamePipe } from '../../pipes/resource-name.pipe';

@Component({
  selector: 'calculation-action',
  standalone: true,
  imports: [CommonModule, FormsModule, OnlyGoalRecordDirective, OnlyIntegerDirective, MatTooltipModule, ExternalLinkPipe, ExternalSourceNamePipe, ResourceNamePipe],
  providers: [GoalIconService, GoalRecordWithOutSemicolonService, VerificationBaseService, sopVerificationService],
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
  #verificationService = inject(VerificationBaseService);

  SOURCE_ID = ScoreSourceType;
  matchDetail: MatchDetailSoccer;
  permission: Permission;
  
  halfTimeResult: ResultDetail;
  fullTimeResult: ResultDetail;

  outSideCount = 1;
  maxProviderCol = 3;
  enableAction = false;
  disableGoalRecordCheckbox = false;

  readonly resultSettledStatusIds = [ResultStatusId.AutoCompleted,ResultStatusId.ManualCompleted];

  resultDetails: ResultDetail[] = [];
  isReadyMatch = false;

  ngOnInit() {
    this.permission = this.#storage.getPermission();
    const { matchDetail, resultDetails, externalResults } = this.#storage.match();
    this.matchDetail = matchDetail;
    this.resultDetails = resultDetails;
    this.maxProviderCol = this.getProviderCol(externalResults);
    this.#verificationService.generateExternalScores(this.#storage.match(), resultDetails, SportType.soccer, this.maxProviderCol);
    this.#storage.setMatch({
      ...this.#storage.match(),
      originalResultDetail: _.cloneDeep(resultDetails)
    });

    this.resetHomeAway(this.resultDetails);
    this.setState();
    this.verifyAndAutoFillScore(this.halfTimeResult);
    this.verifyAndAutoFillScore(this.fullTimeResult);
    this.outSideCount =  resultDetails[0].externalScores.filter(x => x.sourceId >= ScoreSourceType.screenshot).length
    this.matchDetail.applyGoalRecord = this.disableGoalRecordCheckbox = this.calculateGoalRecordState(matchDetail);
    this.isReadyMatch = this.matchDetail.playTime >= 0;
    this.enableAction = this.halfTimeResult.checked || this.fullTimeResult.checked;
  }



  isConfirmed(result: ExternalResultDetail) {
    return result.resultStatusId === ResultStatusId.TraderConfirm 
      && !_.isEmpty(result.homeValue) && !_.isEmpty(result.awayValue);
  }

  private getProviderCol(externalResults: ExternalResult[]) {
    const providers = _.filter(externalResults, (item: ExternalResult) =>
      item.sourceId !== ScoreSourceType.trader && item.sourceId < ScoreSourceType.screenshot).length
    return providers > 3 ? 3 : providers == 0 ? 1 : providers;
  }


  private setState() {
    this.halfTimeResult = this.#storage.getHalfTimeResult();
    this.fullTimeResult = this.#storage.getFullTimeResult();

    this.halfTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.halfTimeResult);
    this.fullTimeResult.resultSettingData.iconHoldResult = this.getResultSettingIcon(this.fullTimeResult);
  }

  private resetHomeAway(resultDetails: ResultDetail[]) {
    resultDetails.forEach((map) => {
      const hideScore = map.settlementStatusId === SettlementStatusId.Refund
        || (map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted);
      map.homeValue = hideScore ? "" : map.homeValue;
      map.awayValue = hideScore ? "" : map.awayValue;
    });
  }


  private calculateGoalRecordState(matchDetail: MatchDetailSoccer): boolean {
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

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
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

    resultDetail.isScoreMismatched = this.#verificationService.isMismatchedWarning(resultDetail);

    this.#scoreService.changeResultState();  
  }

  changeConfirmScore(externalScore: ExternalResultDetail, result: ResultDetail) {
    this.#storage.clear();

    const oppositeResource = this.getOutsideResult(externalScore);
    if(externalScore.resourceId === ResourceIds.halfTime) {
      externalScore.isInvalidValue = this.#verifyScoreGoalService
      .isHtFtNotConsistent(externalScore, oppositeResource);
    } else {
      externalScore.isInvalidValue = this.#verifyScoreGoalService
      .isHtFtNotConsistent(oppositeResource, externalScore);
    }
    oppositeResource.isInvalidValue = externalScore.isInvalidValue;

    this.#storage.changeScore();
    this.#scoreService.changeResultState();
    this.verifyAndAutoFillScore(result)
  }

  private getOutsideResult(externalScore: ExternalResultDetail) {
    const oppositeResourceId = externalScore.resourceId === ResourceIds.halfTime ? ResourceIds.fullTime : ResourceIds.halfTime;
    return this.resultDetails
      .find(x => x.resourceId === oppositeResourceId)
      ?.externalScores
      .find(x => x.sourceId === externalScore.sourceId);
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

  saveTraderScore() {
    this.#storage.clear();
    this.#calculateService.saveScore();
  }

  saveScore() {
    this.#storage.clear();
    this.#calculateService.saveOutsideScore();
  }

  goalRecordModelChange(value: string) {
    this.#storage.clear();
    this.matchDetail.goalRecord = value;
    this.matchDetail.goalIcon = this.#goalIconService.generateGoalIcon(this.matchDetail, this.halfTimeResult, this.fullTimeResult);
  }

  private getResultSettingIcon(result: ResultDetail) {
    return result.resultSettingData?.isHoldResult ? 'icon-yes' : 'icon-no';
  }

  canSettleResult(result: ResultDetail) {
    const isRunning = _.isEqual(result.ticketStatus, TicketStatusText.running)
      || _.isEqual(result.resultStatus, ResultStatus.noResult)
      || _.isEqual(result.resultStatus, ResultStatus.running);

    return isRunning
      && !result.isScoreMismatched
      && this.#verificationService.isValidTraderConfirmScore(result);
  }

  private verifyAndAutoFillScore(map: ResultDetail, isOnload = false) {
    if(isOnload && map.settlementStatusId  === SettlementStatusId.Refund) {
      return;
    }
    map.isScoreMismatched = this.#verificationService.isMismatchedWarning(map);
    this.#verificationService.autoFillScore(map);
    this.scoreChanged(map);
  }
}
