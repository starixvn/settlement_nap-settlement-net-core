import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { Resources, PlayerBetTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop/external-result-detail.model';
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { SettlementStatusId } from '../../shared/constants';
@Injectable()
export class MixMultiStatsService {
  readonly #verificationBaseService = inject(VerificationBaseService);

  autoFillMixReboundsAssists(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    this.handleReboundsAssistsMix(resultDetails, changedResultDetail);
    this.handleReboundsPointsMix(resultDetails, changedResultDetail);
    this.handleReboundsAssistsPointsMix(resultDetails, changedResultDetail);
    this.handleStealsBlocksMix(resultDetails, changedResultDetail);
  }

  private handleReboundsAssistsMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixReboundsAssists.includes(changedResultDetail.betType)) {
      return;
    }

    const reboundsAssistsResult =this.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.reboundsAssists);
    if (reboundsAssistsResult) {
      this.calculateReboundsAssistsValue(resultDetails, reboundsAssistsResult);
    }
  }

  private handleReboundsPointsMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixReboundsPoints.includes(changedResultDetail.betType)) {
      return;
    }

    const reboundsPointsResult = this.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.reboundsPoints);
    if (reboundsPointsResult) {
      this.calculateReboundsPointsValue(resultDetails, reboundsPointsResult);
    }
  }

  private handleReboundsAssistsPointsMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixReboundsAssistsPoints.includes(changedResultDetail.betType)) {
      return;
    }

    const reboundsAssistsPointsResult = this.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.reboundsAssistsPoints);
    if (reboundsAssistsPointsResult) {
      this.calculateReboundsAssistsPointsValue(resultDetails, reboundsAssistsPointsResult);
    }
  }

  private handleStealsBlocksMix(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
    if (!Resources.mixStealsBlocks.includes(changedResultDetail.betType)) {
      return;
    }

    const stealsBlocksResult = this.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.stealsBlocks);
    if (stealsBlocksResult) {
      this.calculateStealsBlocksValue(resultDetails, stealsBlocksResult);
    }
  }

  private findMixResultByBetType(resultDetails: ResultDetail[], resourceId: string, betType: string) {
    const modifiedResourceId = betType + resourceId.substring(3);
    return resultDetails.find(result => _.isEqual(result.resourceId, modifiedResourceId) && _.isEqual(result.settlementStatusId, SettlementStatusId.Running));
  }

  private calculateReboundsAssistsValue(resultDetails: ResultDetail[], reboundsAssistsResult: ResultDetail) {
    const assistsResult = this.findResultByBetType(resultDetails, reboundsAssistsResult.resourceId, PlayerBetTypes.assists);
    const reboundsResult = this.findResultByBetType(resultDetails, reboundsAssistsResult.resourceId, PlayerBetTypes.rebounds);

    if (assistsResult || reboundsResult) {
      this.updateMixResult(reboundsAssistsResult, reboundsResult, assistsResult);
    }
  }

  private calculateReboundsPointsValue(resultDetails: ResultDetail[], reboundsPointsResult: ResultDetail) {
    const pointsResult = this.findResultByBetType(resultDetails, reboundsPointsResult.resourceId, PlayerBetTypes.points);
    const reboundsResult = this.findResultByBetType(resultDetails, reboundsPointsResult.resourceId, PlayerBetTypes.rebounds);

    if (pointsResult || reboundsResult) {
      this.updateMixResult(reboundsPointsResult, reboundsResult, pointsResult);
    }
  }

  private calculateReboundsAssistsPointsValue(resultDetails: ResultDetail[], reboundsAssistsPointsResult: ResultDetail) {
    const pointsResult = this.findResultByBetType(resultDetails, reboundsAssistsPointsResult.resourceId, PlayerBetTypes.points);
    const assistsResult = this.findResultByBetType(resultDetails, reboundsAssistsPointsResult.resourceId, PlayerBetTypes.assists);
    const reboundsResult = this.findResultByBetType(resultDetails, reboundsAssistsPointsResult.resourceId, PlayerBetTypes.rebounds);

    if (pointsResult || assistsResult || reboundsResult) {
      this.updateTripleMixResult(reboundsAssistsPointsResult, reboundsResult, assistsResult, pointsResult);
    }
  }

  private calculateStealsBlocksValue(resultDetails: ResultDetail[], stealsBlocksResult: ResultDetail) {
    const stealsResult = this.findResultByBetType(resultDetails, stealsBlocksResult.resourceId, PlayerBetTypes.steals);
    const blocksResult = this.findResultByBetType(resultDetails, stealsBlocksResult.resourceId, PlayerBetTypes.blocks);

    if (stealsResult || blocksResult) {
      this.updateMixResult(stealsBlocksResult, stealsResult, blocksResult);
    }
  }

  private findResultByBetType(resultDetails: ResultDetail[], resourceId: string, betType: string) {
    const modifiedResourceId = betType + resourceId.substring(3);
  
    return resultDetails.find(result => _.isEqual(result.resourceId, modifiedResourceId));
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