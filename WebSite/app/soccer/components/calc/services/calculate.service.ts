
import { inject, Injectable } from "@angular/core";
import { MatchSettledHandler } from "../../../handlers/calculate/copy-score/match-settled.handler";
import { HalfTimeSettledHandler } from "../../../handlers/calculate/copy-score/halftime-settled.handler";
import { ScoreValidationHandler } from "../../../handlers/calculate/copy-score/score-validation.handler";
import { CalculateStorage } from "../../../storage/calculate.storage";
import { ConfirmHalfTimeHandler } from "../../../handlers/calculate/first-half/confirm-halfTime.handler";
import { CalculateHandler } from "../../../handlers/calculate/calculate.handler";
import { VerifyFirstHalfHandler } from "../../../handlers/calculate/first-half/verify-firsthalf.handler";
import { ConfirmFullTimeHandler } from "../../../handlers/calculate/full-time/confirm-fulltime.handler";
import { VerifyFulltimeHandler } from "../../../handlers/calculate/full-time/verify-fulltime.handler";
import { ConfirmAllHandler } from "../../../handlers/calculate/all/confirm-all.handler";
import { VerifyAllHandler } from "../../../handlers/calculate/all/verify-all.handler";
import { UncalculateHandler } from "../../../handlers/calculate/all/uncalculate.handler";
import { CheckBetStatusHandler } from "../../../handlers/calculate/full-time/check-betstatus.handler";
import { ConfirmUncalcFTHandler } from "../../../handlers/calculate/full-time/confirm-uncalcFT.handler";
import { UncalculateFTHandler } from "../../../handlers/calculate/full-time/uncalculate-ft.handler";
import { CalculateAction } from "../../../../shared/constants";
import { VerifySettledResultHandler } from "../../../handlers/calculate/save-score/verify-settled-result.handler";
import { VerifyTraderScoreHandler } from "../../../handlers/calculate/save-score/verify-score.hanlder";
import { SaveScoreHandler } from "../../../handlers/calculate/save-score/save-score.handler";
import { VerifyScoreInstantHandler } from "../../../handlers/calculate/uncalc-instant/verify-score-instant.handler";
import { PushInstantScoreHandler } from "../../../handlers/calculate/uncalc-instant/push-instant-score.handler";
import { VerifyScoreConfirmHandler } from "../../../handlers/calculate/all/verify-score-confirm.handler";
import { ConfirmFtNoTicketHandler } from "../../../handlers/calculate/full-time/confirm-ft-noTicket.handler";
import { VerifyInconsistentScoreHandler } from "../../../handlers/calculate/all/verify-inconsistent-score.handler";
import { VerifyInsufficientScoreHandler } from "../../../handlers/calculate/all/verify-insufficient-score.handler";
import { SaveOutsideScoreHandler } from "../../../handlers/calculate/save-outside-score/save-outside-score.handler";

@Injectable()

export class CalculateService {
  readonly #matchSettledHandler = new MatchSettledHandler();
  readonly #halfTimeSettledHandler = new HalfTimeSettledHandler();
  readonly #scoreValidationHandler = new ScoreValidationHandler();

  //calc-HT
  readonly #verifyHalfTimeHandler = new VerifyFirstHalfHandler();
  readonly #confirmHalfTimeHandler = new ConfirmHalfTimeHandler ();
  readonly #verifyScoreConfirmHalfTimeHandler = new VerifyScoreConfirmHandler();
  readonly #verifyHalfTimeInconsistentScoreHandler = new VerifyInconsistentScoreHandler();
  readonly #verifyHalfTimeInsufficientScoreHandler = new VerifyInsufficientScoreHandler();

  //calc-FT
  readonly #verifyFullTimeHandler = new VerifyFulltimeHandler();
  readonly #confirmFullTimeHandler = new ConfirmFullTimeHandler();
  readonly #confirmFtNoTicketHandler = new ConfirmFtNoTicketHandler();
  readonly #verifyScoreConfirmFullTimeHandler = new VerifyScoreConfirmHandler();
  readonly #verifyFullTimeInconsistentScoreHandler = new VerifyInconsistentScoreHandler();
  readonly #verifyFullTimeInsufficientScoreHandler = new VerifyInsufficientScoreHandler();


