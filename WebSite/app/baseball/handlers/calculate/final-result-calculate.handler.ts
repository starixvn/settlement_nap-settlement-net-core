import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { ResourceIds } from "../../../shared/constants";
import * as _ from "lodash";
import { IntervalCalculationService } from "../../../shared/services";
import { ICalculateStorage } from "../../services/calculate/calculate.storage";

export class FinalResultCalculateHandler implements BaseHandler {
  private nextHandler: BaseHandler;
  resultNamePipe = inject(ResourceNamePipe);
  private readonly notifyService = inject(NotifyService);
  private readonly intervalCalculationService = inject(IntervalCalculationService);

  setNextHandler(handler: BaseHandler) {
    this.nextHandler = handler;
  }

  handle(storage: ICalculateStorage) {
    const allInnings = storage.getInningsExcludeExtraAndTotalHits();
    const finalResult = storage.getFullTime();
    const extraInning = storage.getExtraInning();
    const isScoreDirect = storage.isScoreDirect();

    if (!finalResult.checked || isScoreDirect || storage.getMatchDetail().sessionTime === 1) {
      this.nextHandler.handle(storage);
      return;
    }

    const isExistedMercy = allInnings.some(item=> !_.isEmpty(item.otherInfo) && _.isEqual(item.otherInfo.toLowerCase(), ResourceIds.mercy.toLowerCase()));
    const existsNotCheckedOrCalculated = allInnings.some(x => !this.intervalCalculationService.isIntervalCheckedOrCalculated(x));
    if (!isExistedMercy && existsNotCheckedOrCalculated) {
      if (storage.isLeader()) {
        this.notifyService.confirm(Language.intervalsAndMatch.intervalNotSelectedOrNotCalculated, () => this.nextHandler.handle(storage));
        return;
      } else {
        this.notifyService.error(Language.intervalsAndMatch.inningsNotSelected);
        return;
      }
    }

    const totalScoreHome = _.sumBy(allInnings, x => +x.homeValue);
    const totalScoreAway = _.sumBy(allInnings, x => +x.awayValue);

    if (totalScoreHome !== totalScoreAway
      && (!_.isEmpty(extraInning.homeValue)
        && !_.isEmpty(extraInning.awayValue)
        && (extraInning.homeValue !== "0"
        || extraInning.awayValue !== "0"))) {
      this.notifyService.error(Language.intervalsAndMatch.extraInningDraw);
      return;
    }

    if (totalScoreHome !== totalScoreAway && (extraInning.homeValue === "0" && extraInning.awayValue === "0")) {
      extraInning.homeValue = ''; 
      extraInning.awayValue = '';
    }

    this.nextHandler.handle(storage);
  }
}
