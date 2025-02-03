import { inject } from "@angular/core";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { AbstractHandler } from "../../abstract.handler.native";
import { RequestService } from "../../../components/calc/services/request.service";
import { Storage } from "../../../storage/storage.service.native";
import { ChildMatch, FantasyRelatedMatch, MatchDetail } from "../../../components/calc/models/match.model";
import { Language } from "../../../../shared/language.native";
import { CalculateAction, SettlementStatusId } from "../../../../shared/constants";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { ResourceIds } from "../../../constants";
import { ResultDetail } from "../../../models";

export class VerifyFulltimeHandler extends AbstractHandler {
   #verifyScoreGoalService = inject(VerifyScoreGoalService);
  #verifyActionService = inject(VerifyActionService);

   async handle(storage: Storage) {
    const {matchDetail, childMatches, fantasyMatch, resultDetails} = storage.getMatch();
    const fulltimeResult = resultDetails.find(x => x.resourceId === ResourceIds.fullTime);
    const relatedMatches = fantasyMatch?.relatedMatches;
    const selectedChildMatches = childMatches.filter(x => x.checked);

    const errorMessage = await this.verifyFullTime(fulltimeResult, matchDetail, selectedChildMatches, relatedMatches);
    if (errorMessage) {
      storage.error(errorMessage);
      return;
    }
    super.handle(storage);
  }

  private async verifyFullTime(fulltime: ResultDetail, matchDetail: MatchDetail, selectedChildMatches: ChildMatch[], relatedMatches: FantasyRelatedMatch[]) {
    
    if (this.#verifyScoreGoalService.verifyScore(fulltime, matchDetail, false)) {
      return Language.warningInputScore;
    }
    if (this.#verifyScoreGoalService.verifyScoreForChildMatch(matchDetail, selectedChildMatches)) {
      return Language.soccer.childMatchesErrorMessage;
    }

    if (this.isRefundHalfTimeAndHasSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.noNeedSemicolonOnGoalRecord;
    }
    if (this.isNotRefundHalfTimeAndHasNotSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.needSemicolonOnGoalRecord;
    }
    if (this.#verifyScoreGoalService.isHTGoalRecordConsistent(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.halfTimeGoalRecordNotConsistent;
    }
    if (this.#verifyScoreGoalService.isFullTimeGoalRecordInvalid(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.goalRecordNotConsistent;
    }
    if (matchDetail.isScoreInconsistent) {
      return Language.soccer.incorrectHalftimeAndFullTimeScore;
    }

    if (this.isFantasyMatchAndRelatedMatches(matchDetail, relatedMatches)) {
      return Language.fantasyMatch.relatedMatchesNotCalc;
    }
    return this.#verifyActionService.checkNewStatus(matchDetail, CalculateAction.calculateFullTime);

  }

  private isNotRefundHalfTimeAndHasNotSemicolon(matchDetail: MatchDetail) {
    return !this.#verifyScoreGoalService.isRefundHalfTime(matchDetail) && this.#verifyScoreGoalService.goalRecordNotExistSemicolon(matchDetail)
  }

  private isRefundHalfTimeAndHasSemicolon(matchDetail: MatchDetail) {
    return this.#verifyScoreGoalService.isRefundHalfTime(matchDetail) && this.#verifyScoreGoalService.goalRecordExistSemicolon(matchDetail)
  }

  private isFantasyMatchAndRelatedMatches(matchDetail: MatchDetail, relatedMatches: FantasyRelatedMatch[]) {
    return matchDetail.isFantasyMatch && this.#verifyActionService.isFullTimeRelatedMatchesNotCalc(relatedMatches);
  }
}