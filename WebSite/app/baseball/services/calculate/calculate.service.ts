import { inject, Injectable } from "@angular/core";
import { NonSelectedHandler } from "../../handlers/calculate/non-selected.handler";
import { ResultConfirmedHandler } from "../../handlers/calculate/result-confirmed.handler";
import { InvalidInputHandler } from "../../handlers/calculate/invalid-input.handler";
import { VerifyRunningOddsHandler } from "../../handlers/calculate/verify-running-odds.handler";
import { VerifyScoreSourceHandler } from "../../handlers/calculate/verify-score-source.handler";
import { ConfirmMismatchScoreHandler } from "../../handlers/calculate/confirm-mismatch-score.handler";
import { ConfirmChangedResultHandler } from "../../handlers/calculate/confirm-changed-result.handler";
import { CalculateStore } from "./calculate.store";
import { NotifyService } from "../notify.service";
import { ConfirmUnCalculateHandler } from "../../handlers/uncalculate/confirm-uncalculate.handler";
import { SaveScoreQuery } from "../../../shared/models/sportsbook-sop";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { AioService } from "../../../shared/services";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { ConfirmCalculateHandler } from "../../handlers/calculate/confirm-calculate.handler";
import { SaveScoreHandler } from "../../handlers/calculate/save-score.handler";
import { CalculateHandler } from "../../handlers/calculate/calculate.handler";

@Injectable()

export class CalculateService {
  private nonSelectedHandler = new NonSelectedHandler();
  private resultConfirmedHandler = new ResultConfirmedHandler();
  private invalidInputHandler = new InvalidInputHandler();
  private verifyRunningOddsHandler = new VerifyRunningOddsHandler();
  private verifyScoreSourceHandler = new VerifyScoreSourceHandler();
  private confirmMismatchScoreHandler = new ConfirmMismatchScoreHandler();
  private confirmChangedResultHandler = new ConfirmChangedResultHandler();
  private confirmCalculateHandler = new ConfirmCalculateHandler();
  private saveScoreHandler = new SaveScoreHandler();
  private calculateHandler = new CalculateHandler();
  private confirmUncalculateHandler = new ConfirmUnCalculateHandler();

  private store = inject(CalculateStore);
  private notifyService = inject(NotifyService);
  private aioService = inject(AioService);
  private verificationService = inject(VerificationBaseService)

  constructor() {
    this.nonSelectedHandler.setNextHandler(this.resultConfirmedHandler);
    this.resultConfirmedHandler.setNextHandler(this.invalidInputHandler);
    this.invalidInputHandler.setNextHandler(this.verifyRunningOddsHandler);
    this.verifyRunningOddsHandler.setNextHandler(this.verifyScoreSourceHandler);
    this.verifyScoreSourceHandler.setNextHandler(this.confirmMismatchScoreHandler);
    this.confirmMismatchScoreHandler.setNextHandler(this.confirmChangedResultHandler);
    this.confirmChangedResultHandler.setNextHandler(this.confirmCalculateHandler);
    this.confirmCalculateHandler.setNextHandler(this.saveScoreHandler);
    this.saveScoreHandler.setNextHandler(this.calculateHandler);
    this.confirmUncalculateHandler.setNextHandler(this.calculateHandler);
  }

  calculate() {
    this.nonSelectedHandler.handle(this.store);
  }

  unCalculate() {
    this.confirmUncalculateHandler.handle(this.store);
  }

  async saveScore() {
    const resultWithoutFinal = this.store.getAllInnings();
    const scoresToSave = this.verificationService.getChangedScores(resultWithoutFinal, this.store.getOriginalResultDetails());
    const checkedScores = this.verificationService.getOutsideScores(resultWithoutFinal);
    const query: SaveScoreQuery = {
      matchId: this.store.getMatchDetail().matchId,
      scoresToSave,
      checkedScores,
      apiKey: BaseballApiKeys.NormalMatch
    };

    const result = await this.aioService.saveScore(query);
    if (result.isSuccessful) {
      this.store.getResultDetails().forEach((map) => {
        map.checked = false;
      });
    } else {
      this.notifyService.error(result.errMsg);
    }

  }
}