  //calc-ALL
  readonly #verifyAllHandler = new VerifyAllHandler();
  readonly #confirmAllHandler = new ConfirmAllHandler();
  readonly #verifyScoreConfirmHandler = new VerifyScoreConfirmHandler();
  readonly #verifyInconsistentScoreHandler = new VerifyInconsistentScoreHandler();
  readonly #verifyInsufficientScoreHandler = new VerifyInsufficientScoreHandler();


  //uncalc-ALL
  readonly #uncalculateHandler = new UncalculateHandler();

  //Uncalc-FT
  readonly #checkBetStatusHandler = new CheckBetStatusHandler();
  readonly #confirmUncalcFTHandler = new ConfirmUncalcFTHandler();
  readonly #uncalculateFTHandler = new UncalculateFTHandler();

  //Save-Score
  readonly #verifySettledResultHandler = new VerifySettledResultHandler();
  readonly #verifyTraderScoreHandler = new VerifyTraderScoreHandler();
  readonly #saveScoreHandler = new SaveScoreHandler();

  readonly #verifyScoreInstant = new VerifyScoreInstantHandler();
  readonly #pushInstantScore = new PushInstantScoreHandler();

  //Save-Outside-Score
  readonly #saveOutsideScoreHandler = new SaveOutsideScoreHandler();

  readonly #calculateHandler = new CalculateHandler();
  readonly #storage = inject(CalculateStorage);

  

  constructor(){
  
    this.#matchSettledHandler
    .setNextHandler(this.#halfTimeSettledHandler)
    .setNextHandler(this.#scoreValidationHandler);

     //calc-HT
    this.#verifyHalfTimeHandler
      .setNextHandler(this.#verifyScoreConfirmHalfTimeHandler)
      .setNextHandler(this.#verifyHalfTimeInsufficientScoreHandler)
      .setNextHandler(this.#verifyHalfTimeInconsistentScoreHandler)
      .setNextHandler(this.#confirmHalfTimeHandler)
      .setNextHandler(this.#calculateHandler);

    //calc-FT
    this.#verifyFullTimeHandler
      .setNextHandler(this.#confirmFtNoTicketHandler)
      .setNextHandler(this.#verifyScoreConfirmFullTimeHandler)
      .setNextHandler(this.#verifyFullTimeInsufficientScoreHandler) 
      .setNextHandler(this.#verifyFullTimeInconsistentScoreHandler)
      .setNextHandler(this.#confirmFullTimeHandler) 
      .setNextHandler(this.#calculateHandler);

    //calc-ALL
    this.#verifyAllHandler
      .setNextHandler(this.#verifyScoreConfirmHandler)
      .setNextHandler(this.#verifyInsufficientScoreHandler)
      .setNextHandler(this.#verifyInconsistentScoreHandler)
      .setNextHandler(this.#confirmAllHandler)
      .setNextHandler(this.#calculateHandler);

    //uncalc-ALL
    this.#uncalculateHandler.setNextHandler(this.#calculateHandler);

    //Uncalc-FT
    this.#checkBetStatusHandler
    .setNextHandler(this.#confirmUncalcFTHandler)
    .setNextHandler(this.#uncalculateFTHandler);

     //Save-Score
    this.#verifySettledResultHandler
    .setNextHandler(this.#verifyTraderScoreHandler)
    .setNextHandler(this.#saveScoreHandler);

    this.#verifyScoreInstant.setNextHandler(this.#pushInstantScore);
  }

  copyScore(){
    this.#matchSettledHandler.handle(this.#storage);
  }

  saveScore(){
    this.#verifySettledResultHandler.handle(this.#storage);
  }

  saveOutsideScore(){
    this.#saveOutsideScoreHandler.handle(this.#storage);
  }

  calculateHalfTime(){
    this.#storage.setCalculateAction(CalculateAction.calculateHalfTime);
    this.#verifyHalfTimeHandler.handle(this.#storage);
  }

  calculateALL(){
    this.#storage.setCalculateAction(CalculateAction.calculate);
    this.#verifyAllHandler.handle(this.#storage);
  }

  calculateFullTime(){
    this.#storage.setCalculateAction(CalculateAction.calculateFullTime);
    this.#verifyFullTimeHandler.handle(this.#storage);
  }

  uncalculateAll(){
    this.#storage.setCalculateAction(CalculateAction.unCalculate);
    this.#uncalculateHandler.handle(this.#storage);
  }

  uncalculateFT(){
    this.#checkBetStatusHandler.handle(this.#storage);
  }

  unCalcInstant(){
    this.#verifyScoreInstant.handle(this.#storage);
  }

}