import { inject, Injectable } from "@angular/core";
import { ExternalResultDetail, OddFlexModel, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { PlayerTypes } from "../../constants";
import { PerformanceAutoFillFactory } from "./performance-autoFill-factory";
import { AutofillResultContext, RelatedResult, statisticToResourceId } from "./autofill.utils";
import { IAutofillStrategy } from "./performance-autofill.strategy.native";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { AutofillResult } from "../../constants/result-value";

@Injectable()
export class MixPerformanceCalculateService {
  readonly #performanceAutoFillFactory = inject(PerformanceAutoFillFactory);
  readonly #verificationBaseService = inject(VerificationBaseService);

  private static readonly MINIMUM_SOURCE_ID = 100;


  autoFillMixPerformance(resultDetails: ResultDetail[], changedResultDetail: ResultDetail, finalResult: ResultDetail) {
    if (!PlayerTypes.performance.includes(changedResultDetail.betType) || changedResultDetail.oddFlex.length === 0) {
      return;
    }
    const [expectedValue, autofillStrategy] = this.calculateExpectedValue(resultDetails, changedResultDetail, finalResult);
    if (!expectedValue) {
      return;
    }

    changedResultDetail.homeValue = expectedValue;

    this.updateExternalScore(resultDetails, changedResultDetail, autofillStrategy, finalResult);
    changedResultDetail.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(changedResultDetail);
  }

  getExpectedValueOnly(
    resultDetails: ResultDetail[],
    changedResultDetail: ResultDetail,
    finalResult: ResultDetail
  ): AutofillResult {
    const [expectedValue] = this.calculateExpectedValue(resultDetails, changedResultDetail, finalResult);
    return expectedValue;
  }

  private calculateExpectedValue(resultDetails: ResultDetail[], changedResultDetail: ResultDetail, finalResult: ResultDetail): [AutofillResult, IAutofillStrategy | null] {
    const context = this.createAutofillContext(resultDetails, changedResultDetail, finalResult);
    const autofillStrategy = this.#performanceAutoFillFactory.getAutofillStrategy(context);
    if (!autofillStrategy) {
      return ['', null];
    }

    const autofillResult = autofillStrategy.getAutofillResult(context);
    return [autofillResult, autofillStrategy];
  }

  private createAutofillContext(resultDetails: ResultDetail[], changedResultDetail: ResultDetail, finalResult: ResultDetail): AutofillResultContext {
    const oddFlex = changedResultDetail.oddFlex[0];
    const relatedResults = this.getRelatedResults(resultDetails, changedResultDetail);
    const context: AutofillResultContext = {
      oddFlex,
      relatedResults,
      changedResultDetail,
      finalResult
    };
    return context;
  }

  private updateExternalScore(
    resultDetails: ResultDetail[],
    changedResultDetail: ResultDetail,
    autofillStrategy: IAutofillStrategy,
    finalResult: ResultDetail
  ) {
    const oddFlex = changedResultDetail.oddFlex[0];
    const relatedResults = this.getRelatedResults(resultDetails, changedResultDetail);
    changedResultDetail.externalScores.forEach((externalScore) => {
      const relatedExternalResults = this.getRelatedExternalResults(relatedResults, externalScore.sourceId);

      if (relatedExternalResults.length > 0) {
        const newContext: AutofillResultContext = {
          oddFlex,
          changedResultDetail,
          finalResult,
          relatedResults: relatedExternalResults
        };
        externalScore.homeValue = autofillStrategy.getAutofillResult(newContext);
      }
    });
  }

  private getRelatedExternalResults(relatedResults: ResultDetail[], sourceId: number): RelatedResult[] {
    return relatedResults
      .flatMap(result => result.externalScores)
      .filter(result => this.isValidExternalResult(result, sourceId))
      .map(result => this.mapToRelatedResult(result, relatedResults));
  }

  private isValidExternalResult(result: ExternalResultDetail, sourceId: number): boolean {
    return result.sourceId === sourceId &&
      result.homeValue !== '' &&
      sourceId > MixPerformanceCalculateService.MINIMUM_SOURCE_ID;
  }

  private mapToRelatedResult(result: ExternalResultDetail, relatedResults: ResultDetail[]): RelatedResult {
    const parentResult = relatedResults.find(x => x.resourceId === result.resourceId);
    return {
      ...result,
      betType: parentResult?.betType,
      settlementStatusId: parentResult?.settlementStatusId
    } as RelatedResult;
  }

  private getRelatedResults(
    resultDetails: ResultDetail[],
    changedResultDetail: ResultDetail
  ): ResultDetail[] {
    const relatedCalResourceIds = this.getValidRelatedResourceIds(changedResultDetail);
    return resultDetails.filter(result => relatedCalResourceIds.includes(result.resourceId));
  }

  private getValidRelatedResourceIds(changedResultDetail: ResultDetail): string[] {
    const relatedResourceIds = this.parseRelatedResourceIds(changedResultDetail.relatedCalResources);
    return relatedResourceIds.filter(id => this.hasValidStatistic(changedResultDetail.oddFlex[0], id));
  }

  private parseRelatedResourceIds(relatedCalResources: string): string[] {
    return relatedCalResources.split(',').map(id => id.trim()).filter(Boolean);
  }

  private hasValidStatistic(oddFlex: OddFlexModel, resourceId: string): boolean {
    return oddFlex.info.statistics.some(statistic =>
      resourceId.startsWith(statisticToResourceId[statistic.type])
    );
  }
}


