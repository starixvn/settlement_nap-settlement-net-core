import { AutofillResult } from "../../constants/result-value";
import { IAutofillStrategy } from "./performance-autofill.strategy.native";
import { Injectable } from "@angular/core";
import { ResultStatusId, SettlementStatusId } from "../../../shared/constants";
import { AutofillResultContext, compareWithCondition, RelatedResult, statisticToResourceId, validateCalcFinalResult } from "./autofill.utils";
import { OddFlexModel, ResultDetail } from "../../../shared/models/sportsbook-sop";

@Injectable()
export class PerformanceAndTeamWinStrategy implements IAutofillStrategy {
  getAutofillResult(context: AutofillResultContext): AutofillResult {
    const { oddFlex, relatedResults, finalResult } = context;
    if (this.shouldReturnNoneForRefund(finalResult, relatedResults)) {
      return 'None';
    }
  
    if (finalResult.settlementStatusId === SettlementStatusId.Calculated) {
      return this.calculateResultForCalculatedStatus(oddFlex, finalResult, relatedResults);
    }

    return '';
  }


  private shouldReturnNoneForRefund(finalResult: ResultDetail, relatedResults: RelatedResult[]): boolean {
    const isFinalRefund = finalResult.resultStatusId === ResultStatusId.Refund;
    const hasRefundRelatedResults = this.existsRefundRelatedResults(relatedResults);
    const hasRefundWithDeterminedRelatedResults = this.existsRefundWithDeterminedRelatedResults(relatedResults);

    return isFinalRefund && (hasRefundWithDeterminedRelatedResults || hasRefundRelatedResults);
  }

  private calculateResultForCalculatedStatus(
    oddFlex: OddFlexModel,
    finalResult: ResultDetail,
    relatedResults: RelatedResult[]
  ): AutofillResult {
    if (this.existsRefundRelatedResults(relatedResults)) {
      return 'None';
    }

    const isValidCalcFinalResult = validateCalcFinalResult(oddFlex, finalResult);
    const isValidStatisticResult = this.validateStatisticResult(oddFlex, relatedResults);

    return isValidCalcFinalResult && isValidStatisticResult ? 'Y' : 'N';
  }

  private existsRefundRelatedResults(relatedResults: RelatedResult[]): boolean {
    return relatedResults.some(result => result.resultStatusId === ResultStatusId.Refund);
  }

  private existsRefundWithDeterminedRelatedResults(relatedResults: RelatedResult[]): boolean {
    return relatedResults.some(result => result.resultStatusId === ResultStatusId.RefundWithDetermined);
  }

  private validateStatisticResult(oddFlex: OddFlexModel, relatedResults: RelatedResult[]): boolean {
    return oddFlex.info.statistics.every(statistic => {
      const statisticResourceId = statisticToResourceId[statistic.type];
      const relatedResult = relatedResults.find(result => result.betType === statisticResourceId);
      return relatedResult ? compareWithCondition(parseInt(relatedResult.homeValue), statistic.value) : false;
    });
  }
}