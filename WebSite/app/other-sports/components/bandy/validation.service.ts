import { Injectable } from "@angular/core";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { ExternalResult, ExternalResultDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";
import * as _ from "lodash";
import { ResourceID } from "../../constants";
import { ResultByTeamNamePipe } from "../../../shared/pipes/result-by-team-name.pipe";
import { GeneralResultDetail } from "../../../shared/models";
import { ResultStatusId, SettlementStatusId } from "../../../shared/constants";

@Injectable()
export class ValidationService extends VerificationBaseService {
  constructor(
    protected resultByTeamNamePipe: ResultByTeamNamePipe) {
    super(resultByTeamNamePipe);
  }
  public inValidFirstHalfFullTime(resultDetails: ResultDetail[]) {
    const firstHalf = resultDetails.find((x) => x.resourceId === ResourceID.FirstHalf);
    const fullTime = resultDetails.find((x) => x.resourceId === ResourceID.FullTime);

    return this.greaterThan(firstHalf, fullTime);
  }

  public inValidFirstHalfMatch(resultDetails: ResultDetail[]) {
    const firstHalf = resultDetails.find((x) => x.resourceId === ResourceID.FirstHalf);
    const matchResult = resultDetails.find((x) => x.resourceId === ResourceID.Final);

    return this.greaterThan(firstHalf, matchResult);
  }

  public inValidFullTimeMatch(resultDetails: ResultDetail[]) {
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Final);
    const fullTime = resultDetails.find((x) => x.resourceId === ResourceID.FullTime);

    return this.greaterThan(fullTime, match);
  }

  public inValidETMatch(resultDetails: ResultDetail[]) {
    const et = resultDetails.find((x) => x.resourceId === ResourceID.Et);
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Final);

    return this.greaterThan(et, match);
  }

  public inValidPenMatch(resultDetails: ResultDetail[]) {
    const pen = resultDetails.find((x) => x.resourceId === ResourceID.Pen);
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Final);

    return this.greaterThan(pen, match);
  }

  public inValidPen(resultDetails: ResultDetail[]) {
    const pen = resultDetails.find((x) => x.resourceId === ResourceID.Pen);
    return this.draw(pen) 
      || this.hasScore(pen) 
          && (!['0','1'].includes(pen.homeValue.toString()) || !['0','1'].includes(pen.awayValue.toString()));
  }

  public inValidMatchSumScore(resultDetails: ResultDetail[]) {
    const finalResult = resultDetails.find((x) => x.resourceId === ResourceID.Final);

    if (!this.hasScore(finalResult)) {
      return false;
    }

    const resourceIds = [ResourceID.FullTime, ResourceID.Et, ResourceID.Pen];

    const gameResults = resultDetails.filter((r) => resourceIds.includes(r.resourceId) && this.hasScore(r));

    if(!gameResults.length) {
      return false
    }

    const homeValue = _.sumBy(gameResults, (x) => Number(x.homeValue));
    const awayValue = _.sumBy(gameResults, (x) => Number(x.awayValue));

    return homeValue !== Number(finalResult.homeValue) || awayValue !== Number(finalResult.awayValue);
  }

  public invalidFistHalf(resultDetails: ResultDetail[]) {
    return this.inValidFirstHalfFullTime(resultDetails)
      || this.inValidFirstHalfMatch(resultDetails)
  }

  public invalidMatchResult(resultDetails: ResultDetail[]) {
    return this.inValidFirstHalfMatch(resultDetails)
      || this.inValidFullTimeMatch(resultDetails)
      || this.inValidETMatch(resultDetails)
      || this.inValidPenMatch(resultDetails)
  }

  public inValidResult(resultDetails: ResultDetail[]) {
    return this.inValidFirstHalfFullTime(resultDetails)
      || this.invalidMatchResult(resultDetails)
      || this.inValidPen(resultDetails)
      || this.inValidMatchSumScore(resultDetails);
  }

  public inValidResultDetailWithOriginal(result: ResultDetail, originalResultDetails: GeneralResultDetail[]) {
    const originalResult = originalResultDetails.find(x => x.resourceId === result?.resourceId);

    return this.hasScore(originalResult) && this.hasScore(result)
      && (!_.isEqual(originalResult.homeValue, result.homeValue) || !_.isEqual(originalResult.awayValue, result.awayValue));
  }


  public inValidResultDetailWithProvider(result: ResultDetail, providerResultDetails: ExternalResultDetail[]) {
    return this.inValidResultDetailWithOriginal(result, providerResultDetails);
  }

  public greaterThan(result: ResultDetail, ortherResult: ResultDetail) {
    return this.hasScore(result)
      && this.hasScore(ortherResult)
      && (Number(result.homeValue) > Number(ortherResult.homeValue)
        || Number(result.awayValue) > Number(ortherResult.awayValue));
  }

  public draw(result: ResultDetail) {
    return this.hasScore(result) && _.isEqual(result.homeValue, result.awayValue)
  }

  public allowCalcFinalResult(firstHalf: ResultDetail, finalResult: ResultDetail) {
    if (!finalResult.checked) {
      return true;
    }
    return firstHalf.checked || firstHalf.ticketStatus === 'No Ticket' || firstHalf.settlementStatusId !== SettlementStatusId.Running;
  }

  public isInsufficientSOPLite(originalResultDetails: ResultDetail[], externalResult: ExternalResult) {
    const hasTrader = originalResultDetails.some(r => r.resultStatusId === ResultStatusId.TraderConfirm);
    const hasProvider =  externalResult?.resultDetails?.some(x => this.hasScore(x));

    return !hasTrader && !hasProvider;
  }


  public isConsistentScoreSOPLite(resultDetails: ResultDetail[], confirmResultDetails: ResultDetail[], externalResult: ExternalResult) {
    const hasTrader = confirmResultDetails.some(r => r.resultStatusId === ResultStatusId.TraderConfirm);
    const hasProvider = externalResult?.resultDetails?.some(x => this.hasScore(x));

    let isConsistent = false;
    if (hasProvider && hasTrader) {
      isConsistent = this.isConsistentTraderAndProvider(confirmResultDetails, externalResult.resultDetails);
    }

    if (!isConsistent && hasProvider) {
      isConsistent = this.isConsistentScoreProvider(resultDetails, externalResult.resultDetails);
    }


    if (!isConsistent && hasTrader) {
      isConsistent = this.isConsistentScoreTraderConfirm(confirmResultDetails, resultDetails);
    }

    return isConsistent;
  }

  public verifyChangeInputScore(currentResult: ResultDetail, resultDetails: ResultDetail[], confirmResultDetails: ResultDetail[], externalResult: ExternalResult) {
    const hasTrader = confirmResultDetails.some(r => r.resultStatusId === ResultStatusId.TraderConfirm);
    const hasProvider = externalResult?.resultDetails?.some(x => this.hasScore(x));

    const finalResult = resultDetails.find(x => x.resourceId === ResourceID.Final);

    if(currentResult.isScoreMismatched || finalResult.isScoreMismatched) {
      return;
    }

    if (hasProvider) {
      if (hasTrader) {
        this.compareConfirmScoreProviderScores(resultDetails, confirmResultDetails, externalResult);
        if (resultDetails.some(x => x.isScoreMismatched)) {
          return;
        }
      }

      this.compareInputScoreWithProviderScores(resultDetails, externalResult.resultDetails);
      return;
    }

    if (hasTrader) {
      this.compareInputScoreTraderScores(confirmResultDetails, resultDetails);
    }
  }

  private compareConfirmScoreProviderScores(resultDetails: ResultDetail[], confirmResultDetails: ResultDetail[], externalResult: ExternalResult) {
    _.forEach(resultDetails, result => {
      const providerResult = externalResult.resultDetails.find(x => x.resourceId === result.resourceId);
      const originalResult = confirmResultDetails.find(x => x.resourceId === result.resourceId);
      result.isScoreMismatched = providerResult
        && originalResult
        && (!_.isEqual(providerResult.homeValue ?? "", originalResult.homeValue ?? "")
          || !_.isEqual(providerResult.awayValue ?? "", originalResult.awayValue ?? ""))
    });
  }

  public verifyResultChanged(resultsChanged:ResultDetail[], confirmResults: ResultDetail[], providerResults:ExternalResultDetail[]) {
    _.forEach(resultsChanged,currentResult => {
      const confirmResult = this.findConfirmResult(confirmResults, currentResult.resourceId);
      const providerResult = this.findProviderResult(providerResults, currentResult.resourceId);
      currentResult.isScoreMismatched = this.isScoreMismatched(currentResult, confirmResult, providerResult);
    });
  }

  private isScoreMismatched(currentResult: ResultDetail, confirmResult: ResultDetail, providerResult: ExternalResultDetail) {
    if (providerResult && confirmResult) {
      return this.isProviderAndConfirmResult(confirmResult, providerResult);
    }
  
    if (providerResult && !confirmResult) {
      return this.isProviderResult(currentResult, providerResult);
    }
  
    if (!providerResult && confirmResult) {
      return this.isConfirmResult(currentResult, confirmResult);
    }
  
    return false;
  }

  private isConfirmResult(currentResult: ResultDetail, confirmResult: ResultDetail) {
    return (!_.isEmpty(currentResult.homeValue) && !_.isEmpty(currentResult.awayValue)) && this.hasScore(confirmResult) && this.isNotEqualResult(currentResult, confirmResult);
  }

  private isProviderResult(currentResult: ResultDetail, providerResult: ExternalResultDetail) {
    return (!_.isEmpty(currentResult.homeValue) && !_.isEmpty(currentResult.awayValue)) && this.hasScore(providerResult) && this.isNotEqualResult(currentResult, providerResult);
  }

  private isProviderAndConfirmResult(confirmResult: ResultDetail, providerResult: ExternalResultDetail) {
    return this.hasScore(providerResult) && this.hasScore(confirmResult) && this.isNotEqualResult(providerResult, confirmResult);
  }

  private findConfirmResult(confirmResults: ResultDetail[], currentResourceId: string) {
    return confirmResults.find((x) => x.resourceId === currentResourceId);
  }
  
  private findProviderResult(providerResults: ExternalResultDetail[], currentResourceId: string) {
    return providerResults.find((x) => x.resourceId === currentResourceId);
  }

  private isNotEqualResult(result: GeneralResultDetail,otherResult: GeneralResultDetail) {
    return (!_.isEqual(result.homeValue,otherResult.homeValue) || !_.isEqual(result.awayValue,otherResult.awayValue));
  }
}
