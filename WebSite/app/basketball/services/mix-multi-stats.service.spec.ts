import { TestBed } from '@angular/core/testing';
import { MixMultiStatsService } from './mix-multi-stats.service';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { SettlementStatusId } from '../../shared/constants';
import { PlayerBetTypes, Resources } from '../constants';

describe('MixMultiStatsService', () => {
  let service: MixMultiStatsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MixMultiStatsService]
    });
    service = TestBed.inject(MixMultiStatsService);
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
    });

    it('should call all handle methods', () => {
      spyOn(service as any, 'handleReboundsAssistsMix');
      spyOn(service as any, 'handleReboundsPointsMix');
      spyOn(service as any, 'handleReboundsAssistsPointsMix');
      spyOn(service as any, 'handleStealsBlocksMix');

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
      
      spyOn(service as any, 'findMixResultByBetType').and.returnValue(null);
      spyOn(service as any, 'calculateReboundsAssistsValue');

      (service as any).handleReboundsAssistsMix(resultDetails, changedResultDetail);

      expect((service as any).findMixResultByBetType).not.toHaveBeenCalled();
      expect((service as any).calculateReboundsAssistsValue).not.toHaveBeenCalled();
    });

    it('should process reboundsAssists when found', () => {
      changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.assists, '', SettlementStatusId.Running);
      
      spyOn(service as any, 'findMixResultByBetType').and.returnValue(resultDetails[1]);
      spyOn(service as any, 'calculateReboundsAssistsValue');

      (service as any).handleReboundsAssistsMix(resultDetails, changedResultDetail);

      expect((service as any).findMixResultByBetType).toHaveBeenCalledWith(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);
      expect((service as any).calculateReboundsAssistsValue).toHaveBeenCalledWith(resultDetails, resultDetails[1]);
    });
  });

  describe('findMixResultByBetType', () => {
    let resultDetails: ResultDetail[];

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, 'R002,R003', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.reboundsAssists, 'R001', SettlementStatusId.Completed),
        createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, '', SettlementStatusId.Running)
      ];
    });

    it('should find result with matching betType, settlementStatus and resourceId in relatedCalResources', () => {
      const result = (service as any).findMixResultByBetType(resultDetails, 'R002', PlayerBetTypes.reboundsAssists);
      
      expect(result).toBeDefined();
      expect(result.resourceId).toBe('R001');
      expect(result.betType).toBe(PlayerBetTypes.reboundsAssists);
    });

    it('should return undefined when betType does not match', () => {
      const result = (service as any).findMixResultByBetType(resultDetails, 'R002', PlayerBetTypes.reboundsPoints);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when settlementStatusId is not Running', () => {
      const result = (service as any).findMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when relatedCalResources is empty', () => {
      const result = (service as any).findMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);
      
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
      const results = (service as any).findResultsByBetTypes(
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
      const results = (service as any).findResultsByBetTypes(
        resultDetails, 
        'R001,R002,R003', 
        [PlayerBetTypes.steals, PlayerBetTypes.blocks]
      );
      
      expect(Object.keys(results)).toHaveLength(0);
    });

    it('should handle empty relatedCalResources', () => {
      const results = (service as any).findResultsByBetTypes(
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
      spyOn(service as any, 'findResultsByBetTypes').and.returnValue({
        [PlayerBetTypes.assists]: resultDetails[0],
        [PlayerBetTypes.rebounds]: resultDetails[1]
      });
      spyOn(service as any, 'updateMixResult');

      (service as any).calculateReboundsAssistsValue(resultDetails, reboundsAssistsResult);

      expect((service as any).updateMixResult).toHaveBeenCalledWith(
        reboundsAssistsResult, 
        resultDetails[1], 
        resultDetails[0]
      );
    });

    it('should not update when no results found', () => {
      spyOn(service as any, 'findResultsByBetTypes').and.returnValue({});
      spyOn(service as any, 'updateMixResult');

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
      spyOn(service as any, 'updateExternalScores');
      spyOn(service['#verificationBaseService'], 'isEarlyMismatchedWarning').and.returnValue(true);

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
      const externalScore = { homeValue: '10', awayValue: '' } as any;
      
      const result = (service as any).hasValidHomeValue(externalScore);
      
      expect(result).toBe(true);
    });

    it('should return false for invalid external score', () => {
      const externalScore = { homeValue: '', awayValue: '' } as any;
      
      const result = (service as any).hasValidHomeValue(externalScore);
      
      expect(result).toBe(false);
    });

    it('should return false for null external score', () => {
      const result = (service as any).hasValidHomeValue(null);
      
      expect(result).toBe(false);
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