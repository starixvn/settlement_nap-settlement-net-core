import { TestBed } from '@angular/core/testing';
import { MixDoubleDoubleService } from './mix-double-double.service';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { SettlementStatusId } from '../../shared/constants';
import { PlayerBetTypes } from '../constants';
import { VerificationBaseService } from '../../core/services/verification-base.service';

describe('MixDoubleDoubleService', () => {
  let service: MixDoubleDoubleService;
  let mockVerificationService: any;

  beforeEach(() => {
    const verificationSpy = {
      isEarlyMismatchedWarning: jest.fn()
    };
    
    TestBed.configureTestingModule({
      providers: [
        MixDoubleDoubleService,
        { provide: VerificationBaseService, useValue: verificationSpy }
      ]
    });
    service = TestBed.inject(MixDoubleDoubleService);
    mockVerificationService = TestBed.inject(VerificationBaseService);
  });

  describe('autoFillMixDoubleDouble', () => {
    let resultDetails: ResultDetail[];
    let changedResultDetail: ResultDetail;

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, 'R002,R003', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.doubleDouble, 'R001,R003', SettlementStatusId.Running),
        createMockResultDetail('R003', PlayerBetTypes.tripleDouble, 'R001,R002', SettlementStatusId.Running)
      ];
    });

    it('should not process if betType is not in targetBetTypes', () => {
      changedResultDetail = createMockResultDetail('R001', 'invalid', '', SettlementStatusId.Running);
      
      jest.spyOn(service as any, 'findMixResultByBetType').mockReturnValue(null);
      jest.spyOn(service as any, 'calculateDoubleDoubleValue');
      jest.spyOn(service as any, 'calculateTripleDoubleValue');

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect((service as any).findMixResultByBetType).not.toHaveBeenCalled();
      expect((service as any).calculateDoubleDoubleValue).not.toHaveBeenCalled();
      expect((service as any).calculateTripleDoubleValue).not.toHaveBeenCalled();
    });

    it('should process doubleDouble when found', () => {
      changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running);
      
      jest.spyOn(service as any, 'findMixResultByBetType').mockReturnValue(resultDetails[1]);
      jest.spyOn(service as any, 'calculateDoubleDoubleValue');
      jest.spyOn(service as any, 'calculateTripleDoubleValue');

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect((service as any).findMixResultByBetType).toHaveBeenCalledWith(resultDetails, 'R001', PlayerBetTypes.doubleDouble);
      expect((service as any).calculateDoubleDoubleValue).toHaveBeenCalledWith(resultDetails, resultDetails[1]);
    });

    it('should process tripleDouble when found', () => {
      changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running);
      
      jest.spyOn(service as any, 'findMixResultByBetType').mockReturnValue(resultDetails[2]);
      jest.spyOn(service as any, 'calculateDoubleDoubleValue');
      jest.spyOn(service as any, 'calculateTripleDoubleValue');

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect((service as any).findMixResultByBetType).toHaveBeenCalledWith(resultDetails, 'R001', PlayerBetTypes.tripleDouble);
      expect((service as any).calculateTripleDoubleValue).toHaveBeenCalledWith(resultDetails, resultDetails[2]);
    });
  });

  describe('findMixResultByBetType', () => {
    let resultDetails: ResultDetail[];

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.doubleDouble, 'R002,R003', SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.doubleDouble, 'R001', SettlementStatusId.Calculated),
        createMockResultDetail('R003', PlayerBetTypes.doubleDouble, '', SettlementStatusId.Running)
      ];
    });

    it('should find result with matching betType, settlementStatus and resourceId in relatedCalResources', () => {
      const result = (service as any).findMixResultByBetType(resultDetails, 'R002', PlayerBetTypes.doubleDouble);
      
      expect(result).toBeDefined();
      expect(result.resourceId).toBe('R001');
      expect(result.betType).toBe(PlayerBetTypes.doubleDouble);
    });

    it('should return undefined when betType does not match', () => {
      const result = (service as any).findMixResultByBetType(resultDetails, 'R002', PlayerBetTypes.tripleDouble);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when settlementStatusId is not Running', () => {
      const result = (service as any).findMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.doubleDouble);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when relatedCalResources is empty', () => {
      const result = (service as any).findMixResultByBetType(resultDetails, 'R001', PlayerBetTypes.doubleDouble);
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when resourceId is not in relatedCalResources', () => {
      const result = (service as any).findMixResultByBetType(resultDetails, 'R999', PlayerBetTypes.doubleDouble);
      
      expect(result).toBeUndefined();
    });
  });

  describe('calculateValueWithThresholds', () => {
    let resultDetails: ResultDetail[];

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running, '15'),
        createMockResultDetail('R002', PlayerBetTypes.assists, '', SettlementStatusId.Running, '8'),
        createMockResultDetail('R003', PlayerBetTypes.rebounds, '', SettlementStatusId.Running, '12'),
        createMockResultDetail('R004', PlayerBetTypes.steals, '', SettlementStatusId.Running, '5'),
        createMockResultDetail('R005', PlayerBetTypes.blocks, '', SettlementStatusId.Running, '7')
      ];
    });

    it('should return yesValue when highValueCount >= highThreshold', () => {
      const result = (service as any).calculateValueWithThresholds(
        resultDetails, 
        'R001,R002,R003,R004,R005', 
        (result: ResultDetail) => parseInt(result.homeValue), 
        2, 
        4
      );
      
      expect(result).toBe('Y');
    });

    it('should return noValue when lowValueCount >= lowThreshold', () => {
      const result = (service as any).calculateValueWithThresholds(
        resultDetails, 
        'R001,R002,R003,R004,R005', 
        (result: ResultDetail) => parseInt(result.homeValue), 
        3, 
        4
      );
      
      expect(result).toBe('None');
    });

    it('should return noneValue when neither condition is met', () => {
      const result = (service as any).calculateValueWithThresholds(
        resultDetails, 
        'R001,R002', 
        (result: ResultDetail) => parseInt(result.homeValue), 
        3, 
        4
      );
      
      expect(result).toBe('None');
    });
  });

  describe('calculateValue', () => {
    it('should call calculateValueWithThresholds with correct parameters', () => {
      jest.spyOn(service as any, 'calculateValueWithThresholds').mockReturnValue('Y');
      
      const result = (service as any).calculateValue([], 'test', () => 10);
      
      expect((service as any).calculateValueWithThresholds).toHaveBeenCalledWith([], 'test', expect.any(Function), 2, 4);
      expect(result).toBe('Y');
    });
  });

  describe('calculateTripleValue', () => {
    it('should call calculateValueWithThresholds with correct parameters', () => {
      jest.spyOn(service as any, 'calculateValueWithThresholds').mockReturnValue('N');
      
      const result = (service as any).calculateTripleValue([], 'test', () => 5);
      
      expect((service as any).calculateValueWithThresholds).toHaveBeenCalledWith([], 'test', expect.any(Function), 3, 3);
      expect(result).toBe('N');
    });
  });

  describe('countValidResults', () => {
    let resultDetails: ResultDetail[];

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running, '15'),
        createMockResultDetail('R002', PlayerBetTypes.assists, '', SettlementStatusId.Running, '8'),
        createMockResultDetail('R003', PlayerBetTypes.rebounds, '', SettlementStatusId.Running, '12')
      ];
    });

    it('should count valid results correctly', () => {
      const count = (service as any).countValidResults(
        resultDetails, 
        'R001,R002,R003', 
        (result: ResultDetail) => parseInt(result.homeValue) > 10
      );
      
      expect(count).toBe(2); // R001 (15) and R003 (12)
    });

    it('should return 0 when no valid results', () => {
      const count = (service as any).countValidResults(
        resultDetails, 
        'R001,R002,R003', 
        (result: ResultDetail) => parseInt(result.homeValue) > 20
      );
      
      expect(count).toBe(0);
    });
  });

  describe('areAllExternalScoresEmpty', () => {
    let resultDetails: ResultDetail[];

    beforeEach(() => {
      resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, '', SettlementStatusId.Running, '15'),
        createMockResultDetail('R002', PlayerBetTypes.assists, '', SettlementStatusId.Running, '8')
      ];
    });

    it('should return true when all external scores are empty', () => {
      const result = (service as any).areAllExternalScoresEmpty(resultDetails, 'R001,R002', 0);
      
      expect(result).toBe(true);
    });

    it('should return false when at least one external score has value', () => {
      resultDetails[0].externalScores[0] = { homeValue: '10', awayValue: '' } as any;
      
      const result = (service as any).areAllExternalScoresEmpty(resultDetails, 'R001,R002', 0);
      
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
