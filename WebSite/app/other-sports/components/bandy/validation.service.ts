import { Injectable } from "@angular/core";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { ExternalResultDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";

import * as _ from "lodash";
import { LeagueType, ResourceID } from "./constant";
import { ResultByTeamNamePipe } from "../../../shared/pipes/result-by-team-name.pipe";
import { GeneralResultDetail } from "../../../shared/models";

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
    const matchResult = resultDetails.find((x) => x.resourceId === ResourceID.Match);

    return this.greaterThan(firstHalf,matchResult);
  }

  public inValidFullTimeMatch(resultDetails: ResultDetail[])  {
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Match);
    const fullTime = resultDetails.find((x) => x.resourceId === ResourceID.FullTime);

    return this.greaterThan(fullTime,match);
  }

  public inValidETMatch(resultDetails: ResultDetail[]) {
    const et = resultDetails.find((x) => x.resourceId === ResourceID.Et);
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Match);

    return this.greaterThan(et,match);
  }

  public inValidPenMatch(resultDetails: ResultDetail[]) {
    const pen = resultDetails.find((x) => x.resourceId === ResourceID.Pen);
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Match);

    return this.greaterThan(pen,match);
  }

  public inValidPenDraw(resultDetails: ResultDetail[]) {
    const pen = resultDetails.find((x) => x.resourceId === ResourceID.Pen);
    return (this.hasScore(pen) && Number(pen.homeValue) === Number(pen.awayValue));
  }
  
  public inValidMatchSumScore(resultDetails: ResultDetail[], leagueType: number) {
    const match = resultDetails.find((x) => x.resourceId === ResourceID.Match);
    
    if (!this.hasScore(match)) {
      return false;
    }
    
    const resourceIds = leagueType === LeagueType.OtPenalty ? [ResourceID.FullTime, ResourceID.Et, ResourceID.Pen] : [ResourceID.FullTime];
    
    const gameResults = resultDetails.filter((r) => resourceIds.includes(r.resourceId) && this.hasScore(r));
    
    const homeValue = _.sumBy(gameResults, (x) => Number(x.homeValue));
    const awayValue = _.sumBy(gameResults, (x) => Number(x.awayValue));
    
    return homeValue !== Number(match.homeValue) || awayValue !== Number(match.awayValue);
  }



  public inValidResult(resultDetails: ResultDetail[], leagueType: number) {
    return  this.inValidFirstHalfFullTime(resultDetails) 
      ||  this.inValidFirstHalfMatch(resultDetails)
      || this.inValidFullTimeMatch(resultDetails)
      || this.inValidETMatch(resultDetails) 
      || this.inValidPenMatch(resultDetails)
      || this.inValidPenDraw(resultDetails) 
      || this.inValidMatchSumScore(resultDetails,leagueType);
  }

  public inValidResultDetailWithOriginal(result: ResultDetail,originalResultDetails: GeneralResultDetail[]) {
    const originalResult = originalResultDetails.find(x => x.resourceId === result.resourceId);
    
    return this.hasScore(originalResult) 
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
}
