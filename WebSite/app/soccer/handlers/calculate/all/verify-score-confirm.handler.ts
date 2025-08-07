import { CalculateAction } from './../../../../shared/constants/calculate-action.native';

import { LeagueGroup, TimeMinute } from "../../../components/calc/models/constant.model";
import { MatchDetailSoccer as MatchDetail } from "../../../components/calc/models/match.model";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from '../../../../shared/language.native';
import { ResultStatusId } from '../../../../shared/constants';
import { ResultDetail } from '../../../../shared/models/sportsbook-sop';
import * as _ from 'lodash';
import { inject } from '@angular/core';
import { VerificationBaseService } from '../../../../core/services/verification-base.service';


export class VerifyScoreConfirmHandler extends AbstractHandler {
  #verificationService = inject(VerificationBaseService);

  async handle(storage: CalculateBaseStorage) {
    const { matchDetail, resultDetails } = storage.getMatch();
    const calculateAction = storage.getCalculateAction();
    const checkedResults = this.getCheckedResults(resultDetails);
    const halfTimeResult = storage.getHalfTimeResult();

    if (this.validateHalfTimeCompletion(storage, halfTimeResult, calculateAction)) {
      return;
    }

    if (this.validateScoreConfirmation(storage, matchDetail, calculateAction)) {
      return;
    }

    if (this.validateScreenshotSources(storage, checkedResults)) {
      return;
    }

    super.handle(storage);
  }

  private validateHalfTimeCompletion(storage: CalculateBaseStorage, halfTimeResult: ResultDetail, calculateAction: string): boolean {
    const isFullTime = calculateAction === CalculateAction.calculateFullTime;
    if (this.halfTimeCompleted(halfTimeResult, isFullTime && !halfTimeResult.checked)) {
      storage.error(Language.soccer.halfTimeNotSettleYet);
      return true;
    }
    return false;
  }

  private validateScoreConfirmation(storage: CalculateBaseStorage, matchDetail: MatchDetail, calculateAction: string): boolean {
    const isHalfTime = calculateAction === CalculateAction.calculateHalfTime;
    const isFullTime = calculateAction === CalculateAction.calculateFullTime;
    const isCalculate = calculateAction === CalculateAction.calculate;

    const isDisabled = (isHalfTime && this.isDisableCalculateHalfTime(matchDetail)) ||
      (isFullTime && this.isDisableFulltimeCalculate(matchDetail)) ||
      (isCalculate && this.isDisableFulltimeCalculate(matchDetail));

    if (isDisabled) {
      storage.error(Language.soccer.scoreNotConfirmed.replaceAll('{0}', isHalfTime ? "HT" : "FT"));
      return true;
    }
    return false;
  }

  private validateScreenshotSources(storage: CalculateBaseStorage, checkedResults: ResultDetail[]): boolean {
    if (!this.#verificationService.allMapHaveScreenshotSource(checkedResults)) {
      storage.error(Language.sop.notScreenshot);
      return true;
    }

    if (this.#verificationService.isExistMismatchedScoreScreenshot(checkedResults)) {
      storage.error(Language.sop.mismatchedScreenshot);
      return true;
    }

    return false;
  }

  private halfTimeCompleted(halfTimeResult: ResultDetail, isFullTime: boolean) {
    return isFullTime && halfTimeResult.resultStatusId !== ResultStatusId.AutoCompleted && halfTimeResult.resultStatusId !== ResultStatusId.ManualCompleted;
  }

  private byPassDisableRule(matchDetail: MatchDetail) {
    return [LeagueGroup.pinGoal, LeagueGroup.pinGoalMarble].includes(matchDetail.leagueGroupId) || matchDetail.leagueGroupId === LeagueGroup.sabaVirtual;
  }

  private isDisableCalculateHalfTime(matchDetail: MatchDetail) {
    const flag = matchDetail.playTime <= TimeMinute.firstHalf && matchDetail.confirmHT === 0;

    return this.byPassDisableRule(matchDetail) ? false : flag;
  }

  private isDisableFulltimeCalculate(matchDetail: MatchDetail) {
    const flag = matchDetail.playTime <= TimeMinute.total && matchDetail.confirmFT === 0;

    return this.byPassDisableRule(matchDetail) ? false : flag;
  }

  private getCheckedResults(resultDetails: ResultDetail[]) {
    return resultDetails.filter(x => x.checked);
  }
}