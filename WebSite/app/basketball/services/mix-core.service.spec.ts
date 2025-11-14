import { TestBed } from '@angular/core/testing';
import { MixCoreService } from './mix-core.service';
import { ResultDetail, ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { SettlementStatusId } from '../../shared/constants';
import { PlayerBetTypes } from '../constants';

describe('MixCoreService', () => {
  let service: MixCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MixCoreService],
    });

    service = TestBed.inject(MixCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have noneValue property', () => {
    expect(service.noneValue).toBe('None');
  });

  describe('filterMixResultByBetType', () => {
    it('should filter results matching betType, settlementStatus, and resourceId', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, 'R001,R002', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.reboundsAssists, 'R001,R003', SettlementStatusId.Running),
        createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001', SettlementStatusId.Running),
      ];

      const results = service.filterMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.betType === PlayerBetTypes.reboundsAssists)).toBe(true);
      expect(results.every(r => r.settlementStatusId === SettlementStatusId.Running)).toBe(true);
    });

    it('should return empty array when no results match betType', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, 'R001', SettlementStatusId.Running),
      ];

      const results = service.filterMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);

      expect(results).toHaveLength(0);
    });

    it('should exclude results with non-running settlement status', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, 'R001', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.reboundsAssists, 'R002', SettlementStatusId.Calculated),
      ];

      const results = service.filterMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);

      expect(results).toHaveLength(1);
      expect(results[0].resourceId).toBe('R001');
    });

    it('should exclude results with empty relatedCalResources', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, 'R001', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.reboundsAssists, '', SettlementStatusId.Running),
        createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, null as any, SettlementStatusId.Running),
      ];

      const results = service.filterMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);

      expect(results).toHaveLength(1);
      expect(results[0].resourceId).toBe('R001');
    });

    it('should handle resourceId not in relatedCalResources', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, 'R002,R003', SettlementStatusId.Running),
      ];

      const results = service.filterMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);

      expect(results).toHaveLength(0);
    });

    it('should handle whitespace in relatedCalResources', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, 'R001 , R002 , R003', SettlementStatusId.Running),
      ];

      const results = service.filterMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);

      expect(results).toHaveLength(1);
    });
  });

  describe('findMixResultByBetType', () => {
    it('should find first result matching criteria', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, 'R001', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.reboundsAssists, 'R001', SettlementStatusId.Running),
      ];

      const result = service.findMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);

      expect(result).toBeDefined();
      expect(result?.resourceId).toBe('R001');
    });

    it('should return undefined when no result matches', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, 'R001', SettlementStatusId.Running),
      ];

      const result = service.findMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);

      expect(result).toBeUndefined();
    });

    it('should return undefined when settlement status is not Running', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, 'R001', SettlementStatusId.Calculated),
      ];

      const result = service.findMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.reboundsAssists);

      expect(result).toBeUndefined();
    });
  });

  describe('findResultsByBetTypes', () => {
    it('should find results by resource IDs from comma-separated string', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, ''),
        createMockResultDetail('R002', PlayerBetTypes.assists, ''),
        createMockResultDetail('R003', PlayerBetTypes.rebounds, ''),
      ];

      const results = service.findResultsByBetTypes(resultDetails, 'R001,R002');

      expect(results).toHaveLength(2);
      expect(results.map(r => r.resourceId)).toEqual(['R001', 'R002']);
    });

    it('should handle whitespace in relatedCalResources', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, ''),
        createMockResultDetail('R002', PlayerBetTypes.assists, ''),
      ];

      const results = service.findResultsByBetTypes(resultDetails, 'R001 , R002 , R003');

      expect(results).toHaveLength(2);
    });

    it('should return empty array when no matches found', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, ''),
      ];

      const results = service.findResultsByBetTypes(resultDetails, 'R999');

      expect(results).toHaveLength(0);
    });

    it('should return empty array when relatedCalResources is empty', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, ''),
      ];

      const results = service.findResultsByBetTypes(resultDetails, '');

      expect(results).toHaveLength(0);
    });
  });

  describe('findResultsByBetTypesWithMapping', () => {
    it('should map results by bet type', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, ''),
        createMockResultDetail('R002', PlayerBetTypes.assists, ''),
        createMockResultDetail('R003', PlayerBetTypes.rebounds, ''),
      ];

      const results = service.findResultsByBetTypesWithMapping(
        resultDetails,
        'R001,R002,R003',
        [PlayerBetTypes.points, PlayerBetTypes.assists, PlayerBetTypes.rebounds]
      );

      expect(results[PlayerBetTypes.points].resourceId).toBe('R001');
      expect(results[PlayerBetTypes.assists].resourceId).toBe('R002');
      expect(results[PlayerBetTypes.rebounds].resourceId).toBe('R003');
    });

    it('should only include results matching bet types', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, ''),
        createMockResultDetail('R002', PlayerBetTypes.assists, ''),
        createMockResultDetail('R003', PlayerBetTypes.steals, ''),
      ];

      const results = service.findResultsByBetTypesWithMapping(
        resultDetails,
        'R001,R002,R003',
        [PlayerBetTypes.points, PlayerBetTypes.assists]
      );

      expect(results[PlayerBetTypes.points]).toBeDefined();
      expect(results[PlayerBetTypes.assists]).toBeDefined();
      expect(results[PlayerBetTypes.steals]).toBeUndefined();
    });

    it('should return empty object when no matches found', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, ''),
      ];

      const results = service.findResultsByBetTypesWithMapping(
        resultDetails,
        'R999',
        [PlayerBetTypes.assists]
      );

      expect(Object.keys(results)).toHaveLength(0);
    });

    it('should handle whitespace in relatedCalResources', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, ''),
      ];

      const results = service.findResultsByBetTypesWithMapping(
        resultDetails,
        ' R001 , R002 ',
        [PlayerBetTypes.points]
      );

      expect(results[PlayerBetTypes.points]).toBeDefined();
    });
  });

  describe('hasAnyRefundedResult', () => {
    it('should return true when any result is refunded', () => {
      const results = [
        createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.assists, '', SettlementStatusId.Refund),
      ];

      const hasRefunded = service.hasAnyRefundedResult(results);

      expect(hasRefunded).toBe(true);
    });

    it('should return false when no results are refunded', () => {
      const results = [
        createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.assists, '', SettlementStatusId.Calculated),
      ];

      const hasRefunded = service.hasAnyRefundedResult(results);

      expect(hasRefunded).toBe(false);
    });

    it('should return false for empty array', () => {
      const hasRefunded = service.hasAnyRefundedResult([]);

      expect(hasRefunded).toBe(false);
    });
  });

  describe('isRefundedStatus', () => {
    it('should return true for Refund status', () => {
      expect(service.isRefundedStatus(SettlementStatusId.Refund)).toBe(true);
    });

    it('should return true for RefundHalfTime status', () => {
      expect(service.isRefundedStatus(SettlementStatusId.RefundHalfTime)).toBe(true);
    });

    it('should return true for RefundFullTime status', () => {
      expect(service.isRefundedStatus(SettlementStatusId.RefundFullTime)).toBe(true);
    });

    it('should return true for RefundSettleDetermined status', () => {
      expect(service.isRefundedStatus(SettlementStatusId.RefundSettleDetermined)).toBe(true);
    });

    it('should return false for Running status', () => {
      expect(service.isRefundedStatus(SettlementStatusId.Running)).toBe(false);
    });

    it('should return false for Calculated status', () => {
      expect(service.isRefundedStatus(SettlementStatusId.Calculated)).toBe(false);
    });
  });

  describe('hasNonRunningStatus', () => {
    it('should return true when any result is not running', () => {
      const results = [
        createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.assists, '', SettlementStatusId.Calculated),
      ];

      const hasNonRunning = service.hasNonRunningStatus(results);

      expect(hasNonRunning).toBe(true);
    });

    it('should return false when all results are running', () => {
      const results = [
        createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.assists, '', SettlementStatusId.Running),
      ];

      const hasNonRunning = service.hasNonRunningStatus(results);

      expect(hasNonRunning).toBe(false);
    });

    it('should return false for empty array', () => {
      const hasNonRunning = service.hasNonRunningStatus([]);

      expect(hasNonRunning).toBe(false);
    });
  });

  describe('hasInvalidValues', () => {
    it('should return true when any result has empty homeValue', () => {
      const results = [
        createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running, '10'),
        createMockResultDetail('R002', PlayerBetTypes.assists, '', SettlementStatusId.Running, ''),
      ];

      const hasInvalid = service.hasInvalidValues(results);

      expect(hasInvalid).toBe(true);
    });

    it('should return true when any result has null homeValue', () => {
      const results = [
        createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running, '10'),
        createMockResultDetail('R002', PlayerBetTypes.assists, '', SettlementStatusId.Running, null as any),
      ];

      const hasInvalid = service.hasInvalidValues(results);

      expect(hasInvalid).toBe(true);
    });

    it('should return false when all results have valid homeValue', () => {
      const results = [
        createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running, '10'),
        createMockResultDetail('R002', PlayerBetTypes.assists, '', SettlementStatusId.Running, '5'),
      ];

      const hasInvalid = service.hasInvalidValues(results);

      expect(hasInvalid).toBe(false);
    });

    it('should return false for empty array', () => {
      const hasInvalid = service.hasInvalidValues([]);

      expect(hasInvalid).toBe(false);
    });
  });

  describe('hasValidHomeValue', () => {
    it('should return true when externalScore has valid homeValue', () => {
      const externalScore = createMockExternalResultDetail('10');

      const isValid = service.hasValidHomeValue(externalScore);

      expect(isValid).toBe(true);
    });

    it('should return false when externalScore has empty homeValue', () => {
      const externalScore = createMockExternalResultDetail('');

      const isValid = service.hasValidHomeValue(externalScore);

      expect(isValid).toBe(false);
    });

    it('should return false when homeValue is null', () => {
      const externalScore = createMockExternalResultDetail(null as any);

      const isValid = service.hasValidHomeValue(externalScore);

      expect(isValid).toBe(false);
    });
  });

  function createMockResultDetail(
    resourceId: string,
    betType: string,
    relatedCalResources: string = '',
    settlementStatusId: number = SettlementStatusId.Running,
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
      externalScores: [],
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
      isRelated: false,
    } as ResultDetail;
  }

  function createMockExternalResultDetail(homeValue: string = ''): ExternalResultDetail {
    return {
      homeValue,
      awayValue: '',
      sourceId: 101,
      resourceId: 'R001',
      sourceName: 'Source 1',
    } as ExternalResultDetail;
  }
});

