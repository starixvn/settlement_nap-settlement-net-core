import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { Resources, PlayerBetTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop/external-result-detail.model';
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { SettlementStatusId } from '../../shared/constants';
@Injectable()
export class MixAutoFillService {
  readonly #verificationBaseService = inject(VerificationBaseService);

  autoFillMixReboundsAssists(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (Resources.mixReboundsAssists.includes(changedResultDetail.betType)) {
      const reboundsAssistsResult = this.findReboundsAssistsResult(resultDetails);
      
      if (reboundsAssistsResult) {
        this.calculateReboundsAssistsValue(resultDetails, reboundsAssistsResult);
      }
    }

    if (Resources.mixReboundsPoints.includes(changedResultDetail.betType)) {
      const reboundsPointsResult = this.findReboundsPointsResult(resultDetails);

      if (reboundsPointsResult) {
        this.calculateReboundsPointsValue(resultDetails, reboundsPointsResult);
      }
    }

    if(Resources.mixReboundsAssistsPoints.includes(changedResultDetail.betType)) {
      const reboundsAssistsPointsResult = this.findReboundsAssistsPointsResult(resultDetails);

      if (reboundsAssistsPointsResult) {
        this.calculateReboundsAssistsPointsValue(resultDetails, reboundsAssistsPointsResult);
      }
    }
  }

  private findReboundsAssistsResult(resultDetails: ResultDetail[]) {
    return resultDetails.find(result => _.isEqual(result.betType, PlayerBetTypes.reboundsAssists) && _.isEqual(result.settlementStatusId, SettlementStatusId.Running));
  }

  private findReboundsPointsResult(resultDetails: ResultDetail[]) {
    return resultDetails.find(result => _.isEqual(result.betType, PlayerBetTypes.reboundsPoints) && _.isEqual(result.settlementStatusId, SettlementStatusId.Running));
  }

  private findReboundsAssistsPointsResult(resultDetails: ResultDetail[]) {
    return resultDetails.find(result => _.isEqual(result.betType, PlayerBetTypes.reboundsAssistsPoints) && _.isEqual(result.settlementStatusId, SettlementStatusId.Running));
  }

  private calculateReboundsAssistsValue(resultDetails: ResultDetail[], reboundsAssistsResult: ResultDetail) {
    const assistsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.assists);
    const reboundsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.rebounds);

    if (assistsResult || reboundsResult) {
      this.updateMixResult(reboundsAssistsResult, reboundsResult, assistsResult);
    }
  }

  private calculateReboundsPointsValue(resultDetails: ResultDetail[], reboundsPointsResult: ResultDetail) {
    const pointsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.points);
    const reboundsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.rebounds);

    if (pointsResult || reboundsResult) {
      this.updateMixResult(reboundsPointsResult, reboundsResult, pointsResult);
    }
  }

  private calculateReboundsAssistsPointsValue(resultDetails: ResultDetail[], reboundsAssistsPointsResult: ResultDetail) {
    const pointsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.points);
    const assistsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.assists);
    const reboundsResult = this.findResultByBetType(resultDetails, PlayerBetTypes.rebounds);

    if (pointsResult || assistsResult || reboundsResult) {
      this.updateTripleMixResult(reboundsAssistsPointsResult, reboundsResult, assistsResult, pointsResult);
    }
  }

  private findResultByBetType(resultDetails: ResultDetail[], betType: string) {
    return resultDetails.find(result => _.isEqual(result.betType, betType));
  }

  private updateMixResult(targetResult: ResultDetail, firstResult: ResultDetail, secondResult: ResultDetail) {
    const firstValue = firstResult?.homeValue || '';
    const secondValue = secondResult?.homeValue || '';

    if (!_.isEmpty(firstValue) && !_.isEmpty(secondValue)) {
      const totalValue = parseInt(firstValue) + parseInt(secondValue);
      targetResult.homeValue = totalValue.toString();
      targetResult.checked = true;
    } else {
      targetResult.homeValue = '';
      targetResult.checked = false;
    }
    
    this.updateExternalScores(targetResult, firstResult, secondResult);
    targetResult.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(targetResult);
  }

  private updateTripleMixResult(targetResult: ResultDetail, reboundsResult: ResultDetail, assistsResult: ResultDetail, pointsResult: ResultDetail) {
    const reboundsValue = reboundsResult?.homeValue || '';
    const assistsValue = assistsResult?.homeValue || '';
    const pointsValue = pointsResult?.homeValue || '';

    if (!_.isEmpty(reboundsValue) && !_.isEmpty(assistsValue) && !_.isEmpty(pointsValue)) {
      const totalValue = parseInt(reboundsValue) + parseInt(assistsValue) + parseInt(pointsValue);
      targetResult.homeValue = totalValue.toString();
      targetResult.checked = true;
    } else {
      targetResult.homeValue = '';
      targetResult.checked = false;
    }

    this.updateTripleExternalScores(targetResult, reboundsResult, assistsResult, pointsResult);
    targetResult.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(targetResult);
  }

  private updateExternalScores(targetResult: ResultDetail, firstResult: ResultDetail, secondResult: ResultDetail) {
    targetResult.externalScores.forEach((externalScore, index) => {
      const firstExternalScore = firstResult.externalScores[index];
      const secondExternalScore = secondResult.externalScores[index];

      if (this.hasValidHomeValue(firstExternalScore) && this.hasValidHomeValue(secondExternalScore)) {
        const firstValue = parseInt(firstExternalScore.homeValue);
        const secondValue = parseInt(secondExternalScore.homeValue);
        externalScore.homeValue = (firstValue + secondValue).toString();
      }
    });
  }

  private updateTripleExternalScores(targetResult: ResultDetail, reboundsResult: ResultDetail, assistsResult: ResultDetail, pointsResult: ResultDetail) {
    targetResult.externalScores.forEach((externalScore, index) => {
      const reboundsExternalScore = reboundsResult.externalScores[index];
      const assistsExternalScore = assistsResult.externalScores[index];
      const pointsExternalScore = pointsResult.externalScores[index];

      if (this.hasValidHomeValue(reboundsExternalScore) && this.hasValidHomeValue(assistsExternalScore) && this.hasValidHomeValue(pointsExternalScore)) {
        const reboundsValue = parseInt(reboundsExternalScore.homeValue);
        const assistsValue = parseInt(assistsExternalScore.homeValue);
        const pointsValue = parseInt(pointsExternalScore.homeValue);
        externalScore.homeValue = (reboundsValue + assistsValue + pointsValue).toString();
      }
    });
  }

  private hasValidHomeValue(externalScore: ExternalResultDetail) {
    return externalScore && !_.isEmpty(externalScore.homeValue);
  }
}