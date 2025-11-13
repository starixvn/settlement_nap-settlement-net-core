import { inject, Injectable } from "@angular/core";
import { OddFlexModel, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { PlayerTypes } from "../../constants";
import { PerformanceAutoFillFactory } from "./performance-autoFill-factory";
import { AutofillResultContext, RelatedResult, statisticToResourceId } from "./autofill.utils";
import { IAutofillStrategy } from "./performance-autofill.strategy.native";
import { VerificationBaseService } from "../../../core/services/verification-base.service";

@Injectable()
export class MixPerformanceCalculateService {
  readonly #performanceAutoFillFactory = inject(PerformanceAutoFillFactory);
  readonly #verificationBaseService = inject(VerificationBaseService);

  autoFillMixPerformance(resultDetails: ResultDetail[], changedResultDetail: ResultDetail, finalResult: ResultDetail) {
    if (!PlayerTypes.performance.includes(changedResultDetail.betType) || changedResultDetail.oddFlex.length === 0) {
      return;
    }

    const oddFlex = changedResultDetail.oddFlex[0];
    const relatedResults = this.getRelatedResults(resultDetails, oddFlex, changedResultDetail);
    const context: AutofillResultContext = {
      oddFlex,
      relatedResults,
      changedResultDetail,
      finalResult
    };

    const autofillStrategy = this.#performanceAutoFillFactory.getAutofillStrategy(context);
    if (!autofillStrategy) {
      return;
    }

    const autofillResult = autofillStrategy.getAutofillResult(context);
    if (autofillResult) {
      changedResultDetail.homeValue = autofillResult;
      this.updateExternalScore(relatedResults, changedResultDetail, context, autofillStrategy);
      changedResultDetail.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(changedResultDetail);
    }

  }

  private updateExternalScore(relatedResults: ResultDetail[],
    changedResultDetail: ResultDetail,
    context: AutofillResultContext,
    autofillStrategy: IAutofillStrategy
  ) {
    changedResultDetail.externalScores.forEach((externalScore) => {
      const relatedExternalResults = relatedResults
        .flatMap(result => result.externalScores)
        .filter(result => result.sourceId === externalScore.sourceId 
          && result.homeValue !== ''
          && externalScore.sourceId > 100)
        .map(result => ({
          ...result,
          betType: relatedResults.find(x => x.resourceId === result.resourceId)?.betType,
          settlementStatusId: relatedResults.find(x => x.resourceId === result.resourceId)?.settlementStatusId
        }) as RelatedResult);

      if (relatedExternalResults.length > 0) {
        const newContext: AutofillResultContext = {
          ...context,
          relatedResults: relatedExternalResults
        };
        externalScore.homeValue = autofillStrategy.getAutofillResult(newContext);
      }
    });
  }

  private getRelatedResults(
    resultDetails: ResultDetail[],
    oddFlex: OddFlexModel,
    changedResultDetail: ResultDetail
  ): ResultDetail[] {
    const relatedCalResourceIds = this.getValidRelatedResourceIds(oddFlex, changedResultDetail);
    return resultDetails.filter(result => relatedCalResourceIds.includes(result.resourceId));
  }

  private getValidRelatedResourceIds(oddFlex: OddFlexModel, changedResultDetail: ResultDetail): string[] {
    const relatedCalResourceIds = changedResultDetail.relatedCalResources.split(',').map(id => id.trim());
    return relatedCalResourceIds.filter(id => {
      const statistic = oddFlex.info.statistics.find(s => id.startsWith(statisticToResourceId[s.type]));
      return statistic !== undefined;
    });
  }
}


