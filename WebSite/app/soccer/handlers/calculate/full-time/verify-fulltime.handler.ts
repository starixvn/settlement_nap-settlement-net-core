import { inject } from "@angular/core";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { AbstractHandler } from "../../abstract.handler.native";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { ChildMatch, FantasyRelatedMatch, MatchDetailSoccer as MatchDetail } from "../../../components/calc/models/match.model";
import { Language } from "../../../../shared/language.native";
import { CalculateAction } from "../../../../shared/constants";
import { VerifyActionService } from "../../../components/calc/services/verify-action.service";
import { ResultDetail } from "../../../../shared/models/sportsbook-sop/result-detail.model";

export class VerifyFulltimeHandler extends AbstractHandler {
   #verifyScoreGoalService = inject(VerifyScoreGoalService);
  #verifyActionService = inject(VerifyActionService);

   async handle(storage: CalculateBaseStorage) {
    const {matchDetail, childMatches, fantasyMatch} = storage.getMatch();
    const fulltimeResult = storage.getFullTimeResult();
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
    
    if(this.isConfirmedRefund(fulltime)) {
      return Language.confirmRefund.calculateResultNotConfirmed;
    }
    
    if (this.#verifyScoreGoalService.verifyScore(fulltime)) {
      return Language.warningInputScore;
    }
    if (this.#verifyScoreGoalService.verifyScoreForChildMatch(fulltime, selectedChildMatches)) {
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
    if (this.#verifyScoreGoalService.isFullTimeGoalRecordInvalidWithResultDetail(matchDetail, fulltime)) {
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

  private isConfirmedRefund(fulltime: ResultDetail) {
    return fulltime.resultSettingData.isConfirmedRefundSdt || fulltime.resultSettingData.isConfirmedRefund;
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