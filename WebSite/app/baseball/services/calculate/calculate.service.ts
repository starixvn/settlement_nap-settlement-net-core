import { inject, Injectable } from "@angular/core";
import { NonSelectedHandler } from "../../handlers/calculate/non-selected.handler";
import { ResultConfirmedHandler } from "../../handlers/calculate/result-confirmed.handler";
import { InvalidInputHandler } from "../../handlers/calculate/invalid-input.handler";
import { VerifyRunningOddsHandler } from "../../handlers/calculate/verify-running-odds.handler";
import { VerifyScoreSourceHandler } from "../../handlers/calculate/verify-score-source.handler";
import { ConfirmMismatchScoreHandler } from "../../handlers/calculate/confirm-mismatch-score.handler";
import { ConfirmChangedResultHandler } from "../../handlers/calculate/confirm-changed-result.handler";
import { InningsValidateHandler } from "../../handlers/calculate/innings-validate.handler";
import { NotifyService } from "../notify.service";
import { ConfirmUnCalculateHandler } from "../../handlers/uncalculate/confirm-uncalculate.handler";
import { SaveScoreQuery } from "../../../shared/models/sportsbook-sop";
import { BaseballApiKeys } from "../../constants/api-keys.constant";
import { AioService } from "../../../shared/services";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { ConfirmCalculateHandler } from "../../handlers/calculate/confirm-calculate.handler";
import { SaveScoreHandler } from "../../handlers/calculate/save-score.handler";
import { CalculateHandler } from "../../handlers/calculate/calculate.handler";
import { CalculateStorage } from "./calculate.storage";
import { countBy, every, find, isEqual, sumBy } from "lodash";
import { ResourceIds } from "../../../shared/constants";
import { GeneralResultDetail } from "../../../shared/models";
import { ConfirmIntervalConsistency } from "../../handlers/calculate/confirm-interval-consistency.handler";
import { FinalResultCalculateHandler } from "../../handlers/calculate/final-result-calculate.handler";
import { MercyValidateHandler } from "../../handlers/calculate/mercy-validate.handler";
import { MultiMercyValidateHandler } from "../../handlers/calculate/multi-mercy-validate.handler";
import { FinalResultMercyCalculateHandler } from "../../handlers/calculate/final-result-mercy-calculate.handler";

@Injectable()

export class CalculateService {
  private readonly nonSelectedHandler = new NonSelectedHandler();
  private readonly resultConfirmedHandler = new ResultConfirmedHandler();
  private readonly invalidInputHandler = new InvalidInputHandler();
  private readonly verifyRunningOddsHandler = new VerifyRunningOddsHandler();
  private readonly verifyScoreSourceHandler = new VerifyScoreSourceHandler();
  private readonly confirmMismatchScoreHandler = new ConfirmMismatchScoreHandler();
  private readonly finalResultCalculateHandler = new FinalResultCalculateHandler();
  private readonly finalResultMercyCalculateHandler = new FinalResultMercyCalculateHandler();
  private readonly confirmIntervalConsistency = new ConfirmIntervalConsistency();
  private readonly confirmChangedResultHandler = new ConfirmChangedResultHandler();
  private readonly confirmCalculateHandler = new ConfirmCalculateHandler();
  private readonly saveScoreHandler = new SaveScoreHandler();
  private readonly calculateHandler = new CalculateHandler();
  private readonly confirmUncalculateHandler = new ConfirmUnCalculateHandler();
  private readonly inningsValidateHandler = new InningsValidateHandler();
  private readonly mercyValidateHandler = new MercyValidateHandler();
  private readonly multiMercyValidateHandler = new MultiMercyValidateHandler();

  #storage = inject(CalculateStorage);
  #notifyService = inject(NotifyService);
  #aioService = inject(AioService);
  #verificationService = inject(VerificationBaseService);

  constructor() {
    this.nonSelectedHandler.setNextHandler(this.resultConfirmedHandler);
    this.resultConfirmedHandler.setNextHandler(this.invalidInputHandler);
    this.invalidInputHandler.setNextHandler(this.inningsValidateHandler);
    this.inningsValidateHandler.setNextHandler(this.multiMercyValidateHandler);
    this.multiMercyValidateHandler.setNextHandler(this.mercyValidateHandler);
    this.mercyValidateHandler.setNextHandler(this.finalResultMercyCalculateHandler);
    this.finalResultMercyCalculateHandler.setNextHandler(this.finalResultCalculateHandler);
    this.finalResultCalculateHandler.setNextHandler(this.verifyRunningOddsHandler);
    this.verifyRunningOddsHandler.setNextHandler(this.verifyScoreSourceHandler);
    this.verifyScoreSourceHandler.setNextHandler(this.confirmMismatchScoreHandler);
    this.confirmMismatchScoreHandler.setNextHandler(this.confirmIntervalConsistency);
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

  sumTotalScores(resultDetails: GeneralResultDetail[], finalResult: GeneralResultDetail, isSumScore: boolean) {
    if (resultDetails.length > 0 && (this.isScoreConsecutive(resultDetails))) {
      if (isSumScore) {
        finalResult.homeValue = sumBy(resultDetails, (map) => Number(map.homeValue)).toString();
        finalResult.awayValue = sumBy(resultDetails, (map) => Number(map.awayValue)).toString();
      } else {
        finalResult.homeValue = (countBy(resultDetails, (map) => Number(map.homeValue) > Number(map.awayValue)).true ?? 0).toString();
        finalResult.awayValue = (countBy(resultDetails, (map) => Number(map.homeValue) < Number(map.awayValue)).true ?? 0).toString();
      }
      return;
    }

    finalResult.homeValue = "";
    finalResult.awayValue = "";

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