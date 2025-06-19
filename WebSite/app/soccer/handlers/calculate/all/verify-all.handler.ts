import { inject } from "@angular/core";
import { ChildMatch, FantasyRelatedMatch, MatchDetailSoccer as MatchDetail } from "../../../components/calc/models/match.model";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from "../../../../shared/language.native";
import { CalculateAction } from "../../../../shared/constants";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { ResultDetail } from "../../../models";

export class VerifyAllHandler extends AbstractHandler {
  #verifyScoreGoalService = inject(VerifyScoreGoalService);
  #verifyActionService = inject(VerifyActionService);


  async handle(storage: CalculateBaseStorage) {
      const {matchDetail, childMatches, fantasyMatch} = storage.getMatch();
      const relatedMatches = fantasyMatch?.relatedMatches;
      const selectedChildMatches = childMatches.filter(x => x.checked);
  
      const errorMessage = await this.verifyAll(storage, matchDetail, selectedChildMatches, relatedMatches);
      if (errorMessage) {
        storage.error(errorMessage);
        return;
      }
      super.handle(storage);
    }

  private  async verifyAll(storage: CalculateBaseStorage, matchDetail: MatchDetail, selectedChildMatches: ChildMatch[], relatedMatches: FantasyRelatedMatch[]) {
      const {resultDetails }  = storage.getMatch();
      const checkedResultDetails = resultDetails.filter(x => x.checked);
    if (this.#verifyScoreGoalService.verifyScoreAll(checkedResultDetails)) {
        return Language.warningInputScore;
      }
  
      if (this.#verifyScoreGoalService.verifyScoreForChildMatch(storage.getFullTimeResult(), selectedChildMatches)) {
        return Language.soccer.childMatchesErrorMessage;
      }
  
      if (this.#verifyScoreGoalService.goalRecordNotExistSemicolon(matchDetail)) {
        matchDetail.isWarningGoalRecord = true;
        return Language.soccer.needSemicolonOnGoalRecord;
      }
  
      if (this.#verifyScoreGoalService.isHTGoalRecordConsistentWithResultDetail(matchDetail, storage.getHalfTimeResult())) {
        matchDetail.isWarningGoalRecord = true;
        return Language.soccer.halfTimeGoalRecordNotConsistent;
      }
  
      if (this.#verifyScoreGoalService.isFullTimeGoalRecordInvalidWithResultDetail(matchDetail, storage.getFullTimeResult())) {
        matchDetail.isWarningGoalRecord = true;
        return Language.soccer.goalRecordNotConsistent;
      }
  
      if (matchDetail.isScoreInconsistent) {
        return Language.soccer.incorrectHalftimeAndFullTimeScore;
      }
  
      if (matchDetail.isFantasyMatch && this.#verifyActionService.isAllResultRelatedMatchesNotCalc(relatedMatches)) {
        return Language.fantasyMatch.relatedMatchesNotCalc;
  
      }
  
      return this.#verifyActionService.checkNewStatus(matchDetail, CalculateAction.calculate);
    }
}