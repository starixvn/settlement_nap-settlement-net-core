import { VerificationBaseService } from '../../core/services/verification-base.service';
import { MixMultiStatsService } from '../services/mix-multi-stats.service';
import { MixDoubleDoubleService } from '../services/mix-double-double.service';
import { MixHeadHeadService } from '../services/mix-head-head.service';
import { MixCoreService } from '../services/mix-core.service';

export const createMockVerificationService = () => {
  return {
    isEarlyMismatchedWarning: jest.fn()
  };
};

export const createMockMixMultiStatsService = () => {
  return {
    autoFillMixReboundsAssists: jest.fn()
  };
};

export const createMockMixDoubleDoubleService = () => {
  return {
    autoFillMixDoubleDouble: jest.fn()
  };
};

export const createMockMixHeadHeadService = () => {
  return {
    autoFillMixHeadHead: jest.fn()
  };
};

export const createMockMixCoreService = () => {
  return {
    findMixResultByBetType: jest.fn().mockImplementation((resultDetails, resourceId, betType) => {
      return resultDetails.find(result => {
        if (result.betType !== betType) {
           return false;
        }
        if (result.settlementStatusId !== 1) {
           return false; // Running
        }
        if (!result.relatedCalResources) {
           return false;
        }

        const relatedResourceIds = result.relatedCalResources.split(',').map(id => id.trim());
        return relatedResourceIds.includes(resourceId);
      });
    }),
    findResultsByBetTypes: jest.fn().mockImplementation((resultDetails, relatedCalResources) => {
      const relatedResourceIds = relatedCalResources.split(',').map(id => id.trim());
      return resultDetails.filter(result => relatedResourceIds.includes(result.resourceId));
    }),
    findResultsByBetTypesWithMapping: jest.fn().mockImplementation((resultDetails, relatedCalResources, betTypes) => {
      const relatedResourceIds = relatedCalResources.split(',').map(id => id.trim());
      const results = {};
      for (const resourceId of relatedResourceIds) {
        const result = resultDetails.find(r => r.resourceId === resourceId);
        if (result) {
          for (const betType of betTypes) {
            if (result.betType === betType) {
              results[betType] = result;
              break;
            }
          }
        }
      }
      return results;
    }),
    hasAnyRefundedResult: jest.fn().mockReturnValue(false),
    isRefundedStatus: jest.fn().mockReturnValue(false),
    hasNonRunningStatus: jest.fn().mockReturnValue(false),
    hasInvalidValues: jest.fn().mockReturnValue(false),
    shouldSetEmptyString: jest.fn().mockReturnValue(false),
    setMixResultToNone: jest.fn(),
    setMixResultToEmpty: jest.fn(),
    hasValidHomeValue: jest.fn().mockImplementation((externalScore) => {
      if (!externalScore) {
         return null;
      }
      
      return externalScore.homeValue && externalScore.homeValue !== '';
    }),
    noneValue: 'None'
  };
};
