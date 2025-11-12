import { AutofillResult } from "../../constants/result-value";
import { OddFlexModel, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResultStatusId, SettlementStatusId } from "../../../shared/constants";
import { IAutofillStrategy } from "./performance-autofill.strategy";
import { ResourcesIds } from "../../constants";
import { Injectable } from "@angular/core";
import { compareWithCondition, statisticToResourceId, validateCalcFinalResult } from "./autofill.utils";

@Injectable()
export class PerformanceAndTotalScoreStrategy implements IAutofillStrategy {
  getAutofillResult(resultDetails: ResultDetail[], changedResultDetail: ResultDetail): AutofillResult {
    const finalResult = resultDetails.find(result => result.resourceId === ResourcesIds.finalScore);
    const relatedCalResourceIds = changedResultDetail.relatedCalResources.split(',').map(id => id.trim());
    const relatedResults = resultDetails.filter(result => relatedCalResourceIds.includes(result.resourceId));
    const oddFlex = changedResultDetail.oddFlex[0];
    
    // final is refund
    if (finalResult.resultStatusId === ResultStatusId.Refund) {
      return 'None';
    }

    // final calculated
    if (finalResult.settlementStatusId === SettlementStatusId.Calculated) {
      const isValidCalcFinalResultResult = validateCalcFinalResult(oddFlex, finalResult);
      const isValidStatisticResult = this.validateStatisticResult(oddFlex, relatedResults);
      if(isValidCalcFinalResultResult && isValidStatisticResult) {
        return 'Y';
      }
      return 'N';
    }

    return null;

  }



  private validateStatisticResult(oddFlex: OddFlexModel, relatedResults: ResultDetail[]): boolean {

    return oddFlex.info.statistics.every(statistic => {
      const statisticResourceId = statisticToResourceId[statistic.type];
      const relatedResult = relatedResults.find(result => result.betType === statisticResourceId);
      return relatedResult ? compareWithCondition(parseInt(relatedResult.homeValue), statistic.value) : false;
    });

  }
}