
import { inject, Injectable } from "@angular/core";
import { MatchSettledHandler } from "../../../handlers/calculate/match-settled.handler";
import { HalfTimeSettledHandler } from "../../../handlers/calculate/halftime-settled.handler";
import { ScoreValidationHandler } from "../../../handlers/calculate/score-validation.handler";
import { CalculateStorage } from "../../../storage/calculate.storage";

@Injectable()

export class CalculateService {
  #matchSettledHandler = new MatchSettledHandler();
  #halfTimeSettledHandler = new HalfTimeSettledHandler();
  #scoreValidationHandler = new ScoreValidationHandler();
  #storage = inject(CalculateStorage);

  constructor(){
    this.#matchSettledHandler
    .setNextHandler(this.#halfTimeSettledHandler)
    .setNextHandler(this.#scoreValidationHandler);
  }

  copyScore(){
    this.#matchSettledHandler.handle(this.#storage);
  }
}