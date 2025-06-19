import { AbstractHandler } from "../../abstract.handler.native";
import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { inject } from "@angular/core";
import { Language } from "../../../../shared/language.native";
import { CalculateAction, ScoreSourceType } from "../../../../shared/constants";
import { ScoreService } from "../../../components/calc/services/score.service";

export class HalfTimeSettledHandler extends AbstractHandler {
  readonly #verifyScoreGoalService = inject(VerifyScoreGoalService);
  readonly #scoreService = inject(ScoreService);

  public handle(storage: CalculateBaseStorage): void {
    const {matchDetail} = storage.getMatch();
    const ftResultDetail = storage.getFullTimeResult();
    const providerScore = ftResultDetail.externalScores.find(e => e.sourceId === ScoreSourceType.Sbo)
    const isExtFTScoreValid = this.#verifyScoreGoalService.isScoresValid(providerScore?.homeValue, providerScore?.awayValue);

    if (this.#verifyScoreGoalService.isHalfTimeSettled(matchDetail)) {
      if (isExtFTScoreValid) {
        this.#scoreService.confirmCopyScore(Language.soccer.confirmCopyFinalScore, CalculateAction.copyFTScore);
      } else {
        storage.error(Language.soccer.halfTimeAlreadySettled);
      }
    } else {
      super.handle(storage);
    }
  }
}
