import { Injectable } from "@angular/core";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { ExternalResult, ExternalResultDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";

import * as _ from "lodash";
import { LeagueType, ResourceID } from "./constant";
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

    return this.greaterThan(firstHalf,fullTime);
  }

  public inValidFirstHalfMatch(resultDetails: ResultDetail[]) {
    const firstHalf = resultDetails.find((x) => x.resourceId === ResourceID.FirstHalf);
    const matchResult = resultDetails.find((x) => x.resourceId === ResourceID.Final);

    return this.greaterThan(firstHalf,matchResult);
  }

  public inValidFullTimeMatch(resultDetails: ResultDetail[])  {
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Final);
    const fullTime = resultDetails.find((x) => x.resourceId === ResourceID.FullTime);

    return this.greaterThan(fullTime,match);
  }

  public inValidETMatch(resultDetails: ResultDetail[]) {
    const et = resultDetails.find((x) => x.resourceId === ResourceID.Et);
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Final);

    return this.greaterThan(et,match);
  }

  public inValidPenMatch(resultDetails: ResultDetail[]) {
    const pen = resultDetails.find((x) => x.resourceId === ResourceID.Pen);
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Final);

    return this.greaterThan(pen,match);
  }

  public inValidPenDraw(resultDetails: ResultDetail[]) {
    const pen = resultDetails.find((x) => x.resourceId === ResourceID.Pen);
    return this.draw(pen);
  }
  
  public inValidMatchSumScore(resultDetails: ResultDetail[]) {
    const finalResult = resultDetails.find((x) => x.resourceId === ResourceID.Final);
    
    if (!this.hasScore(finalResult)) {
      return false;
    }
    
    const resourceIds = [ResourceID.FullTime, ResourceID.Et, ResourceID.Pen];
    
    const gameResults = resultDetails.filter((r) => resourceIds.includes(r.resourceId) && this.hasScore(r));
    
    const homeValue = _.sumBy(gameResults, (x) => Number(x.homeValue));
    const awayValue = _.sumBy(gameResults, (x) => Number(x.awayValue));
    
    return homeValue !== Number(finalResult.homeValue) || awayValue !== Number(finalResult.awayValue);
  }

  public invalidMatchResult(resultDetails: ResultDetail[]) {
    return this.inValidFirstHalfMatch(resultDetails)
    || this.inValidFullTimeMatch(resultDetails)
    || this.inValidETMatch(resultDetails) 
    || this.inValidPenMatch(resultDetails)
  }

  public inValidResult(resultDetails: ResultDetail[]) {
    return  this.inValidFirstHalfFullTime(resultDetails) 
      || this.invalidMatchResult(resultDetails)
      || this.inValidPenDraw(resultDetails) 
      || this.inValidMatchSumScore(resultDetails);
  }

  public inValidResultDetailWithOriginal(result: ResultDetail,originalResultDetails: GeneralResultDetail[]) {
    const originalResult = originalResultDetails.find(x => x.resourceId === result.resourceId);
    
    return this.hasScore(originalResult) && this.hasScore(result)
      && (!_.isEqual(originalResult.homeValue, result.homeValue) || !_.isEqual(originalResult.awayValue, result.awayValue));
  }

  
  public inValidResultDetailWithProvider(result: ResultDetail,providerResultDetails: ExternalResultDetail[]) {
    return this.inValidResultDetailWithOriginal(result,providerResultDetails);
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


  public verifyFhFtPen(resultDetails: ResultDetail[]) { 
    const firstHalf = resultDetails.find((x) => x.resourceId === ResourceID.FirstHalf);
    const fullTime = resultDetails.find((x) => x.resourceId === ResourceID.FullTime);

    const fhFt = resultDetails.filter(x => [ResourceID.FirstHalf,ResourceID.FullTime].includes(x.resourceId));
    
    _.forEach(fhFt, (result) => {
      result.inValid = this.greaterThan(firstHalf,fullTime);
    });
   
   
    const pen = resultDetails.find(x => x.resourceId === ResourceID.Pen);
    pen.inValid = this.draw(pen);
  }

  public verifyMatch(resultDetails: ResultDetail[]) {
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Final);

    _.forEach(resultDetails, result => {
      result.inValid = this.greaterThan(result,match)
    });
  }

  public verifyMatchSum(resultDetails: ResultDetail[],leagueType: number) {
    const setSums = resultDetails.filter(x=> x.resourceId !== ResourceID.FirstHalf);
    _.forEach(setSums, result => {
      result.inValid = this.hasScore(result) 
        && this.inValidMatchSumScore(resultDetails)
    });
  }

  public verifyTraderScore(result: ResultDetail, finalResult: ResultDetail,originalResultDetails: ResultDetail[]) {
    const traderResults = originalResultDetails.filter(result => result.resultStatusId === ResultStatusId.TraderConfirm);
    result.isScoreMismatched = this.inValidResultDetailWithOriginal(result,traderResults);

    if([ResourceID.FullTime,ResourceID.Et,ResourceID.Pen]) {
      finalResult.isScoreMismatched = this.inValidResultDetailWithOriginal(finalResult,traderResults);
    }
  }

  public verifyProviderScore(result: ResultDetail, finalResult: ResultDetail,providerResultDetails: ExternalResultDetail[]) {
    result.isScoreMismatched = this.inValidResultDetailWithOriginal(result,providerResultDetails);

    if([ResourceID.FullTime,ResourceID.Et,ResourceID.Pen]) {
      finalResult.isScoreMismatched = this.inValidResultDetailWithOriginal(finalResult,providerResultDetails);
    }
  }


  public allowCalcFinalResult(firstHalf: ResultDetail,finalResult: ResultDetail) {
    if(!finalResult.checked) {
      return true;
    }
    return firstHalf.checked || firstHalf.ticketStatus === 'No Ticket' || firstHalf.settlementStatusId !== SettlementStatusId.Running;
  }

  public isInsufficientSOPLite(originalResultDetails: ResultDetail[],externalResult: ExternalResult) {
    const hasTrader = originalResultDetails.some(r => r.resultStatusId  === ResultStatusId.TraderConfirm && this.hasScore(r));
    const hasProvider = externalResult && externalResult.resultDetails.some(x => this.hasScore(x));

    return !hasTrader && !hasProvider;
  }

  public isConsistentScoreSOPLite(resultDetails: ResultDetail[],originalResultDetails: ResultDetail[],externalResult: ExternalResult) {
    const hasTrader = originalResultDetails.some(r => r.resultStatusId  === ResultStatusId.TraderConfirm && this.hasScore(r));
    const hasProvider = externalResult && externalResult.resultDetails.some(x => this.hasScore(x));
    
    let isConsistent = false;
    if(hasProvider && hasTrader) {
        isConsistent = this.isConsistentTraderAndProvider(originalResultDetails, externalResult.resultDetails);
    }

    if(!isConsistent && hasProvider) {
        isConsistent = this.isConsistentScoreProvider(resultDetails,externalResult.resultDetails);
    }
    
    
    if(!isConsistent && hasTrader) {
        isConsistent = this.isConsistentScoreTraderConfirm(originalResultDetails,resultDetails);
    }

    return isConsistent;
  }
}
