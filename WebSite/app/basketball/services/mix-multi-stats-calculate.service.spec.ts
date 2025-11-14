import { TestBed } from '@angular/core/testing';
import { MixMultiStatsCalculateService } from './mix-multi-stats-calculate.service';
import { MixCoreService } from './mix-core.service';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { ResultDetail, ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { PlayerBetTypes } from '../constants';

describe('MixMultiStatsCalculateService', () => {
  let service: MixMultiStatsCalculateService;
  let mockMixCoreService: jest.Mocked<MixCoreService>;
  let mockVerificationService: jest.Mocked<VerificationBaseService>;

  beforeEach(() => {
    mockMixCoreService = {
      findResultsByBetTypesWithMapping: jest.fn(),
      hasValidHomeValue: jest.fn(),
    } as any;

    mockVerificationService = {
      isEarlyMismatchedWarning: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        MixMultiStatsCalculateService,
        { provide: MixCoreService, useValue: mockMixCoreService },
        { provide: VerificationBaseService, useValue: mockVerificationService },
      ],
    });

    service = TestBed.inject(MixMultiStatsCalculateService);
  });

  function createMockResultDetail(
    resourceId: string,
    betType: string,
    relatedCalResources: string = '',
    homeValue: string = '',
    externalScores: ExternalResultDetail[] = []
  ): ResultDetail {
    return {
      resourceId,
      betType,
      relatedCalResources,
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
      externalScores: externalScores.length > 0 ? externalScores : [{ homeValue: '', awayValue: '' } as any],
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

  describe('calculateReboundsAssistsValue', () => {
    it('should calculate rebounds + assists value when both results exist', () => {
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10');
      const assistsResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '5');
      const reboundsAssistsResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', '');

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({
        [PlayerBetTypes.rebounds]: reboundsResult,
        [PlayerBetTypes.assists]: assistsResult,
      });
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateReboundsAssistsValue([], reboundsAssistsResult);

      expect(reboundsAssistsResult.homeValue).toBe('15');
      expect(reboundsAssistsResult.checked).toBe(true);
      expect(mockVerificationService.isEarlyMismatchedWarning).toHaveBeenCalledWith(reboundsAssistsResult);
    });

    it('should not update when neither result exists', () => {
      const reboundsAssistsResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', '');

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({});

      service.calculateReboundsAssistsValue([], reboundsAssistsResult);

      expect(reboundsAssistsResult.homeValue).toBe('');
      expect(reboundsAssistsResult.checked).toBe(false);
    });

    it('should set homeValue to empty string when one value is empty', () => {
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10');
      const assistsResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '');
      const reboundsAssistsResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', '');

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({
        [PlayerBetTypes.rebounds]: reboundsResult,
        [PlayerBetTypes.assists]: assistsResult,
      });
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateReboundsAssistsValue([], reboundsAssistsResult);

      expect(reboundsAssistsResult.homeValue).toBe('');
    });
  });

  describe('calculateReboundsPointsValue', () => {
    it('should calculate rebounds + points value when both results exist', () => {
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '8');
      const pointsResult = createMockResultDetail('R002', PlayerBetTypes.points, '', '20');
      const reboundsPointsResult = createMockResultDetail('R003', PlayerBetTypes.reboundsPoints, 'R001,R002', '');

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({
        [PlayerBetTypes.rebounds]: reboundsResult,
        [PlayerBetTypes.points]: pointsResult,
      });
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateReboundsPointsValue([], reboundsPointsResult);

      expect(reboundsPointsResult.homeValue).toBe('28');
      expect(reboundsPointsResult.checked).toBe(true);
    });

    it('should not update when neither result exists', () => {
      const reboundsPointsResult = createMockResultDetail('R003', PlayerBetTypes.reboundsPoints, 'R001,R002', '');

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({});

      service.calculateReboundsPointsValue([], reboundsPointsResult);

      expect(reboundsPointsResult.homeValue).toBe('');
      expect(reboundsPointsResult.checked).toBe(false);
    });
  });

  describe('calculateReboundsAssistsPointsValue', () => {
    it('should calculate rebounds + assists + points value when all results exist', () => {
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10');
      const assistsResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '5');
      const pointsResult = createMockResultDetail('R003', PlayerBetTypes.points, '', '20');
      const reboundsAssistsPointsResult = createMockResultDetail(
        'R004',
        PlayerBetTypes.reboundsAssistsPoints,
        'R001,R002,R003',
        ''
      );

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({
        [PlayerBetTypes.rebounds]: reboundsResult,
        [PlayerBetTypes.assists]: assistsResult,
        [PlayerBetTypes.points]: pointsResult,
      });
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateReboundsAssistsPointsValue([], reboundsAssistsPointsResult);

      expect(reboundsAssistsPointsResult.homeValue).toBe('35');
      expect(reboundsAssistsPointsResult.checked).toBe(true);
    });
    it('should set homeValue to empty string when one value is empty', () => {
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10');
      const assistsResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '');
      const pointsResult = createMockResultDetail('R003', PlayerBetTypes.points, '', '20');
      const reboundsAssistsPointsResult = createMockResultDetail(
        'R004',
        PlayerBetTypes.reboundsAssistsPoints,
        'R001,R002,R003',
        ''
      );

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({
        [PlayerBetTypes.rebounds]: reboundsResult,
        [PlayerBetTypes.assists]: assistsResult,
        [PlayerBetTypes.points]: pointsResult,
      });
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateReboundsAssistsPointsValue([], reboundsAssistsPointsResult);

      expect(reboundsAssistsPointsResult.homeValue).toBe('');
    });
  });

  describe('calculateStealsBlocksValue', () => {
    it('should calculate steals + blocks value when both results exist', () => {
      const stealsResult = createMockResultDetail('R001', PlayerBetTypes.steals, '', '3');
      const blocksResult = createMockResultDetail('R002', PlayerBetTypes.blocks, '', '2');
      const stealsBlocksResult = createMockResultDetail('R003', PlayerBetTypes.stealsBlocks, 'R001,R002', '');

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({
        [PlayerBetTypes.steals]: stealsResult,
        [PlayerBetTypes.blocks]: blocksResult,
      });
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateStealsBlocksValue([], stealsBlocksResult);

      expect(stealsBlocksResult.homeValue).toBe('5');
      expect(stealsBlocksResult.checked).toBe(true);
    });

    it('should not update when neither result exists', () => {
      const stealsBlocksResult = createMockResultDetail('R003', PlayerBetTypes.stealsBlocks, 'R001,R002', '');

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({});

      service.calculateStealsBlocksValue([], stealsBlocksResult);

      expect(stealsBlocksResult.homeValue).toBe('');
      expect(stealsBlocksResult.checked).toBe(false);
    });
  });

  describe('updateExternalScores', () => {
    it('should update external scores when both results have valid external scores', () => {
      const firstResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10', [
        createMockExternalResultDetail('8'),
        createMockExternalResultDetail('12'),
      ]);
      const secondResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '5', [
        createMockExternalResultDetail('6'),
        createMockExternalResultDetail('4'),
      ]);
      const targetResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', '', [
        createMockExternalResultDetail(''),
        createMockExternalResultDetail(''),
      ]);

      mockMixCoreService.hasValidHomeValue.mockReturnValue(true);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      (service as any).updateExternalScores(targetResult, firstResult, secondResult);

      expect(targetResult.externalScores[0].homeValue).toBe('14'); // 8 + 6
      expect(targetResult.externalScores[1].homeValue).toBe('16'); // 12 + 4
    });

    it('should not update external score when one is invalid', () => {
      const firstResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10', [
        createMockExternalResultDetail('8'),
      ]);
      const secondResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '5', [
        createMockExternalResultDetail(''),
      ]);
      const targetResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', '', [
        createMockExternalResultDetail(''),
      ]);

      mockMixCoreService.hasValidHomeValue
        .mockReturnValueOnce(true) // firstExternalScore
        .mockReturnValueOnce(false); // secondExternalScore
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      (service as any).updateExternalScores(targetResult, firstResult, secondResult);

      expect(targetResult.externalScores[0].homeValue).toBe('');
    });
  });

  describe('updateTripleExternalScores', () => {
    it('should update external scores when all three results have valid external scores', () => {
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10', [
        createMockExternalResultDetail('8'),
      ]);
      const assistsResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '5', [
        createMockExternalResultDetail('6'),
      ]);
      const pointsResult = createMockResultDetail('R003', PlayerBetTypes.points, '', '20', [
        createMockExternalResultDetail('12'),
      ]);
      const targetResult = createMockResultDetail(
        'R004',
        PlayerBetTypes.reboundsAssistsPoints,
        'R001,R002,R003',
        '',
        [createMockExternalResultDetail('')]
      );

      mockMixCoreService.hasValidHomeValue.mockReturnValue(true);
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      (service as any).updateTripleExternalScores(targetResult, reboundsResult, assistsResult, pointsResult);

      expect(targetResult.externalScores[0].homeValue).toBe('26'); // 8 + 6 + 12
    });

    it('should not update external score when one is invalid', () => {
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10', [
        createMockExternalResultDetail('8'),
      ]);
      const assistsResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '5', [
        createMockExternalResultDetail(''),
      ]);
      const pointsResult = createMockResultDetail('R003', PlayerBetTypes.points, '', '20', [
        createMockExternalResultDetail('12'),
      ]);
      const targetResult = createMockResultDetail(
        'R004',
        PlayerBetTypes.reboundsAssistsPoints,
        'R001,R002,R003',
        '',
        [createMockExternalResultDetail('')]
      );

      mockMixCoreService.hasValidHomeValue
        .mockReturnValueOnce(true) // reboundsExternalScore
        .mockReturnValueOnce(false) // assistsExternalScore
        .mockReturnValueOnce(true); // pointsExternalScore
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      (service as any).updateTripleExternalScores(targetResult, reboundsResult, assistsResult, pointsResult);

      expect(targetResult.externalScores[0].homeValue).toBe('');
    });
  });

  describe('edge cases', () => {
    it('should handle null or undefined homeValue', () => {
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', null as any);
      const assistsResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', undefined as any);
      const reboundsAssistsResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', '');

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({
        [PlayerBetTypes.rebounds]: reboundsResult,
        [PlayerBetTypes.assists]: assistsResult,
      });
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateReboundsAssistsValue([], reboundsAssistsResult);

      expect(reboundsAssistsResult.homeValue).toBe('');
    });

    it('should handle NaN from parseInt gracefully', () => {
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', 'abc');
      const assistsResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '5');
      const reboundsAssistsResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', '');

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({
        [PlayerBetTypes.rebounds]: reboundsResult,
        [PlayerBetTypes.assists]: assistsResult,
      });
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      service.calculateReboundsAssistsValue([], reboundsAssistsResult);

      // parseInt('abc') = NaN, NaN + 5 = NaN, NaN.toString() = 'NaN'
      expect(reboundsAssistsResult.homeValue).toBe('NaN');
    });

    it('should set isScoreMismatched based on verification service', () => {
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10');
      const assistsResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '5');
      const reboundsAssistsResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', '');

      mockMixCoreService.findResultsByBetTypesWithMapping.mockReturnValue({
        [PlayerBetTypes.rebounds]: reboundsResult,
        [PlayerBetTypes.assists]: assistsResult,
      });
      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(true);

      service.calculateReboundsAssistsValue([], reboundsAssistsResult);

      expect(reboundsAssistsResult.isScoreMismatched).toBe(true);
    });

    it('should handle empty externalScores array', () => {
      const firstResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10', []);
      const secondResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '5', []);
      const targetResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', '', []);

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      expect(() => {
        (service as any).updateExternalScores(targetResult, firstResult, secondResult);
      }).not.toThrow();
    });

    it('should handle null externalScores', () => {
      const firstResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '', '10');
      const secondResult = createMockResultDetail('R002', PlayerBetTypes.assists, '', '5');
      const targetResult = createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, 'R001,R002', '');
      targetResult.externalScores = null as any;

      mockVerificationService.isEarlyMismatchedWarning.mockReturnValue(false);

      expect(() => {
        (service as any).updateExternalScores(targetResult, firstResult, secondResult);
      }).toThrow();
    });
  });
});
