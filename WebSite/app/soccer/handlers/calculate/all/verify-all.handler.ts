import { inject } from "@angular/core";
import { ChildMatch, FantasyRelatedMatch, MatchDetail } from "../../../components/calc/models/match.model";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { AbstractHandler } from "../../abstract.handler.native";
import { Language } from "../../../../shared/language.native";
import { CalculateAction } from "../../../../shared/constants";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import {  Storage } from "../../../storage/storage.service.native";
import { ResultDetail } from "../../../models";

export class VerifyAllHandler extends AbstractHandler {
  #verifyScoreGoalService = inject(VerifyScoreGoalService);
  #verifyActionService = inject(VerifyActionService);


  async handle(storage: Storage) {
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

  private  async verifyAll(storage: Storage, matchDetail: MatchDetail, selectedChildMatches: ChildMatch[], relatedMatches: FantasyRelatedMatch[]) {
      const {resultDetails }  = storage.getMatch();
    if (this.#verifyScoreGoalService.verifyScoreAll(resultDetails, matchDetail)) {
        return Language.warningInputScore;
      }
  
      if (this.#verifyScoreGoalService.verifyScoreForChildMatch(matchDetail, selectedChildMatches)) {
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