import { CalculateAction } from './../../../../shared/constants/calculate-action.native';

import { LeagueGroup, TimeMinute } from "../../../components/calc/models/constant.native";
import { MatchDetail } from "../../../components/calc/models/match.model";
import { Storage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from '../../../../shared/language.native';
import { ResultStatusId, ScoreSourceType } from '../../../../shared/constants';
import { ResultDetail } from '../../../models';
import * as _ from 'lodash';


export class VerifyScoreConfirmHandler extends AbstractHandler {

  async handle(storage: Storage) {
    const { matchDetail, resultDetails } = storage.getMatch();
    const calculateAction = storage.getCalculateAction();
    const isHalfTime = calculateAction === CalculateAction.calculateHalfTime;
    const isFullTime = calculateAction === CalculateAction.calculateFullTime;
    const isCalculate = calculateAction === CalculateAction.calculate;
    const halfTimeResult = storage.getHalfTimeResult();

    if (this.halfTimeCompleted(halfTimeResult, isFullTime && !halfTimeResult.checked)) {
      storage.error(Language.soccer.halfTimeNotSettleYet);
      return;
    }

    if ((isHalfTime && this.isDisableCalculateHalfTime(matchDetail)) ||
      (isFullTime && this.isDisableFulltimeCalculate(matchDetail)) ||
      (isCalculate && this.isDisableFulltimeCalculate(matchDetail))) {
      storage.error(Language.soccer.scoreNotConfirmed.replaceAll('{0}', isHalfTime ? "HT" : "FT"));
      return;
    }

    if (!this.isExistsOutsideResults(resultDetails)) {
      storage.error(Language.sop.notScreenshot);
      return;
    }

    if (this.isExistsMismatchOutsideResults(resultDetails)) {
      storage.error(Language.sop.mismatchedScreenshot);
      return;
    }

    super.handle(storage);
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

  private isExistsOutsideResults(resultDetails: ResultDetail[]) {
    const resultsId = resultDetails.filter(x => x.checked)
      .map(x => x.resourceId);

    return resultDetails.filter(x => x.sourceId === ScoreSourceType.screenshot
      && resultsId.includes(x.resourceId)
      && !_.isEmpty(x.homeValue)
      && !_.isEmpty(x.awayValue)).length > 0;
  }

  private isExistsMismatchOutsideResults(resultDetails: ResultDetail[]) {
    const checkedResults = this.getCheckedResults(resultDetails);

    return checkedResults.some(x => {
      const outsideResult = resultDetails.find(y => y.sourceId === ScoreSourceType.screenshot && y.resourceId === x.resourceId);
      return outsideResult && (outsideResult.homeValue !== x.homeValue || outsideResult.awayValue !== x.awayValue);
    });
  }

  

  private getCheckedResults(resultDetails: ResultDetail[]) {
    return resultDetails.filter(x => x.checked);
  }
}