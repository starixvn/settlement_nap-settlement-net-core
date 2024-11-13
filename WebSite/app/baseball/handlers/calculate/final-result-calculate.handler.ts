import { inject } from "@angular/core";
import { Language } from "../../../shared/language.native";
import { ResourceNamePipe } from "../../pipes/resource-name.pipe";
import { NotifyService } from "../../services/notify.service";
import { BaseHandler } from "../base.handler.native";
import { ResourceIds } from "../../../shared/constants";
import * as _ from "lodash";
import { IntervalCalculationService } from "../../../shared/services";
import { ICalculateStorage } from "../../services/calculate/calculate.storage";
import { ResultDetailBaseBall } from "../../models";

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

    if (this.shouldSkipHandling(finalResult, storage)) {
      this.nextHandler.handle(storage);
      return;
    }

    if (this.checkInnings(allInnings, storage)) {
      return;
    }

    if (this.checkExtraInning(allInnings, extraInning)) {
      return;
    }

    this.nextHandler.handle(storage);
  }

  private shouldSkipHandling(finalResult: ResultDetailBaseBall, storage: ICalculateStorage) {
    return !finalResult.checked || storage.isScoreDirect() || storage.getMatchDetail().sessionTime === 1;
  }

  private checkInnings(allInnings: ResultDetailBaseBall[], storage: ICalculateStorage) {
    const isExistedMercy = allInnings.some(item=> !_.isEmpty(item.otherInfo) && _.isEqual(item.otherInfo.toLowerCase(), ResourceIds.mercy.toLowerCase()));
  
    if (!isExistedMercy && existsNotCheckedOrCalculated) {
        if (storage.isLeader()) {
            this.notifyService.confirm(
                Language.intervalsAndMatch.intervalNotSelectedOrNotCalculated,
                () => this.nextHandler.handle(storage)
            );
        } else {
            this.notifyService.error(Language.intervalsAndMatch.inningsNotSelected);
        }
        return true; 
    }

    return false; 
  }

  
  private checkExtraInning(allInnings: ResultDetailBaseBall[], extraInning: ResultDetailBaseBall) {

    if (totalScoreHome !== totalScoreAway &&
        !_.isEmpty(extraInning.homeValue) &&
        !_.isEmpty(extraInning.awayValue) &&
        (extraInning.homeValue !== "0" || extraInning.awayValue !== "0")) {
        this.notifyService.error(Language.intervalsAndMatch.extraInningDraw);
        return true; 
    }

    this.clearExtraInningIfNeeded(totalScoreHome, totalScoreAway, extraInning);

    this.nextHandler.handle(storage);
  }

  private clearExtraInningIfNeeded(totalScoreHome: number, totalScoreAway: number, extraInning: ResultDetail) {
    if (totalScoreHome !== totalScoreAway && (extraInning.homeValue === "0" && extraInning.awayValue === "0")) {
        extraInning.homeValue = ''; 
        extraInning.awayValue = '';
    }
  }

    return false; 
    return totalScoreHome !== totalScoreAway &&
        (!_.isEmpty(extraInning.homeValue) &&
        !_.isEmpty(extraInning.awayValue) &&
        (extraInning.homeValue !== "0" || extraInning.awayValue !== "0"));
  }

  private calculateTotalScores(allInnings: ResultDetail[]) {
    const totalScoreHome = _.sumBy(allInnings, x => +x.homeValue);
    const totalScoreAway = _.sumBy(allInnings, x => +x.awayValue);
    return { totalScoreHome, totalScoreAway };
  }

  private hasUncheckedInnings(allInnings: ResultDetail[]) {
    return allInnings.some(x => !this.intervalCalculationService.isIntervalCheckedOrCalculated(x));
  }

  private shouldProceed(finalResult: ResultDetail, isScoreDirect: boolean, storage: Storage) {
    return !finalResult.checked || isScoreDirect || storage.getMatchDetail().sessionTime === 1;
  }

  private getFilteredInnings(storage: Storage) {
    return storage.getResultDetails().filter(x => 
        ![
            ResourceIds.totalHits,
            ResourceIds.fullTime,
            ResourceIds.extraInning,
        ].includes(x.resourceId)
    );
  }

  private getFinalResult(storage: Storage) {
    return storage.getResultDetails().find(x => x.resourceId === ResourceIds.fullTime);
  }

  private getExtraInning(storage: Storage) {
    return storage.getResultDetails().find(x => x.resourceId === ResourceIds.extraInning);
  }
}
