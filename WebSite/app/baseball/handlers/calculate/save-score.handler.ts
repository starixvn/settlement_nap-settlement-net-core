import { inject } from "@angular/core";
import { AioService } from "../../../shared/services/aio.service";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { SaveScoreQuery } from "../../../shared/models/sportsbook-sop";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { CalculateStore } from "../../services/calculate/calculate.store";

export class SaveScoreHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  private aioService = inject(AioService);
  private verificationService = inject(VerificationBaseService);
  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  async handle() {
    const scoresToSave = this.verificationService.getChangedScores(this.store.getResultDetails(),this.store.getOriginalResultDetails());
    const checkedScores = this.verificationService.getOutsideScores(this.store.getResultDetails());
    const saveScoreQuery: SaveScoreQuery = {
      matchId: this.store.getMatchDetail().matchId,
      scoresToSave,
      checkedScores,
      apiKey: BaseballApiKeys.NormalMatch,
    };

    const saveScoreResult = await this.aioService.saveScore(saveScoreQuery);
    if(!saveScoreResult.isSuccessful){
      this.notifyService.error(saveScoreResult.errMsg);
    } else {
      this.nextHandler.handle();
    }
  }
}