import { Injectable, inject } from '@angular/core';
import * as _ from 'lodash';
import { PlayerBetTypes } from '../constants';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop/external-result-detail.model';
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { MixCoreService } from './mix-core.service';
@Injectable()
export class MixDoubleDoubleService {
  readonly targetBetTypes = [PlayerBetTypes.points, PlayerBetTypes.assists, PlayerBetTypes.rebounds, PlayerBetTypes.steals, PlayerBetTypes.blocks];
  readonly yesValue = 'Y';
  readonly noValue = 'N';
  readonly #verificationBaseService = inject(VerificationBaseService);
  readonly #mixCoreService = inject(MixCoreService);

  autoFillMixDoubleDouble(resultDetails: ResultDetail[], changedResultDetail: ResultDetail) {
     if (!this.targetBetTypes.includes(changedResultDetail.betType)) {
      return;
    }

    const doubleDoubleResult = this.#mixCoreService.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.doubleDouble);
    if (doubleDoubleResult) {
      this.calculateDoubleDoubleValue(resultDetails, doubleDoubleResult);
    }

    const tripleDoubleResult = this.#mixCoreService.findMixResultByBetType(resultDetails, changedResultDetail.resourceId, PlayerBetTypes.tripleDouble);
    if (tripleDoubleResult) {
      this.calculateTripleDoubleValue(resultDetails, tripleDoubleResult);
    }
  }


  private calculateDoubleDoubleValue(resultDetails: ResultDetail[], doubleDoubleResult: ResultDetail) {
    doubleDoubleResult.homeValue = this.calculateValue(resultDetails, doubleDoubleResult.relatedCalResources, this.extractHomeValue);
    
    doubleDoubleResult.checked = true;
    this.updateExternalScores(doubleDoubleResult, resultDetails, 'double');
    
    doubleDoubleResult.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(doubleDoubleResult);
  }

  private calculateTripleDoubleValue(resultDetails: ResultDetail[], tripleDoubleResult: ResultDetail) {
    tripleDoubleResult.homeValue = this.calculateTripleValue(resultDetails, tripleDoubleResult.relatedCalResources, this.extractHomeValue);
    
    tripleDoubleResult.checked = true;
    this.updateExternalScores(tripleDoubleResult, resultDetails, 'triple');
    
    tripleDoubleResult.isScoreMismatched = this.#verificationBaseService.isEarlyMismatchedWarning(tripleDoubleResult);
  }

  private updateExternalScores(targetResult: ResultDetail, resultDetails: ResultDetail[], type: 'double' | 'triple') {
    targetResult.externalScores.forEach((externalScore, index) => {
      if (index <= 3 && this.areAllExternalScoresEmpty(resultDetails, targetResult.relatedCalResources, index)) {
        externalScore.homeValue = '';
      } else {
        if (type === 'double') {
          externalScore.homeValue = this.calculateValue(resultDetails, targetResult.relatedCalResources, (result) => 
            this.extractExternalValue(result, index)
          );
        } else {
          externalScore.homeValue = this.calculateTripleValue(resultDetails, targetResult.relatedCalResources, (result) => 
            this.extractExternalValue(result, index)
          );
        }
      }
    });
  }

  private calculateValue(resultDetails: ResultDetail[], relatedCalResources: string, valueExtractor: (result: ResultDetail) => number | null) {
    return this.calculateValueWithThresholds(resultDetails, relatedCalResources, valueExtractor, 2, 4);
  }

  private calculateTripleValue(resultDetails: ResultDetail[], relatedCalResources: string, valueExtractor: (result: ResultDetail) => number | null) {
    return this.calculateValueWithThresholds(resultDetails, relatedCalResources, valueExtractor, 3, 3);
  }

  private calculateValueWithThresholds(resultDetails: ResultDetail[], relatedCalResources: string, valueExtractor: (result: ResultDetail) => number | null, highThreshold: number, lowThreshold: number) {
    const highValueCount = this.countValidResults(resultDetails, relatedCalResources, (result) => {
      const value = valueExtractor(result);
      return value !== null && value > 9;
    });
    
    const lowValueCount = this.countValidResults(resultDetails, relatedCalResources, (result) => {
      const value = valueExtractor(result);
      return value !== null && value < 10;
    });
    
    if (highValueCount >= highThreshold) {
      return this.yesValue;
    } else if (lowValueCount >= lowThreshold) {
      return this.noValue;
    } else {
      return this.#mixCoreService.noneValue;
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
    if (!result || !result.externalScores[index] || !this.#mixCoreService.hasValidHomeValue(result.externalScores[index])) {
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
}