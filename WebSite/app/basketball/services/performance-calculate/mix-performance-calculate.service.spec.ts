import { TestBed } from '@angular/core/testing';
import { MixPerformanceCalculateService } from './mix-performance-calculate.service';
import { PerformanceAutoFillFactory } from './performance-autoFill-factory';
import { VerificationBaseService } from '../../../core/services/verification-base.service';
import { IAutofillStrategy } from './performance-autofill.strategy.native';
import { ResultDetail, OddFlexModel, ExternalResultDetail } from '../../../shared/models/sportsbook-sop';
import { PlayerBetTypes } from '../../constants';
import { SettlementStatusId } from '../../../shared/constants/settlement-status-id.native';
import { ResultStatusId } from '../../../shared/constants/result-status-id.native';

describe('MixPerformanceCalculateService', () => {
  let service: MixPerformanceCalculateService;
  let mockPerformanceAutoFillFactory: jest.Mocked<PerformanceAutoFillFactory>;
  let mockVerificationBaseService: jest.Mocked<VerificationBaseService>;
  let mockAutofillStrategy: jest.Mocked<IAutofillStrategy>;

  beforeEach(() => {
    mockAutofillStrategy = {
      getAutofillResult: jest.fn(),
    } as any;

    mockPerformanceAutoFillFactory = {
      getAutofillStrategy: jest.fn(),
    } as any;

    mockVerificationBaseService = {
      isEarlyMismatchedWarning: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        MixPerformanceCalculateService,
        { provide: PerformanceAutoFillFactory, useValue: mockPerformanceAutoFillFactory },
        { provide: VerificationBaseService, useValue: mockVerificationBaseService },
      ],
    });

    service = TestBed.inject(MixPerformanceCalculateService);
  });

  function createMockOddFlex(
    statistics: Array<{ type: string; value: string }> = [],
    results: Array<{ type: string; value: string }> = []
  ): OddFlexModel {
    return {
      resourceId: 'R001',
      betType: 1,
      betChoice: '',
      oddsInfo: '',
      info: {
        playerId: 1,
        playerName: 'Player 1',
        teamId: 100,
        isHome: true,
        statistics,
        results,
        relatedBettype: '',
      },
    };
  }

  function createMockResultDetail(
    resourceId: string,
    betType: string,
    relatedCalResources: string = '',
    homeValue: string = '',
    oddFlex?: OddFlexModel[],
    externalScores: ExternalResultDetail[] = []
  ): ResultDetail {
    return {
      resourceId,
      betType,
      relatedCalResources,
      homeValue,
      awayValue: '',
      resourceName: '',
      resultStatusId: ResultStatusId.RunningZero,
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
      externalScores,
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
      oddFlex: oddFlex || [createMockOddFlex()],
      confirmedSdtHomeValue: '',
      confirmedSdtAwayValue: '',
      isRelated: false,
    } as ResultDetail;
  }

  function createMockExternalResultDetail(
    sourceId: number,
    resourceId: string,
    homeValue: string = ''
  ): ExternalResultDetail {
    return {
      sourceId,
      resourceId,
      sourceName: `Source ${sourceId}`,
      homeValue,
      awayValue: '',
      homeName: '',
      awayName: '',
    } as ExternalResultDetail;
  }

  function createMockFinalResult(homeValue: string = '100', awayValue: string = '90'): ResultDetail {
    return createMockResultDetail('00', '00', '', `${homeValue}-${awayValue}`);
  }

  describe('autoFillMixPerformance', () => {
    it('should return early if betType is not a performance type', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);
      const finalResult = createMockFinalResult();

      service.autoFillMixPerformance([], changedResultDetail, finalResult);

      expect(changedResultDetail.homeValue).toBe('');
      expect(mockPerformanceAutoFillFactory.getAutofillStrategy).not.toHaveBeenCalled();
    });

    it('should return early if oddFlex array is empty', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.performance, '', '', []);
      const finalResult = createMockFinalResult();

      service.autoFillMixPerformance([], changedResultDetail, finalResult);

      expect(changedResultDetail.homeValue).toBe('');
      expect(mockPerformanceAutoFillFactory.getAutofillStrategy).not.toHaveBeenCalled();
    });

    it('should return early if no autofill strategy is found', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.performance);
      const finalResult = createMockFinalResult();
      mockPerformanceAutoFillFactory.getAutofillStrategy.mockReturnValue(undefined);

      service.autoFillMixPerformance([], changedResultDetail, finalResult);

      expect(changedResultDetail.homeValue).toBe('');
    });

    it('should return early if expected value is empty', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.performance);
      const finalResult = createMockFinalResult();
      mockPerformanceAutoFillFactory.getAutofillStrategy.mockReturnValue(mockAutofillStrategy);
      mockAutofillStrategy.getAutofillResult.mockReturnValue('');

      service.autoFillMixPerformance([], changedResultDetail, finalResult);

      expect(changedResultDetail.homeValue).toBe('');
    });

    it('should update homeValue when autofill strategy returns a value', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.performance);
      const finalResult = createMockFinalResult();
      mockPerformanceAutoFillFactory.getAutofillStrategy.mockReturnValue(mockAutofillStrategy);
      mockAutofillStrategy.getAutofillResult.mockReturnValue('Y');

      service.autoFillMixPerformance([], changedResultDetail, finalResult);

      expect(changedResultDetail.homeValue).toBe('Y');
    });

    it('should skip external scores with sourceId <= MINIMUM_SOURCE_ID', () => {
      const externalScore = createMockExternalResultDetail(50, 'R001', '');
      const changedResultDetail = createMockResultDetail(
        'R001',
        PlayerBetTypes.performance,
        '',
        '',
        undefined,
        [externalScore]
      );
      const finalResult = createMockFinalResult();

      mockPerformanceAutoFillFactory.getAutofillStrategy.mockReturnValue(mockAutofillStrategy);
      mockAutofillStrategy.getAutofillResult.mockReturnValue('Y');

      service.autoFillMixPerformance([], changedResultDetail, finalResult);

      expect(externalScore.homeValue).toBe('');
      expect(mockAutofillStrategy.getAutofillResult).toHaveBeenCalledTimes(1);
    });

    it('should check for score mismatch after updating', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.performance);
      const finalResult = createMockFinalResult();
      mockPerformanceAutoFillFactory.getAutofillStrategy.mockReturnValue(mockAutofillStrategy);
      mockAutofillStrategy.getAutofillResult.mockReturnValue('Y');
      mockVerificationBaseService.isEarlyMismatchedWarning.mockReturnValue(true);

      service.autoFillMixPerformance([], changedResultDetail, finalResult);

      expect(mockVerificationBaseService.isEarlyMismatchedWarning).toHaveBeenCalledWith(changedResultDetail);
      expect(changedResultDetail.isScoreMismatched).toBe(true);
    });

    it('should filter related results based on relatedCalResources and statistics', () => {
      const relatedResult1 = createMockResultDetail('6531', PlayerBetTypes.points, '', '10');
      const relatedResult2 = createMockResultDetail('6561', PlayerBetTypes.assists, '', '5');
      const unrelatedResult = createMockResultDetail('9999', PlayerBetTypes.points, '', '20');

      const oddFlex = createMockOddFlex([{ type: 'points', value: '10' }]);
      const changedResultDetail = createMockResultDetail(
        'R001',
        PlayerBetTypes.performance,
        '6531,6561',
        '',
        [oddFlex]
      );
      const finalResult = createMockFinalResult();

      mockPerformanceAutoFillFactory.getAutofillStrategy.mockReturnValue(mockAutofillStrategy);
      mockAutofillStrategy.getAutofillResult.mockReturnValue('Y');

      service.autoFillMixPerformance(
        [relatedResult1, relatedResult2, unrelatedResult],
        changedResultDetail,
        finalResult
      );

      const context = mockPerformanceAutoFillFactory.getAutofillStrategy.mock.calls[0][0];
      expect(context.relatedResults).toHaveLength(1); // Only 6531 matches the statistic
      expect(context.relatedResults[0].resourceId).toBe('6531');
    });
  });

  describe('getExpectedValueOnly', () => {
    it('should return expected value when strategy is found', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.performance);
      const finalResult = createMockFinalResult();
      mockPerformanceAutoFillFactory.getAutofillStrategy.mockReturnValue(mockAutofillStrategy);
      mockAutofillStrategy.getAutofillResult.mockReturnValue('Y');

      const result = service.getExpectedValueOnly([], changedResultDetail, finalResult);

      expect(result).toBe('Y');
    });

    it('should return empty string when no strategy is found', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.performance);
      const finalResult = createMockFinalResult();
      mockPerformanceAutoFillFactory.getAutofillStrategy.mockReturnValue(undefined);

      const result = service.getExpectedValueOnly([], changedResultDetail, finalResult);

      expect(result).toBe('');
    });

    it('should return empty string when oddFlex is empty', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.performance, '', '', []);
      const finalResult = createMockFinalResult();

      const result = service.getExpectedValueOnly([], changedResultDetail, finalResult);

      expect(result).toBe('');
    });
  });

  describe('getRelatedExternalResults', () => {
    it('should return related external results with matching sourceId', () => {
      const relatedResult1 = createMockResultDetail('R001', PlayerBetTypes.points);
      const relatedResult2 = createMockResultDetail('R002', PlayerBetTypes.assists);
      
      relatedResult1.externalScores = [
        createMockExternalResultDetail(101, 'R001', '10'),
        createMockExternalResultDetail(102, 'R001', '20'),
      ];
      relatedResult2.externalScores = [
        createMockExternalResultDetail(101, 'R002', '5'),
      ];

      const result = (service as any).getRelatedExternalResults(
        [relatedResult1, relatedResult2],
        101
      );

      expect(result).toHaveLength(2);
      expect(result[0].homeValue).toBe('10');
      expect(result[1].homeValue).toBe('5');
    });

    it('should filter out external results with empty homeValue', () => {
      const relatedResult = createMockResultDetail('R001', PlayerBetTypes.points);
      relatedResult.externalScores = [
        createMockExternalResultDetail(101, 'R001', '10'),
        createMockExternalResultDetail(101, 'R001', ''),
      ];

      const result = (service as any).getRelatedExternalResults([relatedResult], 101);

      expect(result).toHaveLength(1);
      expect(result[0].homeValue).toBe('10');
    });

    it('should include betType and settlementStatusId from parent result', () => {
      const relatedResult = createMockResultDetail('R001', PlayerBetTypes.points, '', '', undefined, []);
      relatedResult.settlementStatusId = SettlementStatusId.Calculated;
      relatedResult.externalScores = [createMockExternalResultDetail(101, 'R001', '10')];

      const result = (service as any).getRelatedExternalResults([relatedResult], 101);

      expect(result).toHaveLength(1);
      expect(result[0].betType).toBe(PlayerBetTypes.points);
      expect(result[0].settlementStatusId).toBe(SettlementStatusId.Calculated);
    });
  });

  describe('parseRelatedResourceIds', () => {
    it('should parse comma-separated resource IDs', () => {
      const result = (service as any).parseRelatedResourceIds('R001,R002,R003');

      expect(result).toEqual(['R001', 'R002', 'R003']);
    });

    it('should trim whitespace from resource IDs', () => {
      const result = (service as any).parseRelatedResourceIds('R001 , R002 , R003');

      expect(result).toEqual(['R001', 'R002', 'R003']);
    });

    it('should filter out empty strings', () => {
      const result = (service as any).parseRelatedResourceIds('R001,,R002, ,R003');

      expect(result).toEqual(['R001', 'R002', 'R003']);
    });

    it('should return empty array for empty string', () => {
      const result = (service as any).parseRelatedResourceIds('');

      expect(result).toEqual([]);
    });
  });

  describe('hasValidStatistic', () => {
    it('should return true when resourceId starts with statistic resourceId prefix', () => {
      const oddFlex = createMockOddFlex([{ type: 'points', value: '10' }]);
      const result = (service as any).hasValidStatistic(oddFlex, '6531');

      expect(result).toBe(true);
    });

    it('should return false when resourceId does not start with any statistic prefix', () => {
      const oddFlex = createMockOddFlex([{ type: 'points', value: '10' }]);
      const result = (service as any).hasValidStatistic(oddFlex, '9999');

      expect(result).toBe(false);
    });

    it('should return false when statistic type is not in mapping', () => {
      const oddFlex = createMockOddFlex([{ type: 'unknown', value: '10' }]);
      const result = (service as any).hasValidStatistic(oddFlex, '6531');

      expect(result).toBe(false);
    });

    it('should return true when any statistic matches', () => {
      const oddFlex = createMockOddFlex([
        { type: 'points', value: '10' },
        { type: 'assists', value: '5' },
      ]);
      const result = (service as any).hasValidStatistic(oddFlex, '6561');

      expect(result).toBe(true);
    });
  });

  describe('getRelatedResults', () => {
    it('should filter results by relatedCalResources and validate statistics', () => {
      const result1 = createMockResultDetail('6531', PlayerBetTypes.points);
      const result2 = createMockResultDetail('6561', PlayerBetTypes.assists);
      const result3 = createMockResultDetail('9999', PlayerBetTypes.points);

      const oddFlex = createMockOddFlex([{ type: 'points', value: '10' }]);
      const changedResultDetail = createMockResultDetail(
        'R001',
        PlayerBetTypes.performance,
        '6531,6561,9999',
        '',
        [oddFlex]
      );

      const result = (service as any).getRelatedResults(
        [result1, result2, result3],
        changedResultDetail,
        oddFlex
      );

      expect(result).toHaveLength(1);
      expect(result[0].resourceId).toBe('6531');
    });

    it('should return empty array when no relatedCalResources', () => {
      const result1 = createMockResultDetail('6531', PlayerBetTypes.points);
      const oddFlex = createMockOddFlex();
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.performance, '', '', [oddFlex]);

      const result = (service as any).getRelatedResults([result1], changedResultDetail, oddFlex);

      expect(result).toHaveLength(0);
    });
  });
});
