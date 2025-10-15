import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import { Resources, PlayerBetTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop/external-result-detail.model';

@Injectable()
export class MixAutoFillService {
  
  autoFillMixReboundsAssists(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (Resources.mixReboundsAssists.includes(changedResultDetail.betType)) {
      const reboundsAssistsResult = this.findReboundsAssistsResult(resultDetails);
      
      if (reboundsAssistsResult) {
        this.calculateReboundsAssistsValue(resultDetails, reboundsAssistsResult);
      }
    }
  }

  private findReboundsAssistsResult(resultDetails: ResultDetail[]) {
    return resultDetails.find(result => _.isEqual(result.betType, PlayerBetTypes.reboundsAssists));
  }

  private calculateReboundsAssistsValue(resultDetails: ResultDetail[], reboundsAssistsResult: ResultDetail) {
    const assistsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.assists);
    const reboundsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.rebounds);

    if (assistsResult || reboundsResult) {
      this.updateReboundsAssistsResult(reboundsAssistsResult, reboundsResult.homeValue, assistsResult.homeValue);
      this.updateExternalScores(reboundsAssistsResult, reboundsResult, assistsResult);
    }
  }

  private findResultByBetType(resultDetails: ResultDetail[], betType: string) {
    return resultDetails.find(result => _.isEqual(result.betType, betType));
  }

  private updateReboundsAssistsResult(reboundsAssistsResult: ResultDetail, reboundsValue: string, assistsValue: string) {
   if(!_.isEmpty(reboundsValue) && !_.isEmpty(assistsValue)) {
     const totalValue = parseInt(reboundsValue) + parseInt(assistsValue);
     reboundsAssistsResult.homeValue = totalValue.toString();
     reboundsAssistsResult.checked = true;
   }
  }

  private updateExternalScores(reboundsAssistsResult: ResultDetail, reboundsResult: ResultDetail, assistsResult: ResultDetail) {
    reboundsAssistsResult.externalScores.forEach((externalScore, index) => {
      const reboundsExternalScore = reboundsResult.externalScores[index];
      const assistsExternalScore = assistsResult.externalScores[index];

      if (this.hasValidHomeValue(reboundsExternalScore) && this.hasValidHomeValue(assistsExternalScore)) {
        const reboundsValue = parseInt(reboundsExternalScore.homeValue);
        const assistsValue = parseInt(assistsExternalScore.homeValue);
        externalScore.homeValue = (reboundsValue + assistsValue).toString();
      }
    });
  }

  private hasValidHomeValue(externalScore: ExternalResultDetail) {
    return externalScore && !_.isEmpty(externalScore.homeValue);
  }
}