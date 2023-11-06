import { Injectable } from "@angular/core";
import { VerificationBaseService } from "../../../core/services/verification-base.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";

import * as _ from "lodash";
import { ResourceID } from "./constant";
import { ResultByTeamNamePipe } from "../../../shared/pipes/result-by-team-name.pipe";

@Injectable()
export class ValidationService extends VerificationBaseService {
  constructor(
    protected resultByTeamNamePipe: ResultByTeamNamePipe) {
        super(resultByTeamNamePipe);
}


  public inValidFirstHalf(resultDetails: ResultDetail[]) {
    const fh = resultDetails.find((x) => x.resourceId === ResourceID.HT);
    const ft = resultDetails.find((x) => x.resourceId === ResourceID.FT);

    const matchResult = resultDetails.find(
      (x) => x.resourceId === ResourceID.MATCH
    );

    if (this.hasScore(fh) && this.hasScore(ft)) {
      return (
        Number(fh.homeValue) > Number(ft.homeValue) ||
        Number(fh.awayValue) > Number(ft.awayValue)
      );
    }

    if (this.hasScore(fh) && this.hasScore(matchResult)) {
      return (
        Number(fh.homeValue) > Number(matchResult.homeValue) ||
        Number(fh.awayValue) > Number(matchResult.awayValue)
      );
    }

    return false;
  }

  public inValidFirstHalfNEW(firstHalf:ResultDetail,resultDetails: ResultDetail[]) {
    const fullTime = resultDetails.find((x) => x.resourceId === ResourceID.FT);
    const matchResult = resultDetails.find(
      (x) => x.resourceId === ResourceID.MATCH
    );

    if (this.hasScore(firstHalf) && this.hasScore(fullTime)) {
      return (
        Number(firstHalf.homeValue) > Number(fullTime.homeValue) ||
        Number(firstHalf.awayValue) > Number(fullTime.awayValue)
      );
    }

    if (this.hasScore(firstHalf) && this.hasScore(matchResult)) {
      return (
        Number(firstHalf.homeValue) > Number(matchResult.homeValue) ||
        Number(firstHalf.awayValue) > Number(matchResult.awayValue)
      );
    }

    return false;
  }

  public inValidFullTime(fullTime: ResultDetail, resultDetails: ResultDetail[])  { // fullTime > Match
    const match = resultDetails.find((x) => x.resourceId === ResourceID.MATCH);
    if (this.hasScore(fullTime) && this.hasScore(match)) {
      return (
        Number(fullTime.homeValue) > Number(match.homeValue) ||
        Number(fullTime.awayValue) > Number(match.awayValue)
      );
    }

    return false;
  }

  public inValidET(et: ResultDetail,resultDetails: ResultDetail[]) { // ET > Match
    const match = resultDetails.find((x) => x.resourceId === ResourceID.MATCH);
    if (this.hasScore(et) && this.hasScore(match)) {
      return (
        Number(et.homeValue) > Number(match.homeValue) ||
        Number(et.awayValue) > Number(match.awayValue)
      );
    }

    return false;
  }

  public inValidPenNEW(pen: ResultDetail,resultDetails: ResultDetail[]) {
    const match = resultDetails.find((x) => x.resourceId === ResourceID.MATCH);

    if (this.hasScore(pen)) {
      return Number(pen.homeValue) === Number(pen.awayValue);
    }

    if (this.hasScore(match)) {
      return (
        Number(pen.homeValue) > Number(match.homeValue) ||
        Number(pen.awayValue) > Number(match.awayValue)
      );
    }

    return false;
  }



  public inValidPen(resultDetails: ResultDetail[]) {
    const pen = resultDetails.find((x) => x.resourceId === ResourceID.PEN);

    if (this.hasScore(pen)) {
      return Number(pen.homeValue) === Number(pen.awayValue);
    }

    return false;
  }

  public inValidMatch(resultDetails: ResultDetail[]) {
    const match = resultDetails.find((x) => x.resourceId === ResourceID.MATCH);

    if (this.hasScore(match)) {
      return false;
    }

    const ft = resultDetails.find((x) => x.resourceId === ResourceID.FT);
    const et = resultDetails.find((x) => x.resourceId === ResourceID.ET);
    const pen = resultDetails.find((x) => x.resourceId === ResourceID.PEN);

    if (this.hasScore(ft)) {
      return (
        Number(ft.homeValue) > Number(match.homeValue) ||
        Number(ft.awayValue) > Number(match.awayValue)
      );
    }

    if (this.hasScore(et)) {
      return (
        Number(et.homeValue) > Number(match.homeValue) ||
        Number(et.awayValue) > Number(match.awayValue)
      );
    }

    if (this.hasScore(pen)) {
      return (
        Number(pen.homeValue) > Number(match.homeValue) ||
        Number(pen.awayValue) > Number(match.awayValue)
      );
    }

    if (this.hasScore(ft) && this.hasScore(et) && this.hasScore(pen)) {
      const gameResults = resultDetails.filter((r) =>
        [ResourceID.FT, ResourceID.ET, ResourceID.PEN].includes(r.resourceId)
      );

      const homeValue = _.sumBy(gameResults, (x) => Number(x.homeValue));
      const awayValue = _.sumBy(gameResults, (x) => Number(x.awayValue));

      return homeValue === Number(match.homeValue) && awayValue === Number(match.awayValue);
    }

    return false;
  }

  public inValidResult(resultDetails: ResultDetail[]) {
    return this.inValidFirstHalf(resultDetails) || this.inValidPen(resultDetails) || this.inValidMatch(resultDetails);
  }

  public missScoreMatched(resultDetails: ResultDetail[]) {
    
  }
}
