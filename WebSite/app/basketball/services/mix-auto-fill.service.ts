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

  private findReboundsAssistsResult(resultDetails: ResultDetail[]): ResultDetail {
    return resultDetails.find(result => _.isEqual(result.betType, PlayerBetTypes.reboundsAssists));
  }

  private calculateReboundsAssistsValue(resultDetails: ResultDetail[], reboundsAssistsResult: ResultDetail) {
    const assistsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.assists);
    const reboundsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.rebounds);

    if (assistsResult || reboundsResult) {
      const reboundsValue = this.getReboundsValue(reboundsResult);
      const assistsValue = this.getAssistsValue(assistsResult);
      
      this.updateReboundsAssistsResult(reboundsAssistsResult, reboundsValue, assistsValue);
      this.updateExternalScores(reboundsAssistsResult, reboundsResult, assistsResult);
    }
  }

  private findResultByBetType(resultDetails: ResultDetail[], betType: string): ResultDetail {
    return resultDetails.find(result => _.isEqual(result.betType, betType));
  }

  private getReboundsValue(reboundsResult: ResultDetail): number {
    if (!reboundsResult || !reboundsResult.externalScores || reboundsResult.externalScores.length === 0) {
      return 0;
    }

    const reboundsExternalScore = reboundsResult.externalScores.find(score => 
      _.isEqual(score.resourceId, reboundsResult.resourceId)
    );

    if (reboundsExternalScore && !_.isEmpty(reboundsExternalScore.homeValue)) {
      return parseInt(reboundsExternalScore.homeValue) || 0;
    }

    return 0;
  }

  private getAssistsValue(assistsResult: ResultDetail): number {
    if (!assistsResult || !assistsResult.externalScores || assistsResult.externalScores.length === 0) {
      return 0;
    }

    const assistsExternalScore = assistsResult.externalScores.find(score => 
      _.isEqual(score.resourceId, assistsResult.resourceId)
    );

    if (assistsExternalScore && !_.isEmpty(assistsExternalScore.homeValue)) {
      return parseInt(assistsExternalScore.homeValue) || 0;
    }

    return 0;
  }

  private updateReboundsAssistsResult(reboundsAssistsResult: ResultDetail, reboundsValue: number, assistsValue: number): void {
    const totalValue = reboundsValue + assistsValue;
    reboundsAssistsResult.homeValue = totalValue.toString();
    reboundsAssistsResult.checked = true;
  }

  private updateExternalScores(reboundsAssistsResult: ResultDetail, reboundsResult: ResultDetail, assistsResult: ResultDetail): void {
    if (!reboundsAssistsResult.externalScores || reboundsAssistsResult.externalScores.length === 0) {
      return;
    }

    reboundsAssistsResult.externalScores.forEach((externalScore, index) => {
      const reboundsExternalScore = this.getExternalScoreByIndex(reboundsResult, index);
      const assistsExternalScore = this.getExternalScoreByIndex(assistsResult, index);

      if (this.hasValidHomeValue(reboundsExternalScore) && this.hasValidHomeValue(assistsExternalScore)) {
        const reboundsValue = parseInt(reboundsExternalScore.homeValue);
        const assistsValue = parseInt(assistsExternalScore.homeValue);
        externalScore.homeValue = (reboundsValue + assistsValue).toString();
      }
    });
  }

  private getExternalScoreByIndex(result: ResultDetail, index: number) {
    if (!result || !result.externalScores || !result.externalScores[index]) {
      return null;
    }
    return result.externalScores[index];
  }

  private hasValidHomeValue(externalScore: ExternalResultDetail): boolean {
    return externalScore && !_.isEmpty(externalScore.homeValue);
  }
}