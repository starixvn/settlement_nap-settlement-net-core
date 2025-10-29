import { Injectable } from "@angular/core";
import * as _ from 'lodash';
import { ExternalResultDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { SettlementStatusId } from '../../shared/constants';

@Injectable()
export class MixCoreService {
  readonly noneValue = 'None';

  filterMixResultByBetType(resultDetails: ResultDetail[], resourceId: string, betType: string) {
    return resultDetails.filter(result => {
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
  
  findMixResultByBetType(resultDetails: ResultDetail[], resourceId: string, betType: string): ResultDetail | undefined {
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

  findResultsByBetTypes(resultDetails: ResultDetail[], relatedCalResources: string): ResultDetail[] {
    const relatedResourceIds = relatedCalResources.split(',').map(id => id.trim());
    
    return resultDetails.filter(result => {
      return relatedResourceIds.includes(result.resourceId);
    });
  }

  findResultsByBetTypesWithMapping(resultDetails: ResultDetail[], relatedCalResources: string, betTypes: string[]): { [key: string]: ResultDetail } {
    const relatedResourceIds = relatedCalResources.split(',').map(id => id.trim());
    const results: { [key: string]: ResultDetail } = {};
    
    for (const resourceId of relatedResourceIds) {
      const result = resultDetails.find(r => _.isEqual(r.resourceId, resourceId));
      if (result) {
        for (const betType of betTypes) {
          if (_.isEqual(result.betType, betType)) {
            results[betType] = result;
            break;
          }
        }
      }
    }
    
    return results;
  }

  hasAnyRefundedResult(results: ResultDetail[]): boolean {
    return results.some(result => this.isRefundedStatus(result.settlementStatusId));
  }

  isRefundedStatus(settlementStatusId: number): boolean {
    return settlementStatusId === SettlementStatusId.Refund ||
           settlementStatusId === SettlementStatusId.RefundHalfTime ||
           settlementStatusId === SettlementStatusId.RefundFullTime ||
           settlementStatusId === SettlementStatusId.RefundSettleDetermined;
  }

  hasNonRunningStatus(results: ResultDetail[]): boolean {
    return results.some(result => result.settlementStatusId !== SettlementStatusId.Running);
  }

  hasInvalidValues(results: ResultDetail[]): boolean {
    return results.some(result => {
      const value = result.homeValue;
      return !value || _.isEmpty(value);
    });
  }

  hasValidHomeValue(externalScore: ExternalResultDetail): boolean {
    return externalScore && !_.isEmpty(externalScore.homeValue);
  }
}