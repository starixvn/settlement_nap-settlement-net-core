
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
  #matchSettledHandler = new MatchSettledHandler();
  #halfTimeSettledHandler = new HalfTimeSettledHandler();
  #scoreValidationHandler = new ScoreValidationHandler();

  //calc-HT
  #verifyHalfTimeHandler = new VerifyFirstHalfHandler();
  #confirmHalfTimeHandler = new ConfirmHalfTimeHandler ();
  #verifyScoreConfirmHalfTimeHandler = new VerifyScoreConfirmHandler();
  #verifyHalfTimeInconsistentScoreHandler = new VerifyInconsistentScoreHandler();
  #verifyHalfTimeInsufficientScoreHandler = new VerifyInsufficientScoreHandler();

  //calc-FT
  #verifyFullTimeHandler = new VerifyFulltimeHandler();
  #confirmFullTimeHandler = new ConfirmFullTimeHandler();
  #confirmFtNoTicketHandler = new ConfirmFtNoTicketHandler();
  #verifyScoreConfirmFullTimeHandler = new VerifyScoreConfirmHandler();
  #verifyFullTimeInconsistentScoreHandler = new VerifyInconsistentScoreHandler();
  #verifyFullTimeInsufficientScoreHandler = new VerifyInsufficientScoreHandler();


  //calc-ALL
  #verifyAllHandler = new VerifyAllHandler();
  #confirmAllHandler = new ConfirmAllHandler();
  #verifyScoreConfirmHandler = new VerifyScoreConfirmHandler();
  #verifyInconsistentScoreHandler = new VerifyInconsistentScoreHandler();
  #verifyInsufficientScoreHandler = new VerifyInsufficientScoreHandler();


  //uncalc-ALL
  #uncalculateHandler = new UncalculateHandler();

  //Uncalc-FT
  #checkBetStatusHandler = new CheckBetStatusHandler();
  #confirmUncalcFTHandler = new ConfirmUncalcFTHandler();
  #uncalculateFTHandler = new UncalculateFTHandler();

  //Save-Score
  #verifySettledResultHandler = new VerifySettledResultHandler();
  #verifyTraderScoreHandler = new VerifyTraderScoreHandler();
  #saveScoreHandler = new SaveScoreHandler();

  #verifyScoreInstant = new VerifyScoreInstantHandler();
  #pushInstantScore = new PushInstantScoreHandler();

  //Save-Outside-Score
  #saveOutsideScoreHandler = new SaveOutsideScoreHandler();

  #calculateHandler = new CalculateHandler();
  #storage = inject(CalculateStorage);

  

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