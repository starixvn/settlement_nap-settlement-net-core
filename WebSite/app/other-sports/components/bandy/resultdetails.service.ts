import { Inject, Injectable } from "@angular/core";
import { MatchDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { LeagueType, ResourceID, ResourceIDs } from "./constant";
import * as _ from "lodash";

@Injectable()
export class ResultDetailsService {
  public generateFullResultDetails(
    resultDetails: ResultDetail[],
    sportType: number
  ): ResultDetail[] {
    const resourcesTemp = this.getTempResourceIDs(sportType);

    return resourcesTemp.map((resourceId) => {
      const result = resultDetails.find((x) => resourceId === x.resourceId);
      if (result) {
        return result;
      }
      const newResult = new ResultDetail();
      newResult.resourceId = resourceId;
      return newResult;
    });
  }

  public generateByMenber(resultDetails: ResultDetail[], isLeader: boolean) {
    return resultDetails.map((x) =>
      isLeader ? x : { ...x, homeValue: "", awayValue: "" }
    );
  }

  public calcMatchResultDetails(resultDetails: ResultDetail[], leagueType: number, matchResult: ResultDetail) {
    const resourceIds = leagueType === LeagueType.OtPenalty ? [ResourceID.FullTime, ResourceID.Et, ResourceID.Pen] : [ResourceID.FullTime]
    
    const gameResults = resultDetails.filter((r) => resourceIds.includes(r.resourceId)
      && (!_.isEmpty(r.homeValue) && !_.isEmpty(r.awayValue)));

    if(gameResults.length) {
      const homeValue = _.sumBy(gameResults, (x) => Number(x.homeValue));
      const awayValue = _.sumBy(gameResults, (x) => Number(x.awayValue));
  
      matchResult.homeValue = homeValue.toString();
      matchResult.awayValue = awayValue.toString();
    } else {
      matchResult.homeValue = '';
      matchResult.awayValue = '';
    }
  }

  public disabledInputResult(matchDetail: MatchDetail, resultDetails: ResultDetail[]) {
    const  leagueType  = matchDetail.leagueType;
   
    const matchResult = resultDetails.find(x => x.resourceId === ResourceID.Match);
    matchResult.disabled = true;

    const fullTime = resultDetails.find(x => x.resourceId === ResourceID.FullTime);
    const et = resultDetails.find(x => x.resourceId === ResourceID.Et);
    const pen = resultDetails.find(x => x.resourceId === ResourceID.Pen);
    
    if ([LeagueType.General, LeagueType.Regular].includes(leagueType)) {
      et.disabled = true;
      pen.disabled = true;
      return;
    }

    if([LeagueType.OtPenalty].includes(leagueType)) {
      if (this.isEmptyHomeAwayValue(fullTime)) {
        et.disabled = true;
        pen.disabled = true;
        return;
      }

      if (!this.isEmptyHomeAwayValue(fullTime) && !_.isEqual(fullTime.homeValue, fullTime.awayValue)) {
        et.disabled = true;
        pen.disabled = true;
      }

      if(!this.isEmptyHomeAwayValue(fullTime) && _.isEqual(fullTime.homeValue, fullTime.awayValue)) {
        et.disabled = false;
        pen.disabled = true;
      }

      if(!this.isEmptyHomeAwayValue(fullTime) && _.isEqual(et.homeValue, et.awayValue)) {
        et.disabled = false;
        pen.disabled = false;
      }
    }
  }


  public resetHomeAwayValue(resultDetails: ResultDetail[]) {
    _.forEach(resultDetails, result => {
      if(result.disabled && result.resourceId !== ResourceID.Match) {
        result.homeValue = '';
        result.awayValue = ''
      }
    })
  } 

  private isEmptyHomeAwayValue(result: ResultDetail) {
    return result && (_.isEmpty(result.homeValue) || _.isEmpty(result.awayValue));
  }

  private getTempResourceIDs(sportType: number) {
    return ResourceIDs;
  }
}
