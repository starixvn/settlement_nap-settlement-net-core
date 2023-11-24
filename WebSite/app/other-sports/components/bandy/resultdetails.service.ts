import { Inject, Injectable } from "@angular/core";
import { ExternalResult, ExternalResultDetail, MatchDetail, ResultDetail } from "../../../shared/models/sportsbook-sop";
import { LeagueType, ResourceID, ResourceIDs } from "./constant";
import * as _ from "lodash";
import { ResultSettingModel } from "../../../shared/models/result-setting.model";
import {ResultStatusId, SettlementStatusId } from "../../../shared/constants";

@Injectable()
export class ResultDetailsService {
  
  public generateFullResultDetails(resultDetails: ResultDetail[]): ResultDetail[] {
    const tempResults = ResourceIDs.map((resourceId) => {
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

    const finalResult = resultDetails.find(x => x.resourceId === ResourceID.Final && !this.isEmptyHomeAwayValue(x));
    if(finalResult) {
      return tempResults;
    }

    return this.calcMatchResultDetails(tempResults);
  }

  public generateFullExternalResultDetails(externalResult : ExternalResult) {
    const resultDetails = externalResult ? externalResult.resultDetails : [];
    return ResourceIDs.map(resourceId => {
      const external = resultDetails.find(providerResult => providerResult.resourceId === resourceId);
      return  !external ? new ExternalResultDetail(externalResult?.sourceId,resourceId,externalResult?.sourceName) : external;
    })
  }

  public hidenScoreResultDetails(resultDetails: ResultDetail[],isLeader: boolean) {
    resultDetails.forEach((map) => {
      const showScore = (isLeader 
        && ([ResultStatusId.AutoCompleted,ResultStatusId.ManualCompleted,ResultStatusId.TraderConfirm].includes(map.resultStatusId)
        ||  map.settlementStatusId === SettlementStatusId.Calculated))
            && map.settlementStatusId !== SettlementStatusId.Refund;
      
      const showScoreMenber = !isLeader && ([ResultStatusId.AutoCompleted,ResultStatusId.ManualCompleted].includes(map.resultStatusId)
      ||  map.settlementStatusId === SettlementStatusId.Calculated) && map.settlementStatusId !== SettlementStatusId.Refund;

      map.homeValue = (showScore || showScoreMenber) ? map.homeValue : "";
      map.awayValue =  (showScore || showScoreMenber)  ? map.awayValue : "";
  });
  }

  public generateRefundResultDetails(resultDetails: ResultDetail[]): ResultDetail[] {
    return [ResourceID.FirstHalf,ResourceID.Final].map((resourceId) => {
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

  public calcMatchResultDetails(resultDetails: ResultDetail[]) {
    const resourceIds = [ResourceID.FullTime, ResourceID.Et, ResourceID.Pen];

    const gameResults = resultDetails.filter((r) => resourceIds.includes(r.resourceId) && (!_.isEmpty(r.homeValue) && !_.isEmpty(r.awayValue)));

    const homeValue = gameResults.length ? `${_.sumBy(gameResults, (x) => Number(x.homeValue))}` : '';
    const awayValue = gameResults.length ? `${_.sumBy(gameResults, (x) => Number(x.awayValue))}` : '';

    return resultDetails.map(x => x.resourceId !== ResourceID.Final ? x : ({
      ...x,
      homeValue,
      awayValue
    }));
  }

  public disabledInputResult(resultDetails: ResultDetail[], leagueType: number) {
    const finalResult = resultDetails.find(x => x.resourceId === ResourceID.Final);
    finalResult.disabled = true;

    const fullTime = resultDetails.find(x => x.resourceId === ResourceID.FullTime);
    const et = resultDetails.find(x => x.resourceId === ResourceID.Et);
    const pen = resultDetails.find(x => x.resourceId === ResourceID.Pen);
    
    if ([LeagueType.General, LeagueType.Regular].includes(leagueType)) {
      et.disabled = true;
      pen.disabled = true;
      return;
    }

    if([LeagueType.OtPenalty].includes(leagueType)) {
      if (this.isEmptyHomeAwayValue(fullTime) || !_.isEqual(fullTime.homeValue, fullTime.awayValue)) {
        et.disabled = true;
        pen.disabled = true;
      } else {
        et.disabled = false;
        pen.disabled =  this.isEmptyHomeAwayValue(et) || !_.isEqual(et.homeValue, et.awayValue)
      }
    }
  }


  public resetHomeAwayValue(resultDetails: ResultDetail[]) {
    _.forEach(resultDetails, result => {
      if(result.disabled && result.resourceId !== ResourceID.Final) {
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

}
