import { Storage } from "../../storage/storage.service";
import { VerifyScoreGoalService } from "../../components/calc/services/verify-score-goal.service";
import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { MatchDetail } from "../../components/calc/models/match.model";
import { AbstractHandler } from "../abstract.handler";

export class MatchSettledHandler extends AbstractHandler {
  private readonly verifyScoreGoalService = inject(VerifyScoreGoalService);

  public handle(storage: Storage): void {
    if (this.verifyScoreGoalService.isFullTimeSettled(storage.getMatchDetail() as MatchDetail)) {
      storage.error(Language.soccer.matchAlreadySettled);
    } else {
      super.handle(storage);
    }
  }
}