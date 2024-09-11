import { inject, Injectable } from "@angular/core";
import { NonSelectedHandler } from "../../handlers/calculate/non-selected.handler";
import { ResultConfirmedHandler } from "../../handlers/calculate/result-confirmed.handler";
import { InvalidInputHandler } from "../../handlers/calculate/invalid-input.handler";
import { VerifyRunningOddsHandler } from "../../handlers/calculate/verify-running-odds.handler";
import { VerifyScoreSourceHandler } from "../../handlers/calculate/verify-score-source.handler";
import { ConfirmMismatchScoreHandler } from "../../handlers/calculate/confirm-mismatch-score.handler";
import { ConfirmChangedResultHandler } from "../../handlers/calculate/confirm-changed-result.handler";
import { NotifyService } from "../notify.service";
import { ConfirmUnCalculateHandler } from "../../handlers/uncalculate/confirm-uncalculate.handler";
import { ResultDetail, SaveScoreQuery } from "../../../shared/models/sportsbook-sop";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { AioService } from "../../../shared/services";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { ConfirmCalculateHandler } from "../../handlers/calculate/confirm-calculate.handler";
import { SaveScoreHandler } from "../../handlers/calculate/save-score.handler";
import { CalculateHandler } from "../../handlers/calculate/calculate.handler";
import { CalculateStorage } from "./calculate.storage";
import { every, find, isEqual, sumBy } from "lodash";
import { ResourceIds } from "../../constants/resource-id.constant";
import { GeneralResultDetail } from "../../../shared/models";
import { ConfirmIntervalConsistency } from "../../handlers/calculate/confirm-interval-consistency.handler";
import { FinalResultCalculateHandler } from "../../handlers/calculate/final-result-calculate.handler";

@Injectable()

export class CalculateService {
  private nonSelectedHandler = new NonSelectedHandler();
  private resultConfirmedHandler = new ResultConfirmedHandler();
  private invalidInputHandler = new InvalidInputHandler();
  private verifyRunningOddsHandler = new VerifyRunningOddsHandler();
  private verifyScoreSourceHandler = new VerifyScoreSourceHandler();
  private confirmMismatchScoreHandler = new ConfirmMismatchScoreHandler();
  private finalResultCalculateHandler = new FinalResultCalculateHandler();
  private confirmIntervalConsistency = new ConfirmIntervalConsistency();
  private confirmChangedResultHandler = new ConfirmChangedResultHandler();
  private confirmCalculateHandler = new ConfirmCalculateHandler();
  private saveScoreHandler = new SaveScoreHandler();
  private calculateHandler = new CalculateHandler();
  private confirmUncalculateHandler = new ConfirmUnCalculateHandler();

  #storage = inject(CalculateStorage);
  #notifyService = inject(NotifyService);
  #aioService = inject(AioService);
  #verificationService = inject(VerificationBaseService);

  constructor() {
    this.nonSelectedHandler.setNextHandler(this.resultConfirmedHandler);
    this.resultConfirmedHandler.setNextHandler(this.invalidInputHandler);
    this.invalidInputHandler.setNextHandler(this.verifyRunningOddsHandler);
    this.verifyRunningOddsHandler.setNextHandler(this.verifyScoreSourceHandler);
    this.verifyScoreSourceHandler.setNextHandler(this.confirmMismatchScoreHandler);
    // TODO
    this.confirmMismatchScoreHandler.setNextHandler(this.finalResultCalculateHandler);
    
    this.finalResultCalculateHandler.setNextHandler(this.confirmIntervalConsistency);
    this.confirmIntervalConsistency.setNextHandler(this.confirmChangedResultHandler);
    this.confirmChangedResultHandler.setNextHandler(this.confirmCalculateHandler);
    this.confirmCalculateHandler.setNextHandler(this.saveScoreHandler);
    this.saveScoreHandler.setNextHandler(this.calculateHandler);
    this.confirmUncalculateHandler.setNextHandler(this.calculateHandler);
  }

  calculate() {
    this.nonSelectedHandler.handle(this.#storage);
  }

  unCalculate() {
    this.confirmUncalculateHandler.handle(this.#storage);
  }

  async saveScore() {
    const results = this.#storage.getResultChecked();
    const scoresToSave = this.#verificationService.getChangedScores(results, this.#storage.getOriginalResultDetails());
    const checkedScores = this.#verificationService.getOutsideScores(results);
    const query: SaveScoreQuery = {
      matchId: this.#storage.getMatchDetail().matchId,
      scoresToSave,
      checkedScores,
      apiKey: BaseballApiKeys.NormalMatch
    };

    const result = await this.#aioService.saveScore(query);
    if (result.isSuccessful) {
      this.#storage.getResultDetails().forEach((map) => {
        map.checked = false;
      });
    } else {
      this.#notifyService.error(result.errMsg);
    }
  }

  sumTotalScores(resultDetails: GeneralResultDetail[], totalPoints: GeneralResultDetail) {
    if (resultDetails.length > 0 &&
      (this.isScoreConsecutive(resultDetails))) {
      totalPoints.homeValue = sumBy(resultDetails, (map) => Number(map.homeValue)).toString();
      totalPoints.awayValue = sumBy(resultDetails, (map) => Number(map.awayValue)).toString();
    } else {
      totalPoints.homeValue = "";
      totalPoints.awayValue = "";
    }
  }

  private isScoreConsecutive(resultDetails: GeneralResultDetail[]) {
    if (resultDetails.length === 1) {
      return false;
    }

    return every(resultDetails, (item) =>
      find(resultDetails, (resultDetail) => this.getPosition(resultDetail, resultDetails) === this.getPosition(item, resultDetails) - 1)
      || this.getPosition(item, resultDetails) === 1);
  }

  private getPosition(resultDetail: GeneralResultDetail, resultDetails: GeneralResultDetail[]) {
    return isEqual(resultDetail.resourceId, ResourceIds.extraInning) ? resultDetails.length : Number(resultDetail.resourceId.slice(-2));
  }
}