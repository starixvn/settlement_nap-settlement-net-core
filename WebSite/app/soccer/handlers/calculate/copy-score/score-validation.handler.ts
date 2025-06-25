import { inject } from "@angular/core";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { Storage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { MatchDetailSoccer as MatchDetail } from "../../../components/calc/models/match.model";
import { Language } from "../../../../shared/language.native";
import { ScoreService } from "../../../components/calc/services/score.service";
import { CalculateAction, ScoreSourceType } from "../../../../shared/constants";

export class ScoreValidationHandler extends AbstractHandler {
  readonly #verifyScoreGoalService = inject(VerifyScoreGoalService);
  readonly #scoreService = inject(ScoreService);
  public handle(storage : Storage): void {
    const ftResultDetail = storage.getFullTimeResult();
    const htResultDetail = storage.getHalfTimeResult();

    const ftProviderScore = ftResultDetail.externalScores.find(e => e.sourceId == ScoreSourceType.Sbo)
    const isExtFTScoreValid = this.#verifyScoreGoalService.isScoresValid(ftProviderScore?.homeValue, ftProviderScore?.awayValue);

    const htProviderScore = htResultDetail.externalScores.find(e => e.sourceId == ScoreSourceType.Sbo)
    const isExtHTScoreValid = this.#verifyScoreGoalService.isScoresValid(htProviderScore?.homeValue, htProviderScore?.awayValue);

    if (!isExtHTScoreValid && !isExtFTScoreValid) {
      storage.error(Language.soccer.noSBOScore);
    } else if (!isExtHTScoreValid && isExtFTScoreValid) {
      this.#scoreService.confirmCopyScore(Language.soccer.confirmCopyFinalScore, CalculateAction.copyFTScore);
    } else if (isExtHTScoreValid && !isExtFTScoreValid) {
      this.#scoreService.confirmCopyScore(Language.soccer.confirmCopyHalfTimeScore, CalculateAction.copyHTScore);
    } else {
      this.#scoreService.confirmCopyScore(Language.soccer.confirmCopyScore, CalculateAction.copyAllScore);
    }
  }
}
