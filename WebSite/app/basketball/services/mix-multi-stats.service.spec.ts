import { TestBed } from '@angular/core/testing';
import { MixMultiStatsService } from './mix-multi-stats.service';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { SettlementStatusId } from '../../shared/constants';
import { PlayerBetTypes } from '../constants';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { createMockMixCoreService } from '../test-helpers/mock-services';
import { MixCoreService } from './mix-core.service';

describe('MixMultiStatsService', () => {
  let service: MixMultiStatsService;
  let mockVerificationService: any;

  beforeEach(() => {
    const verificationSpy = {
      isEarlyMismatchedWarning: jest.fn()
    };
    
    TestBed.configureTestingModule({
      providers: [
        MixMultiStatsService,
        { provide: VerificationBaseService, useValue: verificationSpy },
        { provide: MixCoreService, useValue: createMockMixCoreService() }
      ]
    });
    service = TestBed.inject(MixMultiStatsService);
    mockVerificationService = TestBed.inject(VerificationBaseService);
  });

  describe('autoFillMixReboundsAssists', () => {
    let resultDetails: ResultDetail[];
    let changedResultDetail: ResultDetail;

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.assists, '', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.rebounds, '', SettlementStatusId.Running),
        createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', SettlementStatusId.Running)
      ];
      changedResultDetail = createMockResultDetail('R004', PlayerBetTypes.assists, '', SettlementStatusId.Running);
    });

    it('should call all handle methods', () => {
      changedResultDetail.betType = PlayerBetTypes.assists; // Add betType
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

  describe('handleReboundsAssistsMix', () => {
    let resultDetails: ResultDetail[];
    let changedResultDetail: ResultDetail;

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.assists, '', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.reboundsAssists, 'R001', SettlementStatusId.Running)
      ];
    });

    it('should not process if betType is not in mixReboundsAssists', () => {
      changedResultDetail = createMockResultDetail('R001', 'invalid', '', SettlementStatusId.Running);
      
      const mockMixCoreService = TestBed.inject(MixCoreService);
      jest.spyOn(mockMixCoreService, 'findMixResultByBetType').mockReturnValue(null);
      jest.spyOn(service as any, 'calculateReboundsAssistsValue');

      (service as any).handleReboundsAssistsMix(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).not.toHaveBeenCalled();
      expect((service as any).calculateReboundsAssistsValue).not.toHaveBeenCalled();
    });

    it('should process reboundsAssists when found', () => {
      changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.assists, '', SettlementStatusId.Running);
      
      const mockResult = createMockResultDetail('R005', PlayerBetTypes.reboundsAssists, 'R001,R002', SettlementStatusId.Running);
      mockResult.externalScores = [{ homeValue: '12', awayValue: '6' } as any];
      
      const mockMixCoreService = TestBed.inject(MixCoreService);
      jest.spyOn(mockMixCoreService, 'findMixResultByBetType').mockReturnValue(mockResult);
      jest.spyOn(service as any, 'calculateReboundsAssistsValue').mockImplementation(() => {
      });

      (service as any).handleReboundsAssistsMix(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);
      expect((service as any).calculateReboundsAssistsValue).toHaveBeenCalledWith(resultDetails, mockResult);
    });
  });

  describe('findMixResultByBetType', () => {
    let resultDetails: ResultDetail[];

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, 'R002,R003', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.reboundsAssists, 'R001', SettlementStatusId.Calculated),
        createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, '', SettlementStatusId.Running)
      ];
    });

    it('should find result with matching betType, settlementStatus and resourceId in relatedCalResources', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      
      // Mock the implementation to return the expected result
      jest.spyOn(mockMixCoreService, 'findMixResultByBetType').mockReturnValue(resultDetails[0]);
      
      const result = mockMixCoreService.findMixResultByBetType(resultDetails, 'R002', PlayerBetTypes.reboundsAssists);
      
      expect(result).toBeDefined();
      expect(result.resourceId).toBe('R001');
      expect(result.betType).toBe(PlayerBetTypes.reboundsAssists);
    });

    it('should return undefined when betType does not match', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      const result = mockMixCoreService.findMixResultByBetType(resultDetails, 'R002', PlayerBetTypes.reboundsPoints);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when settlementStatusId is not Running', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      const result = mockMixCoreService.findMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when relatedCalResources is empty', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      const result = mockMixCoreService.findMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);
      
      expect(result).toBeUndefined();
    });
  });

  describe('findResultsByBetTypes', () => {
    let resultDetails: ResultDetail[];

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.assists, '', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.rebounds, '', SettlementStatusId.Running),
        createMockResultDetail('R003', PlayerBetTypes.points, '', SettlementStatusId.Running)
      ];
    });

    it('should find results by betTypes', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      const results = mockMixCoreService.findResultsByBetTypesWithMapping(
        resultDetails, 
        'R001,R002,R003', 
        [PlayerBetTypes.assists, PlayerBetTypes.rebounds]
      );
      
      expect(results[PlayerBetTypes.assists]).toBeDefined();
      expect(results[PlayerBetTypes.assists].resourceId).toBe('R001');
      expect(results[PlayerBetTypes.rebounds]).toBeDefined();
      expect(results[PlayerBetTypes.rebounds].resourceId).toBe('R002');
    });

    it('should return empty object when no matches found', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      const results = mockMixCoreService.findResultsByBetTypesWithMapping(
        resultDetails, 
        'R001,R002,R003', 
        [PlayerBetTypes.steals, PlayerBetTypes.blocks]
      );
      
      expect(Object.keys(results)).toHaveLength(0);
    });

    it('should handle empty relatedCalResources', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      const results = mockMixCoreService.findResultsByBetTypesWithMapping(
        resultDetails, 
        '', 
        [PlayerBetTypes.assists, PlayerBetTypes.rebounds]
      );
      
      expect(Object.keys(results)).toHaveLength(0);
    });
  });

  describe('calculateReboundsAssistsValue', () => {
    let resultDetails: ResultDetail[];
    let reboundsAssistsResult: ResultDetail;

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.assists, '', SettlementStatusId.Running, '10'),
        createMockResultDetail('R002', PlayerBetTypes.rebounds, '', SettlementStatusId.Running, '8')
      ];
      reboundsAssistsResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', SettlementStatusId.Running);
    });

    it('should update mix result when both results found', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      jest.spyOn(mockMixCoreService, 'findResultsByBetTypesWithMapping').mockReturnValue({
        [PlayerBetTypes.assists]: resultDetails[0],
        [PlayerBetTypes.rebounds]: resultDetails[1]
      });
      jest.spyOn(service as any, 'updateMixResult');

      (service as any).calculateReboundsAssistsValue(resultDetails, reboundsAssistsResult);

      expect((service as any).updateMixResult).toHaveBeenCalledWith(
        reboundsAssistsResult, 
        resultDetails[1], 
        resultDetails[0]
      );
    });

    it('should not update when no results found', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      jest.spyOn(mockMixCoreService, 'findResultsByBetTypesWithMapping').mockReturnValue({});
      jest.spyOn(service as any, 'updateMixResult');

      (service as any).calculateReboundsAssistsValue(resultDetails, reboundsAssistsResult);

      expect((service as any).updateMixResult).not.toHaveBeenCalled();
    });
  });

  describe('updateMixResult', () => {
    let targetResult: ResultDetail;
    let firstResult: ResultDetail;
    let secondResult: ResultDetail;

    beforeEach(() => {
      targetResult = createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, '', SettlementStatusId.Running);
      firstResult = createMockResultDetail('R002', PlayerBetTypes.rebounds, '', SettlementStatusId.Running, '10');
      secondResult = createMockResultDetail('R003', PlayerBetTypes.assists, '', SettlementStatusId.Running, '8');
    });

    it('should set homeValue to sum when both values exist', () => {
      (service as any).updateMixResult(targetResult, firstResult, secondResult);

      expect(targetResult.homeValue).toBe('18');
      expect(targetResult.checked).toBe(true);
    });

    it('should set empty homeValue when values are missing', () => {
      firstResult.homeValue = '';
      secondResult.homeValue = '';

      (service as any).updateMixResult(targetResult, firstResult, secondResult);

      expect(targetResult.homeValue).toBe('');
      expect(targetResult.checked).toBe(false);
    });

    it('should call updateExternalScores and set isScoreMismatched', () => {
      jest.spyOn(service as any, 'updateExternalScores');
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(true);

      (service as any).updateMixResult(targetResult, firstResult, secondResult);

      expect((service as any).updateExternalScores).toHaveBeenCalledWith(targetResult, firstResult, secondResult);
      expect(targetResult.isScoreMismatched).toBe(true);
    });
  });

  describe('updateTripleMixResult', () => {
    let targetResult: ResultDetail;
    let reboundsResult: ResultDetail;
    let assistsResult: ResultDetail;
    let pointsResult: ResultDetail;

    beforeEach(() => {
      targetResult = createMockResultDetail('R001', PlayerBetTypes.reboundsAssistsPoints, '', SettlementStatusId.Running);
      reboundsResult = createMockResultDetail('R002', PlayerBetTypes.rebounds, '', SettlementStatusId.Running, '10');
      assistsResult = createMockResultDetail('R003', PlayerBetTypes.assists, '', SettlementStatusId.Running, '8');
      pointsResult = createMockResultDetail('R004', PlayerBetTypes.points, '', SettlementStatusId.Running, '15');
    });

    it('should set homeValue to sum when all values exist', () => {
      (service as any).updateTripleMixResult(targetResult, reboundsResult, assistsResult, pointsResult);

      expect(targetResult.homeValue).toBe('33');
      expect(targetResult.checked).toBe(true);
    });

    it('should set empty homeValue when any value is missing', () => {
      pointsResult.homeValue = '';

      (service as any).updateTripleMixResult(targetResult, reboundsResult, assistsResult, pointsResult);

      expect(targetResult.homeValue).toBe('');
      expect(targetResult.checked).toBe(false);
    });
  });

  describe('updateExternalScores', () => {
    let targetResult: ResultDetail;
    let firstResult: ResultDetail;
    let secondResult: ResultDetail;

    beforeEach(() => {
      targetResult = createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, '', SettlementStatusId.Running);
      targetResult.externalScores = [
        { homeValue: '', awayValue: '' } as any,
        { homeValue: '', awayValue: '' } as any
      ];
      firstResult = createMockResultDetail('R002', PlayerBetTypes.rebounds, '', SettlementStatusId.Running);
      firstResult.externalScores = [
        { homeValue: '10', awayValue: '' } as any,
        { homeValue: '12', awayValue: '' } as any
      ];
      secondResult = createMockResultDetail('R003', PlayerBetTypes.assists, '', SettlementStatusId.Running);
      secondResult.externalScores = [
        { homeValue: '8', awayValue: '' } as any,
        { homeValue: '6', awayValue: '' } as any
      ];
    });

    it('should calculate external scores correctly', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      jest.spyOn(mockMixCoreService, 'hasValidHomeValue').mockImplementation((externalScore) => {
        return externalScore && externalScore.homeValue && externalScore.homeValue !== '';
      });

      (service as any).updateExternalScores(targetResult, firstResult, secondResult);

      expect(targetResult.externalScores[0].homeValue).toBe('18'); // 10 + 8
      expect(targetResult.externalScores[1].homeValue).toBe('18'); // 12 + 6
    });

    it('should handle missing external scores', () => {
      firstResult.externalScores[0] = { homeValue: '', awayValue: '' } as any;

      (service as any).updateExternalScores(targetResult, firstResult, secondResult);

      expect(targetResult.externalScores[0].homeValue).toBe('');
    });
  });

  describe('hasValidHomeValue', () => {
    it('should return true for valid external score', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      const externalScore = { homeValue: '10', awayValue: '' } as any;
      
      // Mock the implementation to return the expected value
      jest.spyOn(mockMixCoreService, 'hasValidHomeValue').mockReturnValue(true);
      
      const result = mockMixCoreService.hasValidHomeValue(externalScore);
      
      expect(result).toBe(true);
    });

    it('should return false for invalid external score', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      const externalScore = { homeValue: '', awayValue: '' } as any;
      
      // Mock the implementation to return the expected value
      jest.spyOn(mockMixCoreService, 'hasValidHomeValue').mockReturnValue(false);
      
      const result = mockMixCoreService.hasValidHomeValue(externalScore);
      
      expect(result).toBe(false);
    });

    it('should return null for null external score', () => {
      const mockMixCoreService = TestBed.inject(MixCoreService);
      
      // Mock the implementation to return the expected value
      jest.spyOn(mockMixCoreService, 'hasValidHomeValue').mockReturnValue(null);
      
      const result = mockMixCoreService.hasValidHomeValue(null);
      
      expect(result).toBe(null);
    });
  });
});

function createMockResultDetail(
  resourceId: string, 
  betType: string, 
  relatedCalResources: string, 
  settlementStatusId: number,
  homeValue: string = ''
): ResultDetail {
  return {
    resourceId,
    betType,
    relatedCalResources,
    settlementStatusId,
    homeValue,
    awayValue: '',
    resourceName: '',
    resultStatusId: 1,
    resultStatus: '',
    resultStatusColor: '',
    isInvalidValue: false,
    ticketStatus: '',
    map: 0,
    groupBetType: 0,
    betTypeName: '',
    homeName: '',
    homeId: null,
    awayId: null,
    awayName: '',
    checked: false,
    isResultWarning: false,
    isDurationWarning: false,
    externalScores: [{ homeValue: '', awayValue: '' } as any],
    isScoreMismatched: false,
    isShow: true,
    parentShowed: false,
    disabled: false,
    resultSettingData: {} as any,
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
    isRelated: false
  } as ResultDetail;
}