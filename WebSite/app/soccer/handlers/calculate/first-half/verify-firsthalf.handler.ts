import { inject } from "@angular/core";
import { FantasyRelatedMatch, MatchDetailSoccer as MatchDetail } from "../../../components/calc/models/match.model";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from "../../../../shared/language.native";
import { CalculateAction } from "../../../../shared/constants";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { ResultDetail } from "../../../../shared/models/sportsbook-sop";


export class VerifyFirstHalfHandler extends AbstractHandler {
  readonly #verifyScoreGoalService = inject(VerifyScoreGoalService);
  readonly #verifyActionService = inject(VerifyActionService);

  public async handle(storage: CalculateBaseStorage) {
    const { matchDetail } = storage.getMatch();
    const halftimeResult = storage.getHalfTimeResult();
    const errorMessage = await this.verifyFirstHalf(halftimeResult, matchDetail, storage.getRelatedMatches());
    if (errorMessage) {
      storage.error(errorMessage);
      return;
    }
    super.handle(storage);
  }


  private async verifyFirstHalf(halftimeResult: ResultDetail, matchDetail: MatchDetail, relatedMatches: FantasyRelatedMatch[]) {
    if(halftimeResult.resultSettingData.isConfirmedRefundSdt || halftimeResult.resultSettingData.isConfirmedRefund) {
      return Language.confirmRefund.calculateResultNotConfirmed;
    }
   
    if (this.#verifyScoreGoalService.verifyScore(halftimeResult)) {
      return Language.warningInputScore;
    }

    if (this.#verifyScoreGoalService.goalRecordNotExistSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.needSemicolonOnGoalRecord;
    }

    if (matchDetail.applyGoalRecord && this.#verifyScoreGoalService.isHtGoalRecordInvalidWithResultDetail(matchDetail, halftimeResult)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.halfTimeGoalRecordNotConsistent;
    }

    if (matchDetail.isScoreInconsistent) {
      return Language.soccer.incorrectHalftimeAndFullTimeScore;
    }

    if (matchDetail.isFantasyMatch && this.#verifyActionService.isFirstHalfRelatedMatchesNotCalc(relatedMatches)) {
      return Language.fantasyMatch.relatedMatchesNotCalc;
    }

    return this.#verifyActionService.checkNewStatus(matchDetail, CalculateAction.calculateHalfTime);
  }
}