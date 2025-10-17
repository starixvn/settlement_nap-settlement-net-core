import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { PlayerBetTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop/external-result-detail.model';
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { SettlementStatusId } from '../../shared/constants';
@Injectable()
export class MixDoubleDoubleService {
  readonly targetBetTypes = [PlayerBetTypes.points, PlayerBetTypes.assists, PlayerBetTypes.rebounds, PlayerBetTypes.steals, PlayerBetTypes.blocks];
  readonly yesValue = 'Y';
  readonly noValue = 'N';
  readonly noneValue = 'None';
  readonly #verificationBaseService = inject(VerificationBaseService);

  autoFillMixDoubleDouble(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
     if (!this.targetBetTypes.includes(changedResultDetail.betType)) {
      return;
    }

    const doubleDoubleResult = this.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.doubleDouble);
    if (doubleDoubleResult) {
      this.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);
    }
  }

  private findMixResultByBetType(resultDetails: ResultDetail[], resourceId: string, betType: string) {
    return resultDetails.find(result => {
      if (!_.isEqual(result.betType, betType)) {
        return false;
      }

      if (!_.isEqual(result.settlementStatusId, SettlementStatusId.Running)) {
        return false;
      }

      if (!result.relatedCalResources || _.isEmpty(result.relatedCalResources)) {
        return false;
      }

      const relatedResourceIds = result.relatedCalResources.split(',').map(id => id.trim());
      return relatedResourceIds.includes(resourceId);
    });
  }

  private calculateDoubleDoubleValue(resultDetails: ResultDetail[], doubleDoubleResult: ResultDetail) {
    doubleDoubleResult.homeValue = this.calculateValue(resultDetails, doubleDoubleResult.relatedCalResources, this.extractHomeValue);
    
    doubleDoubleResult.checked = true;
    this.updateExternalScores(doubleDoubleResult, resultDetails);
    
    doubleDoubleResult.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(doubleDoubleResult);
  }

  private updateExternalScores(targetResult: ResultDetail, resultDetails: ResultDetail[]) {
    targetResult.externalScores.forEach((externalScore, index) => {
      if (index <= 3 && this.areAllExternalScoresEmpty(resultDetails, targetResult.relatedCalResources, index)) {
        externalScore.homeValue = '';
      } else {
        externalScore.homeValue = this.calculateValue(resultDetails, targetResult.relatedCalResources, (result) => 
          this.extractExternalValue(result, index)
        );
      }
    });
  }

  private calculateValue(resultDetails: ResultDetail[], relatedCalResources: string, valueExtractor: (result: ResultDetail) => number | null) {
    const highValueCount = this.countValidResults(resultDetails, relatedCalResources, (result) => {
      const value = valueExtractor(result);
      return value !== null && value > 9;
    });
    
    const lowValueCount = this.countValidResults(resultDetails, relatedCalResources, (result) => {
      const value = valueExtractor(result);
      return value !== null && value < 10;
    });
    
    if (highValueCount >= 2) {
      return this.yesValue;
    } else if (lowValueCount >= 4) {
      return this.noValue;
    } else {
      return this.noneValue;
    }
  }

  private countValidResults(resultDetails: ResultDetail[], relatedCalResources: string, validator: (result: ResultDetail) => boolean): number {
    let validCount = 0;
    const resourceIds = relatedCalResources.split(',').map(id => id.trim());
    
    for (const resourceId of resourceIds) {
      const result = resultDetails.find(r => _.isEqual(r.resourceId, resourceId));
      if (validator(result)) {
        validCount++;
      }
    }
    
    return validCount;
  }

  private extractHomeValue(result: ResultDetail) {
    if (!result || _.isEmpty(result.homeValue)) {
      return null;
    }

    return parseInt(result.homeValue);
  }

  private extractExternalValue(result: ResultDetail, index: number) {
    if (!result || !result.externalScores[index] || !this.hasValidHomeValue(result.externalScores[index])) {
      return null;
    }

    return parseInt(result.externalScores[index].homeValue);
  }

  private areAllExternalScoresEmpty(resultDetails: ResultDetail[], relatedCalResources: string, index: number): boolean {
    const resourceIds = relatedCalResources.split(',').map(id => id.trim());
    
    for (const resourceId of resourceIds) {
      const result = resultDetails.find(r => _.isEqual(r.resourceId, resourceId));
      if (result && result.externalScores[index] && !_.isEmpty(result.externalScores[index].homeValue)) {
        return false;
      }
    }
    
    return true;
  }

  private hasValidHomeValue(externalScore: ExternalResultDetail): boolean {
    return externalScore && !_.isEmpty(externalScore.homeValue);
  }
}