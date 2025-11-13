import { AutofillResult } from "../../constants/result-value";
import { OddFlexModel, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResultStatusId, SettlementStatusId } from "../../../shared/constants";
import { IAutofillStrategy } from "./performance-autofill.strategy.native";
import { Injectable } from "@angular/core";
import { AutofillResultContext, compareWithCondition, RelatedResult, statisticToResourceId, validateCalcFinalResult } from "./autofill.utils";

@Injectable()
export class PerformanceAndTotalScoreStrategy implements IAutofillStrategy {
  getAutofillResult(context: AutofillResultContext): AutofillResult {
    const { oddFlex, relatedResults, finalResult } = context;
    
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

    return '';

  }

  private validateStatisticResult(oddFlex: OddFlexModel, relatedResults: RelatedResult[]): boolean {
    return oddFlex.info.statistics.every(statistic => {
      const statisticResourceId = statisticToResourceId[statistic.type];
      const relatedResult = relatedResults.find(result => result.betType === statisticResourceId);
      return relatedResult ? compareWithCondition(parseInt(relatedResult.homeValue), statistic.value) : false;
    });

  }
}