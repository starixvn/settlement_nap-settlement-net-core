import { inject } from "@angular/core";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { Storage } from "../../../storage/storage.service.native";
import { AbstractHandler } from "../../abstract.handler.native";
import { MatchDetail } from "../../../components/calc/models/match.model";
import { Language } from "../../../../shared/language.native";
import { ScoreService } from "../../../components/calc/services/score.service";
import { CalculateAction } from "../../../../shared/constants";

export class ScoreValidationHandler extends AbstractHandler {
  readonly #verifyScoreGoalService = inject(VerifyScoreGoalService);
  readonly #scoreService = inject(ScoreService);
  public handle(storage : Storage): void {
    const {matchDetail} = storage.getMatch();

    const isExtFTScoreValid = this.#verifyScoreGoalService.isScoresValid(matchDetail.exFTHomeScore, matchDetail.exFTAwayScore);
    const isExtHTScoreValid = this.#verifyScoreGoalService.isScoresValid(matchDetail.exHTHomeScore, matchDetail.exHTAwayScore);

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
