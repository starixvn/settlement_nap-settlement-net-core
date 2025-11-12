import { inject, Injectable } from "@angular/core";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { PlayerBetTypes, PlayerTypes } from "../../constants";
import { MixCoreService } from "../mix-core.service";
import { PerformanceAutoFillFactory } from "./PerformanceAutoFillFactory";
import { ResultStatusId } from "../../../shared/constants";

@Injectable()
export class MixPerformanceCalculateService {
  readonly #mixCoreService = inject(MixCoreService);
  readonly #performanceAutoFillFactory = inject(PerformanceAutoFillFactory);

  autoFillMixPerformance(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!PlayerTypes.performance.includes(changedResultDetail.betType) 
        || changedResultDetail.resultStatusId === ResultStatusId.AutoCompleted 
        || changedResultDetail.resultStatusId === ResultStatusId.ManualCompleted) {
      return;
    }

    const autofillStrategy = this.#performanceAutoFillFactory.getAutofillStrategy(changedResultDetail);
    if (!autofillStrategy) {
      return;
    }
    
    const autofillResult = autofillStrategy.getAutofillResult(resultDetails, changedResultDetail);
    if (autofillResult) {
      changedResultDetail.homeValue = autofillResult;
    }
  }
}


