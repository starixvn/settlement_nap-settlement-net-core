import { AutofillResult } from "../../constants/result-value";
import { IAutofillStrategy } from "./performance-autofill.strategy";
import { Injectable } from "@angular/core";
import { ResultStatusId, SettlementStatusId } from "../../../shared/constants";
import { ResourcesIds } from "../../constants";
import { compareWithCondition, statisticToResourceId, validateCalcFinalResult } from "./autofill.utils";
import { OddFlexModel, ResultDetail } from "../../../shared/models/sportsbook-sop";

@Injectable()
export class PerformanceAndTeamWinStrategy implements IAutofillStrategy {
  getAutofillResult(resultDetails: ResultDetail[], changedResultDetail: ResultDetail): AutofillResult {
    const oddFlex = changedResultDetail.oddFlex[0];
    const finalResult = resultDetails.find(result => result.resourceId === ResourcesIds.finalScore);
    const relatedResults = this.getRelatedResults(resultDetails, oddFlex, changedResultDetail);

    if (this.shouldReturnNoneForRefund(finalResult, relatedResults)) {
      return 'None';
    }

    if (finalResult.settlementStatusId === SettlementStatusId.Calculated) {
      return this.calculateResultForCalculatedStatus(oddFlex, finalResult, relatedResults);
    }

    return null;
  }

  private getRelatedResults(
    resultDetails: ResultDetail[],
    oddFlex: OddFlexModel,
    changedResultDetail: ResultDetail
  ): ResultDetail[] {
    const relatedCalResourceIds = this.getValidRelatedResourceIds(oddFlex, changedResultDetail);
    return resultDetails.filter(result => relatedCalResourceIds.includes(result.resourceId));
  }

  private shouldReturnNoneForRefund(finalResult: ResultDetail, relatedResults: ResultDetail[]): boolean {
    const isFinalRefund = finalResult.resultStatusId === ResultStatusId.Refund;
    const hasRefundRelatedResults = this.existsRefundRelatedResults(relatedResults);
    const hasRefundWithDeterminedRelatedResults = this.existsRefundWithDeterminedRelatedResults(relatedResults);

    return isFinalRefund && (hasRefundWithDeterminedRelatedResults || hasRefundRelatedResults);
  }

  private calculateResultForCalculatedStatus(
    oddFlex: OddFlexModel,
    finalResult: ResultDetail,
    relatedResults: ResultDetail[]
  ): AutofillResult {
    if (this.existsRefundRelatedResults(relatedResults)) {
      return 'None';
    }

    const isValidCalcFinalResult = validateCalcFinalResult(oddFlex, finalResult);
    const isValidStatisticResult = this.validateStatisticResult(oddFlex, relatedResults);

    return isValidCalcFinalResult && isValidStatisticResult ? 'Y' : 'N';
  }

  private existsRefundRelatedResults(relatedResults: ResultDetail[]): boolean {
    return relatedResults.some(result => result.resultStatusId === ResultStatusId.Refund);
  }

  private existsRefundWithDeterminedRelatedResults(relatedResults: ResultDetail[]): boolean {
    return relatedResults.some(result => result.resultStatusId === ResultStatusId.RefundWithDetermined);
  }

  private getValidRelatedResourceIds(oddFlex: OddFlexModel, changedResultDetail: ResultDetail): string[] {
    const relatedCalResourceIds = changedResultDetail.relatedCalResources.split(',').map(id => id.trim());
    return relatedCalResourceIds.filter(id => {
      const statistic = oddFlex.info.statistics.find(s => id.startsWith(statisticToResourceId[s.type]));
      return statistic !== undefined;
    });
  }

  private validateStatisticResult(oddFlex: OddFlexModel, relatedResults: ResultDetail[]): boolean {
    return oddFlex.info.statistics.every(statistic => {
      const statisticResourceId = statisticToResourceId[statistic.type];
      const relatedResult = relatedResults.find(result => result.betType === statisticResourceId);
      return relatedResult ? compareWithCondition(parseInt(relatedResult.homeValue), statistic.value) : false;
    });
  }
}