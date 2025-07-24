
import { inject, Injectable } from "@angular/core";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { find, isEmpty, isNil } from "lodash";
import { ResultStatusId, ScoreSourceType } from "../../../shared/constants";
import { InputType } from "../../constants/input-type.constant";
import { Language } from "../../../shared/language.native";
import { ResultConfirmedHandler } from "../../handlers/calculate/result-confirmed.handler";
import { VerifyRunningOddsHandler } from "../../handlers/calculate/verify-running-odds.handler";
import { ConfirmMismatchScoreHandler } from "../../handlers/calculate/confirm-mismatch-score.handler";
import { ConfirmChangedResultHandler } from "../../handlers/calculate/confirm-changed-result.handler";
import { ConfirmCalculateHandler } from "../../handlers/calculate/confirm-calculate.handler";
import { SaveScoreHandler } from "../../handlers/calculate/save-score.handler";
import { CalculateHandler } from "../../handlers/calculate/calculate.handler";
import { ConfirmUnCalculateHandler } from "../../handlers/uncalculate/confirm-uncalculate.handler";
import { EarlySettlementStorage } from "./early-settlement.storage";
import { NotifyService } from "../notify.service";
import { AioService } from "../../../shared/services";
import { InvalidResultsHandler } from "../../handlers/early-settlement/invalid-results.handler";
import { ConfirmRefundHandler } from "../../handlers/early-settlement/confirm-refund.handler";
import { VerifyScoreSourceHandler } from "../../handlers/early-settlement/verify-score-source.handler";
import { ResourceItem } from "../../../shared/models";

@Injectable()

export class EarlySettlementService {
  readonly #storage = inject(EarlySettlementStorage);
  readonly #aioService = inject(AioService);
  readonly #notifyService = inject(NotifyService);

  readonly #resultConfirmedHandler = new ResultConfirmedHandler();
  readonly #invalidResultsHandler = new InvalidResultsHandler();
  readonly #verifyRunningOddsHandler = new VerifyRunningOddsHandler();
  readonly #verifyScoreSourceHandler = new VerifyScoreSourceHandler();
  readonly #confirmMismatchScoreHandler = new ConfirmMismatchScoreHandler();
  readonly #confirmChangedResultHandler = new ConfirmChangedResultHandler();
  readonly #confirmCalculateHandler = new ConfirmCalculateHandler();
  readonly #saveScoreHandler = new SaveScoreHandler();
  readonly #calculateHandler = new CalculateHandler();
  readonly #confirmUncalculateHandler = new ConfirmUnCalculateHandler();
  readonly #checkConfirmRefundHandler = new ConfirmRefundHandler();
  readonly #saveScoreOnly = new SaveScoreHandler();


  constructor() {
    this.#resultConfirmedHandler.setNextHandler(this.#invalidResultsHandler);
    this.#invalidResultsHandler.setNextHandler(this.#verifyRunningOddsHandler);
    this.#verifyRunningOddsHandler.setNextHandler(this.#verifyScoreSourceHandler);
    this.#verifyScoreSourceHandler.setNextHandler(this.#confirmMismatchScoreHandler);
    this.#confirmMismatchScoreHandler.setNextHandler(this.#confirmChangedResultHandler);
    this.#confirmChangedResultHandler.setNextHandler(this.#confirmCalculateHandler);
    this.#confirmCalculateHandler.setNextHandler(this.#saveScoreHandler);
    this.#saveScoreHandler.setNextHandler(this.#calculateHandler);
    this.#confirmUncalculateHandler.setNextHandler(this.#calculateHandler);
    this.#checkConfirmRefundHandler.setNextHandler(this.#calculateHandler);
  }

  calculate() {
    this.#resultConfirmedHandler.handle(this.#storage)
  }

  unCalculate() {
    this.#confirmUncalculateHandler.handle(this.#storage);
  }

  refund() {
    this.#checkConfirmRefundHandler.handle(this.#storage);
  }

  saveScore() {
    this.#saveScoreOnly.handle(this.#storage);
  }

  confirmResult(resourceIds: string) {
    const confirmResults = this.#storage.getResultChecked().map(x => new ResourceItem(x.resourceId, x.betTypeName, x.homeValue, x.awayValue));
    this.#aioService.changeConfirmResultSetting(Language.confirmRefund.confirmRefund,
      this.#storage.getMatchDetail().matchId, 
      resourceIds, 
      true, 
      null,
      null,
      confirmResults
      );
  }

  unConfirmResult(resourceIds: string) {
    const resultNotConfirmed = find(this.#storage.getResultChecked(), item => !item.resultSettingData.isConfirmedRefund);
    const confirmResults = this.#storage.getResultChecked().map(x => new ResourceItem(x.resourceId, x.betTypeName, x.homeValue, x.awayValue));

    if (isNil(resultNotConfirmed)) {
      this.#aioService.changeConfirmResultSetting(Language.confirmRefund.undoConfirm, this.#storage.getMatchDetail().matchId, resourceIds, false, null,null, confirmResults);
    } else {
      this.#notifyService.error(Language.confirmRefund.differentStates);
    }
  }

  isExistInhouseResult(result: ResultDetail) {
    return result.inputType === InputType.coupleScore
      ? find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot
        && this.isExistedHomeAwayScore(source.homeValue, source.awayValue))
      : find(result.externalScores, (source) => source.sourceId < ScoreSourceType.screenshot && !isEmpty(source.homeValue));
  }

  isExistedHomeAwayScore(homeValue: string, awayValue: string) {
    return !isEmpty(homeValue) && !isEmpty(awayValue);
  }

  getUncalculateMessage(resultDetails: ResultDetail[]) {
    const isRunningResultStatus = find(resultDetails,
      (x: ResultDetail) =>
        x.resultStatusId === ResultStatusId.RunningZero
        || x.resultStatusId === ResultStatusId.RunningOne
        || x.resultStatusId === ResultStatusId.RunningThree || x.resultStatusId === null);

    return isRunningResultStatus
      ? Language.UnCalculationConfirmMessageEarly2
      : Language.UnCalculationConfirmMessageEarly1;
  }
}