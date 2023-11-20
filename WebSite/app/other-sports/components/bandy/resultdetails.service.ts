import { Inject, Injectable } from "@angular/core";
import { ExternalResult, ExternalResultDetail, MatchDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { LeagueType, ResourceID, ResourceIDs } from "./constant";
import * as _ from "lodash";
import { ResultSettingModel } from "../../../shared/models/result-setting.model";
import { ResultStatusId, SettlementStatusId } from "../../../shared/constants";

@Injectable()
export class ResultDetailsService {
  
  public generateFullResultDetails(resultDetails: ResultDetail[]): ResultDetail[] {
    return ResourceIDs.map((resourceId) => {
      const result = resultDetails.find(
        (x) => resourceId === x.resourceId
      );
      if (result) {
        return { ...result, className: "" };
      }
      const newResult = new ResultDetail();
      newResult.resourceId = resourceId;
      newResult.homeValue = "";
      newResult.awayValue = "";
      newResult.className = "";
      newResult.resultSettingData = new ResultSettingModel();
      newResult.resultSettingData.isConfirmedRefund = false;

      return newResult;
    });
  }

  public generateFullExternalResultDetails(externalResult : ExternalResult) {
    const resultDetails = externalResult ? externalResult.resultDetails : [];
    return ResourceIDs.map(resourceId => {
      const external = resultDetails.find(providerResult => providerResult.resourceId === resourceId);
      console.log('external',external)
      return  !external ? new ExternalResultDetail(externalResult.sourceId,resourceId,externalResult.sourceName) : external;
    })
  }

  public hidenScoreResultDetails(resultDetails: ResultDetail[],isLeader: boolean) {
    resultDetails.forEach((map) => {
      const showScore = (isLeader || map.settlementStatusId === SettlementStatusId.Calculated)
          && map.settlementStatusId !== SettlementStatusId.Refund;
      map.homeValue = showScore ? map.homeValue : "";
      map.awayValue = showScore ? map.awayValue : "";
  });
  }

  public generateRefundResultDetails(resultDetails: ResultDetail[]): ResultDetail[] {
    return [ResourceID.FirstHalf,ResourceID.Match].map((resourceId) => {
      const result = resultDetails.find(
        (x) => resourceId === x.resourceId
      );
      if (result) {
        return { ...result, className: "" };
      }
      const newResult = new ResultDetail();
      newResult.resourceId = resourceId;
      newResult.homeValue = "";
      newResult.awayValue = "";
      newResult.className = "";
      newResult.resultSettingData = new ResultSettingModel();
      newResult.resultSettingData.isConfirmedRefund = false;

      return newResult;
    });
  }

  public generateByMember(resultDetails: ResultDetail[], isLeader: boolean) {
    return resultDetails.map((x) =>
      isLeader ? x : { ...x, homeValue: "", awayValue: "" }
    );
  }

  public calcMatchResultDetails(resultDetails: ResultDetail[], leagueType: number) {
    const resourceIds = leagueType === LeagueType.OtPenalty ? [ResourceID.FullTime, ResourceID.Et, ResourceID.Pen] : [ResourceID.FullTime]
    
    const matchResult = resultDetails.find(x => x.resourceId === ResourceID.Match);

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

  public disabledInputResult(resultDetails: ResultDetail[], leagueType: number) {
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

      if(!this.isEmptyHomeAwayValue(et) && _.isEqual(et.homeValue, et.awayValue)) {
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

  public copyResultFromProvider(resultDetails,providerResultDetails) {
    _.forEach(resultDetails, (resultDetail) => {
      const providerResult = providerResultDetails.find(
        (p) => resultDetail.resourceId === p.resourceId
      );
      if (providerResult) {
        resultDetail.homeValue = providerResult.homeValue;
        resultDetail.awayValue = providerResult.awayValue;
      }
    });
  }

  private isEmptyHomeAwayValue(result: ResultDetail) {
    return result && (_.isEmpty(result.homeValue) || _.isEmpty(result.awayValue));
  }

  private getTempResourceIDs(sportType: number) {
    return ResourceIDs;
  }
}
