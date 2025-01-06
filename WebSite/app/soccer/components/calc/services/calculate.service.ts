
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

@Injectable()

export class CalculateService {
  #matchSettledHandler = new MatchSettledHandler();
  #halfTimeSettledHandler = new HalfTimeSettledHandler();
  #scoreValidationHandler = new ScoreValidationHandler();

  //calc-HT
  #verifyHalfTimeHandler = new VerifyFirstHalfHandler();
  #confirmHalfTimeHandler = new ConfirmHalfTimeHandler ();

  //calc-FT
  #verifyFullTimeHandler = new VerifyFulltimeHandler();
  #confirmFullTimeHandler = new ConfirmFullTimeHandler();

  //calc-ALL
  #verifyAllHandler = new VerifyAllHandler();
  #confirmAllHandler = new ConfirmAllHandler();

  #uncalculateHandler = new UncalculateHandler();

  #checkBetStatusHandler = new CheckBetStatusHandler();
  #confirmUncalcFTHandler = new ConfirmUncalcFTHandler();
  #uncalculateFTHandler = new UncalculateFTHandler();

  #calculateHandler = new CalculateHandler();
  #storage = inject(CalculateStorage);

  constructor(){
    this.#matchSettledHandler
    .setNextHandler(this.#halfTimeSettledHandler)
    .setNextHandler(this.#scoreValidationHandler);

    this.#verifyHalfTimeHandler
    .setNextHandler(this.#confirmHalfTimeHandler)
    .setNextHandler(this.#calculateHandler);

    this.#verifyFullTimeHandler
    .setNextHandler(this.#confirmFullTimeHandler)
    .setNextHandler(this.#calculateHandler);

    this.#verifyAllHandler
    .setNextHandler(this.#confirmAllHandler)
    .setNextHandler(this.#calculateHandler);

    this.#uncalculateHandler.setNextHandler(this.#calculateHandler);

    this.#checkBetStatusHandler
    .setNextHandler(this.#confirmUncalcFTHandler)
    .setNextHandler(this.#uncalculateFTHandler);

  }

  copyScore(){
    this.#matchSettledHandler.handle(this.#storage);
  }

  calculateHalfTime(){
    this.#verifyHalfTimeHandler.handle(this.#storage);
  }

  calculateALL(){
    this.#verifyAllHandler.handle(this.#storage);
  }

  calculateFullTime(){
    this.#verifyFullTimeHandler.handle(this.#storage);
  }

  uncalculateAll(){
    this.#uncalculateHandler.handle(this.#storage);
  }

  uncalculateFT(){
    this.#checkBetStatusHandler.handle(this.#storage);
  }
}