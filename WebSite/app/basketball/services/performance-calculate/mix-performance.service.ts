import { inject, Injectable } from "@angular/core";
import { MixPerformanceCalculateService } from "./mix-performance-calculate.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { PlayerBetTypes, PlayerTypes } from "../../constants";
import { SettlementStatusId } from "../../../shared/constants";

@Injectable()
export class MixPerformanceService {
  readonly #mixPerformanceCalculateService = inject(
    MixPerformanceCalculateService
  );

  autoFillMixPerformance(
    resultDetails: ResultDetail[],
    changedResultDetail: ResultDetail,
    finalResult: ResultDetail
  ) {
    if (!PlayerTypes.baseStats.includes(changedResultDetail.betType) 
      || changedResultDetail.homeValue === "") {
      return;
    }
    const targetResults = resultDetails.filter(
      (x) =>
        PlayerBetTypes.performance.includes(x.betType) &&
        x.relatedCalResources
          .split(",")
          .map((id) => id.trim())
          .includes(changedResultDetail.resourceId)
    );

    for (const targetResult of targetResults) {
      if (targetResult.settlementStatusId === SettlementStatusId.Running) {
        this.#mixPerformanceCalculateService.autoFillMixPerformance(resultDetails, targetResult, finalResult);
      }
    }
  }
}
