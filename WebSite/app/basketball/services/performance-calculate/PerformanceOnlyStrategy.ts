import { AutofillResult } from "../../constants/result-value";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResultStatusId } from "../../../shared/constants/result-status-id.native";
import { SettlementStatusId } from "../../../shared/constants/settlement-status-id.native";
import { OddFlexModel } from "../../../shared/models/sportsbook-sop";
import { IAutofillStrategy } from "./performance-autofill.strategy";
import { Injectable } from "@angular/core";
import { compareWithCondition, statisticToResourceId } from "./autofill.utils";


@Injectable()
export class PerformanceOnlyStrategy implements IAutofillStrategy {
  getAutofillResult(resultDetails: ResultDetail[], changedResultDetail: ResultDetail): AutofillResult {
    const relatedResults = this.getRelatedResults(resultDetails, changedResultDetail);
    const oddFlex = changedResultDetail.oddFlex[0];
    const isValidStatisticResults = this.validateStatisticResult(oddFlex, relatedResults);

    return this.determineAutofillResult(relatedResults, isValidStatisticResults);
  }

  private getRelatedResults(resultDetails: ResultDetail[], changedResultDetail: ResultDetail): ResultDetail[] {
    const relatedCalResourceIds = changedResultDetail.relatedCalResources
      .split(',')
      .map(id => id.trim());
    return resultDetails.filter(result => relatedCalResourceIds.includes(result.resourceId));
  }

  private determineAutofillResult(
    relatedResults: ResultDetail[],
    isValidStatisticResults: boolean
  ): AutofillResult {
    if (this.canHaveYesValue(relatedResults) && isValidStatisticResults) {
      return 'Y';
    }

    if (this.canHaveNoValue(relatedResults) && !isValidStatisticResults) {
      return 'N';
    }

    if (this.canHaveNoneValue(relatedResults) && !isValidStatisticResults) {
      return 'None';
    }

    return null;
  }

  private allCalculated(relatedResults: ResultDetail[]): boolean {
    return relatedResults.every(result =>
      result.settlementStatusId === SettlementStatusId.Calculated
    );
  }

  private allRefundWithDetermined(relatedResults: ResultDetail[]): boolean {
    return relatedResults.every(result =>
      result.resultStatusId === ResultStatusId.RefundWithDetermined
    );
  }

  private allValueAndRunning(relatedResults: ResultDetail[]): boolean {
    return relatedResults.every(result =>
      result.homeValue &&
      result.resultStatusId !== ResultStatusId.AutoCompleted &&
      result.resultStatusId !== ResultStatusId.ManualCompleted
    );
  }

  private canHaveYesValue(relatedResults: ResultDetail[]): boolean {
    return (
      this.allValueAndRunning(relatedResults) ||
      this.allCalculated(relatedResults) ||
      this.allRefundWithDetermined(relatedResults)
    );
  }

  private canHaveNoValue(relatedResults: ResultDetail[]): boolean {
    return (
      this.allValueAndRunning(relatedResults) &&
      !this.allCalculated(relatedResults)
    );
  }

  private canHaveNoneValue(relatedResults: ResultDetail[]): boolean {
    return this.allRefundWithDetermined(relatedResults);
  }

  private validateStatisticResult(oddFlex: OddFlexModel, relatedResults: ResultDetail[]): boolean {
    return oddFlex.info.statistics.every(statistic => {
      const statisticResourceId = statisticToResourceId[statistic.type];
      const relatedResult = relatedResults.find(result => result.betType === statisticResourceId);
      return relatedResult
        ? compareWithCondition(parseInt(relatedResult.homeValue), statistic.value)
        : false;
    });
  }
}
