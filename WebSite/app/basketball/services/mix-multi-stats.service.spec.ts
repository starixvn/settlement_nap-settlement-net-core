import { TestBed } from '@angular/core/testing';
import { MixMultiStatsService } from './mix-multi-stats.service';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop/external-result-detail.model';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { SettlementStatusId } from '../../shared/constants';
import { PlayerBetTypes } from '../constants';

describe('MixMultiStatsService', () => {
  let service: MixMultiStatsService;
  let mockVerificationBaseService: any;

  beforeEach(() => {
    const verificationBaseServiceSpy = {
      isEarlyMismatchedWarning: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        MixMultiStatsService,
        { provide: VerificationBaseService, useValue: verificationBaseServiceSpy }
      ]
    });

    service = TestBed.inject(MixMultiStatsService);
    mockVerificationBaseService = TestBed.inject(VerificationBaseService);
  });

  describe('autoFillMixReboundsAssists', () => {
    it('should call all mix handlers', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('656', 'assists');

      jest.spyOn(service as any, 'handleReboundsAssistsMix');
      jest.spyOn(service as any, 'handleReboundsPointsMix');
      jest.spyOn(service as any, 'handleReboundsAssistsPointsMix');
      jest.spyOn(service as any, 'handleStealsBlocksMix');

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect((service as any).handleReboundsAssistsMix).toHaveBeenCalledWith(resultDetails, changedResultDetail);
      expect((service as any).handleReboundsPointsMix).toHaveBeenCalledWith(resultDetails, changedResultDetail);
      expect((service as any).handleReboundsAssistsPointsMix).toHaveBeenCalledWith(resultDetails, changedResultDetail);
      expect((service as any).handleStealsBlocksMix).toHaveBeenCalledWith(resultDetails, changedResultDetail);
    });
  });

  describe('findMixResultByBetType', () => {
    it('should find result with modified resourceId and Running status', () => {
      const resultDetails: ResultDetail[] = [
        createMockResultDetail('671XX', 'reboundsAssists', SettlementStatusId.Running),
        createMockResultDetail('673XX', 'reboundsPoints', SettlementStatusId.Calculated)
      ];
      const resourceId = '653XX';
      const betType = PlayerBetTypes.reboundsAssists;

      const result = (service as any).findMixResultByBetType(resultDetails, resourceId, betType);

      expect(result).toBeDefined();
      expect(result.betType).toBe('reboundsAssists');
      expect(result.resourceId).toBe('671XX');
    });

    it('should return undefined when no matching result found', () => {
      const resultDetails: ResultDetail[] = [
        createMockResultDetail('673XX', 'reboundsPoints', SettlementStatusId.Running)
      ];
      const resourceId = '653XX';
      const betType = PlayerBetTypes.reboundsAssists;

      const result = (service as any).findMixResultByBetType(resultDetails, resourceId, betType);

      expect(result).toBeUndefined();
    });

    it('should return undefined when settlement status is not Running', () => {
      const resultDetails: ResultDetail[] = [
        createMockResultDetail('671XX', 'reboundsAssists', SettlementStatusId.Calculated)
      ];
      const resourceId = '653XX';
      const betType = PlayerBetTypes.reboundsAssists;

      const result = (service as any).findMixResultByBetType(resultDetails, resourceId, betType);

      expect(result).toBeUndefined();
    });
  });

  describe('findResultByBetType', () => {
    it('should find result with modified resourceId', () => {
      const resultDetails: ResultDetail[] = [
        createMockResultDetail('656XX', 'assists'),
        createMockResultDetail('659XX', 'rebounds')
      ];
      const resourceId = '653XX';
      const betType = PlayerBetTypes.assists;

      const result = (service as any).findResultByBetType(resultDetails, resourceId, betType);

      expect(result).toBeDefined();
      expect(result.betType).toBe('assists');
      expect(result.resourceId).toBe('656XX');
    });

    it('should return undefined when no matching result found', () => {
      const resultDetails: ResultDetail[] = [
        createMockResultDetail('659XX', 'rebounds')
      ];
      const resourceId = '653XX';
      const betType = PlayerBetTypes.assists;

      const result = (service as any).findResultByBetType(resultDetails, resourceId, betType);

      expect(result).toBeUndefined();
    });
  });

  describe('updateMixResult', () => {
    it('should update target result with sum of both values when both have valid values', () => {
      const targetResult = createMockResultDetail('671XX', 'reboundsAssists');
      const firstResult = createMockResultDetail('659XX', 'rebounds', SettlementStatusId.Running, '5');
      const secondResult = createMockResultDetail('656XX', 'assists', SettlementStatusId.Running, '3');

      mockVerificationBaseService.isEarlyMismatchedWarning.mockReturnValue(false);

      (service as any).updateMixResult(targetResult, firstResult, secondResult);

      expect(targetResult.homeValue).toBe('8');
      expect(targetResult.checked).toBe(true);
      expect(mockVerificationBaseService.isEarlyMismatchedWarning).toHaveBeenCalledWith(targetResult);
    });

    it('should clear target result when either value is empty', () => {
      const targetResult = createMockResultDetail('671XX', 'reboundsAssists');
      const firstResult = createMockResultDetail('659XX', 'rebounds', SettlementStatusId.Running, '5');
      const secondResult = createMockResultDetail('656XX', 'assists', SettlementStatusId.Running, '');

      (service as any).updateMixResult(targetResult, firstResult, secondResult);

      expect(targetResult.homeValue).toBe('');
      expect(targetResult.checked).toBe(false);
    });

    it('should clear target result when both values are empty', () => {
      const targetResult = createMockResultDetail('671XX', 'reboundsAssists');
      const firstResult = createMockResultDetail('659XX', 'rebounds', SettlementStatusId.Running, '');
      const secondResult = createMockResultDetail('656XX', 'assists', SettlementStatusId.Running, '');

      (service as any).updateMixResult(targetResult, firstResult, secondResult);

      expect(targetResult.homeValue).toBe('');
      expect(targetResult.checked).toBe(false);
    });
  });

  describe('updateTripleMixResult', () => {
    it('should update target result with sum of all three values when all have valid values', () => {
      const targetResult = createMockResultDetail('669XX', 'reboundsAssistsPoints');
      const reboundsResult = createMockResultDetail('659XX', 'rebounds', SettlementStatusId.Running, '5');
      const assistsResult = createMockResultDetail('656XX', 'assists', SettlementStatusId.Running, '3');
      const pointsResult = createMockResultDetail('653XX', 'points', SettlementStatusId.Running, '10');

      mockVerificationBaseService.isEarlyMismatchedWarning.mockReturnValue(false);

      (service as any).updateTripleMixResult(targetResult, reboundsResult, assistsResult, pointsResult);

      expect(targetResult.homeValue).toBe('18');
      expect(targetResult.checked).toBe(true);
      expect(mockVerificationBaseService.isEarlyMismatchedWarning).toHaveBeenCalledWith(targetResult);
    });

    it('should clear target result when any value is empty', () => {
      const targetResult = createMockResultDetail('669XX', 'reboundsAssistsPoints');
      const reboundsResult = createMockResultDetail('659XX', 'rebounds', SettlementStatusId.Running, '5');
      const assistsResult = createMockResultDetail('656XX', 'assists', SettlementStatusId.Running, '');
      const pointsResult = createMockResultDetail('653XX', 'points', SettlementStatusId.Running, '10');

      (service as any).updateTripleMixResult(targetResult, reboundsResult, assistsResult, pointsResult);

      expect(targetResult.homeValue).toBe('');
      expect(targetResult.checked).toBe(false);
    });
  });

  describe('updateExternalScores', () => {
    it('should update external scores with sum of both values', () => {
      const targetResult = createMockResultDetailWithExternalScores('671XX', 'reboundsAssists');
      const firstResult = createMockResultDetailWithExternalScores('659XX', 'rebounds');
      const secondResult = createMockResultDetailWithExternalScores('656XX', 'assists');

      // Set up external scores
      firstResult.externalScores[0].homeValue = '5';
      secondResult.externalScores[0].homeValue = '3';

      (service as any).updateExternalScores(targetResult, firstResult, secondResult);

      expect(targetResult.externalScores[0].homeValue).toBe('8');
    });

    it('should not update external scores when either value is invalid', () => {
      const targetResult = createMockResultDetailWithExternalScores('671XX', 'reboundsAssists');
      const firstResult = createMockResultDetailWithExternalScores('659XX', 'rebounds');
      const secondResult = createMockResultDetailWithExternalScores('656XX', 'assists');

      // Set up external scores - one invalid
      firstResult.externalScores[0].homeValue = '5';
      secondResult.externalScores[0].homeValue = '';

      (service as any).updateExternalScores(targetResult, firstResult, secondResult);

      expect(targetResult.externalScores[0].homeValue).toBe('');
    });
  });

  describe('updateTripleExternalScores', () => {
    it('should update external scores with sum of all three values', () => {
      const targetResult = createMockResultDetailWithExternalScores('669XX', 'reboundsAssistsPoints');
      const reboundsResult = createMockResultDetailWithExternalScores('659XX', 'rebounds');
      const assistsResult = createMockResultDetailWithExternalScores('656XX', 'assists');
      const pointsResult = createMockResultDetailWithExternalScores('653XX', 'points');

      // Set up external scores
      reboundsResult.externalScores[0].homeValue = '5';
      assistsResult.externalScores[0].homeValue = '3';
      pointsResult.externalScores[0].homeValue = '10';

      (service as any).updateTripleExternalScores(targetResult, reboundsResult, assistsResult, pointsResult);

      expect(targetResult.externalScores[0].homeValue).toBe('18');
    });

    it('should not update external scores when any value is invalid', () => {
      const targetResult = createMockResultDetailWithExternalScores('669XX', 'reboundsAssistsPoints');
      const reboundsResult = createMockResultDetailWithExternalScores('659XX', 'rebounds');
      const assistsResult = createMockResultDetailWithExternalScores('656XX', 'assists');
      const pointsResult = createMockResultDetailWithExternalScores('653XX', 'points');

      // Set up external scores - one invalid
      reboundsResult.externalScores[0].homeValue = '5';
      assistsResult.externalScores[0].homeValue = '';
      pointsResult.externalScores[0].homeValue = '10';

      (service as any).updateTripleExternalScores(targetResult, reboundsResult, assistsResult, pointsResult);

      expect(targetResult.externalScores[0].homeValue).toBe('');
    });
  });

  describe('hasValidHomeValue', () => {
    it('should return true for valid external score with home value', () => {
      const externalScore = { homeValue: '5' } as ExternalResultDetail;
      const result = (service as any).hasValidHomeValue(externalScore);
      expect(result).toBe(true);
    });

    it('should return false for null external score', () => {
      const result = (service as any).hasValidHomeValue(null);
      expect(result).toBeFalsy();
    });

    it('should return false for external score with empty home value', () => {
      const externalScore = { homeValue: '' } as ExternalResultDetail;
      const result = (service as any).hasValidHomeValue(externalScore);
      expect(result).toBe(false);
    });
  });

  // Helper functions
  function createMockResultDetail(
    resourceId: string, 
    betType: string, 
    settlementStatusId: number = SettlementStatusId.Running,
    homeValue: string = ''
  ): ResultDetail {
    return {
      resourceId,
      betType,
      homeValue,
      settlementStatusId,
      checked: false,
      externalScores: [],
      isScoreMismatched: false,
      ticketStatus: '',
      map: 0,
      groupBetType: 0,
      betTypeName: '',
      homeName: '',
      homeId: null,
      awayId: null,
      awayName: '',
      isResultWarning: false,
      isDurationWarning: false,
      isShow: true,
      parentShowed: false,
      disabled: false,
      originalHomeValue: '',
      originalAwayValue: '',
      className: '',
      groupId: '',
      resultName: '',
      groupName: '',
      inputType: 0,
      isSpecialBettype: 0,
      isDisplayedForMember: false,
      inputOptions: [],
      multipleResultSelect: {} as any,
      otherInfo: '',
      isResultWarningByBetType: false,
      ordNo: 0,
      intervalNo: 0,
      isNotTaken: false,
      isSettleDetermined: false,
      isSettleDeterminedOriginal: false,
      isInvalidSelectedProceed: false,
      isNotExistedValue: false,
      resultStatusState: '',
      oddFlex: [],
      confirmedSdtHomeValue: '',
      confirmedSdtAwayValue: '',
      isRelated: false,
      relatedCalResources: '',
      resultSettingData: {} as any
    } as ResultDetail;
  }

  function createMockResultDetailWithExternalScores(
    resourceId: string, 
    betType: string
  ): ResultDetail {
    const result = createMockResultDetail(resourceId, betType);
    result.externalScores = [
      { homeValue: '', awayValue: '' } as ExternalResultDetail,
      { homeValue: '', awayValue: '' } as ExternalResultDetail
    ];
    return result;
  }
});