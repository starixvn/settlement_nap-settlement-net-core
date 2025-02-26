import { CalculateAction } from './../../../../shared/constants/calculate-action.native';

import { LeagueGroup, TimeMinute } from "../../../components/calc/models/constant.native";
import { MatchDetail } from "../../../components/calc/models/match.model";
import { Storage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from '../../../../shared/language.native';
import { ResultStatusId } from '../../../../shared/constants';
import { ResultDetail } from '../../../models';


export class VerifyScoreConfirmHandler extends AbstractHandler {
  async handle(storage: Storage) {
    const { matchDetail } = storage.getMatch();
    const calculateAction = storage.getCalculateAction();
    const isHalfTime = calculateAction === CalculateAction.calculateHalfTime;
    const isFullTime = calculateAction === CalculateAction.calculateFullTime;
    const isCalculate = calculateAction === CalculateAction.calculate;
    const halfTimeResult = storage.getHalfTimeResult();

    if (this.halfTimeCompleted(halfTimeResult, isFullTime)) {
      storage.error(Language.soccer.halfTimeNotSettleYet);
      return;
    }

    if ((isHalfTime && this.isDisableCalculateHalfTime(matchDetail)) ||
      (isFullTime && this.isDisableFulltimeCalculate(matchDetail)) ||
      (isCalculate && this.isDisableFulltimeCalculate(matchDetail))) {
      storage.error(Language.soccer.scoreNotConfirmed.replaceAll('{0}', isHalfTime ? "HT" : "FT"));
      return;
    }

    super.handle(storage);
  }

  private halfTimeCompleted(halfTimeResult: ResultDetail, isFullTime: boolean) {
    return isFullTime && halfTimeResult.resultStatusId !== ResultStatusId.AutoCompleted && halfTimeResult.resultStatusId !== ResultStatusId.ManualCompleted;
  }

  private byPassDisableRule(matchDetail: MatchDetail) {
    return matchDetail.leagueGroupId === LeagueGroup.pinGoal || matchDetail.leagueGroupId === LeagueGroup.sabaVirtual;
  }

  private isDisableCalculateHalfTime(matchDetail: MatchDetail) {
    const flag = matchDetail.playTime <= TimeMinute.firstHalf && matchDetail.confirmHT === 0;

    return this.byPassDisableRule(matchDetail) ? false : flag;
  }

  private isDisableFulltimeCalculate(matchDetail: MatchDetail) {
    const flag = matchDetail.playTime <= TimeMinute.total && matchDetail.confirmFT === 0;

    return this.byPassDisableRule(matchDetail) ? false : flag;
  }
}