import { inject } from "@angular/core";
import { FantasyRelatedMatch, MatchDetail } from "../../../components/calc/models/match.model";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from "../../../../shared/language.native";
import { CalculateAction, ResourceIds } from "../../../../shared/constants";
import { Storage } from "../../../storage/storage.service.native";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { ResultDetail } from "../../../models";


export class VerifyFirstHalfHandler extends AbstractHandler {
  #verifyScoreGoalService = inject(VerifyScoreGoalService);
  #verifyActionService = inject(VerifyActionService);

  public async handle(storage: Storage) {
    const { matchDetail, resultDetails } = storage.getMatch();
    const halftimeResult = resultDetails.find(x => x.resourceId === ResourceIds.halfTime);
    const errorMessage = await this.verifyFirstHalf(halftimeResult, matchDetail, storage.getRelatedMatches());
    if (errorMessage) {
      storage.error(errorMessage);
      return;
    }
    super.handle(storage);
  }


  private async verifyFirstHalf(halftimeResult: ResultDetail, matchDetail: MatchDetail, relatedMatches: FantasyRelatedMatch[]) {
    if (this.#verifyScoreGoalService.verifyScore(halftimeResult, matchDetail)) {
      return Language.warningInputScore;
    }

    if (this.#verifyScoreGoalService.goalRecordNotExistSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.needSemicolonOnGoalRecord;
    }

    if (matchDetail.applyGoalRecord && this.#verifyScoreGoalService.isHtGoalRecordInvalid(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.halfTimeGoalRecordNotConsistent;
    }

    if (matchDetail.isScoreInconsistent) {
      return Language.soccer.confirmWithInconsistentScore;
    }

    if (matchDetail.isFantasyMatch && this.#verifyActionService.isFirstHalfRelatedMatchesNotCalc(relatedMatches)) {
      return Language.fantasyMatch.relatedMatchesNotCalc;
    }

    return this.#verifyActionService.checkNewStatus(matchDetail, CalculateAction.calculateHalfTime);
  }
}