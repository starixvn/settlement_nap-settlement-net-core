import { VerificationBaseService } from '../../core/services/verification-base.service';
import { MixMultiStatsService } from '../services/mix-multi-stats.service';
import { MixDoubleDoubleService } from '../services/mix-double-double.service';

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
