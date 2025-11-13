import { AutofillResult } from "../../constants/result-value";
import { OddFlexModel } from "../../../shared/models/sportsbook-sop";
import { ResultStatusId, SettlementStatusId } from "../../../shared/constants";
import { IAutofillStrategy } from "./performance-autofill.strategy.native";
import { Injectable } from "@angular/core";
import { AutofillResultContext, compareWithCondition, RelatedResult, statisticToResourceId } from "./autofill.utils";


@Injectable()
export class PerformanceOnlyStrategy implements IAutofillStrategy {
  getAutofillResult(context: AutofillResultContext): AutofillResult {
    const { oddFlex, relatedResults } = context;
    const isValidStatisticResults = this.validateStatisticResult(oddFlex, relatedResults);

    return this.determineAutofillResult(relatedResults, isValidStatisticResults);
  }

  private determineAutofillResult(
    relatedResults: RelatedResult[],
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

    return '';
  }

  private allCalculated(relatedResults: RelatedResult[]): boolean {
    return relatedResults.every(result =>
      result.settlementStatusId === SettlementStatusId.Calculated
    );
  }

  private allRefundWithDetermined(relatedResults: RelatedResult[]): boolean {
    return relatedResults.every(result =>
      result.resultStatusId === ResultStatusId.RefundWithDetermined
    );
  }

  private allValueAndRunning(relatedResults: RelatedResult[]): boolean {
    return relatedResults.every(result =>
      result.homeValue &&
      result.resultStatusId !== ResultStatusId.AutoCompleted &&
      result.resultStatusId !== ResultStatusId.ManualCompleted
    );
  }

  private canHaveYesValue(relatedResults: RelatedResult[]): boolean {
    return (
      this.allValueAndRunning(relatedResults) ||
      this.allCalculated(relatedResults) ||
      this.allRefundWithDetermined(relatedResults)
    );
  }

  private canHaveNoValue(relatedResults: RelatedResult[]): boolean {
    return (
      this.allValueAndRunning(relatedResults) &&
      !this.allCalculated(relatedResults)
    );
  }

  private canHaveNoneValue(relatedResults: RelatedResult[]): boolean {
    return this.allRefundWithDetermined(relatedResults);
  }

  private validateStatisticResult(oddFlex: OddFlexModel, relatedResults: RelatedResult[]): boolean {
    return oddFlex.info.statistics.every(statistic => {
      const statisticResourceId = statisticToResourceId[statistic.type];
      const relatedResult = relatedResults.find(result => result.betType === statisticResourceId);
      return relatedResult
        ? compareWithCondition(parseInt(relatedResult.homeValue), statistic.value)
        : false;
    });
  }
}
