import { CalculateBaseStorage } from "../../../storage/storage.service.native";
import { VerifyScoreGoalService } from "../../../components/calc/services/verify-score-goal.service";
import { inject } from "@angular/core";
import { Language } from "../../../../shared/language.native";
import { AbstractHandler } from "../../abstract.handler.native";

export class MatchSettledHandler extends AbstractHandler {
  private readonly verifyScoreGoalService = inject(VerifyScoreGoalService);

  public handle(storage: CalculateBaseStorage): void {
    const {matchDetail} = storage.getMatch();
    if (this.verifyScoreGoalService.isFullTimeSettled(matchDetail)) {
      storage.error(Language.soccer.matchAlreadySettled);
    } else {
      super.handle(storage);
    }
  }
}