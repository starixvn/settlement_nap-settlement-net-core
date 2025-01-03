import { AbstractHandler } from "../abstract.handler";
import { Storage } from "../../storage/storage.service";
import { VerifyScoreGoalService } from "../../components/calc/services/verify-score-goal.service";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { MatchDetail } from "../../components/calc/models/match.model";
import { CalculateAction } from "../../../shared/constants";
import { ScoreService } from "../../components/calc/services/score.service";

export class HalfTimeSettledHandler extends AbstractHandler {
  readonly #verifyScoreGoalService = inject(VerifyScoreGoalService);
  readonly #scoreService = inject(ScoreService);

  public handle(storage: Storage): void {
    const matchDetail = storage.getMatchDetail() as MatchDetail;
    const isExtFTScoreValid = this.#verifyScoreGoalService.isScoresValid(matchDetail.exFTHomeScore, matchDetail.exFTAwayScore);

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
