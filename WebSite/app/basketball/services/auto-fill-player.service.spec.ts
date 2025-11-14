import { TestBed } from '@angular/core/testing';
import { AutoFillPlayerService } from './auto-fill-player.service';
import { MixMultiStatsCalculateService } from './mix-multi-stats-calculate.service';
import { MixDoubleDoubleCalculateService } from './mix-double-double-calculate.service';
import { MixHeadHeadCalculateService } from './mix-head-head.service.calculate';
import { MixPerformanceCalculateService } from './performance-calculate/mix-performance-calculate.service';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { PlayerBetTypes, PlayerTypes } from '../constants';
import { SettlementStatusId } from '../../shared/constants';

describe('AutoFillPlayerService', () => {
  let service: AutoFillPlayerService;
  let mockMixMultiStatsCalculateService: jest.Mocked<MixMultiStatsCalculateService>;
  let mockMixDoubleDoubleCalculateService: jest.Mocked<MixDoubleDoubleCalculateService>;
  let mockMixHeadHeadCalculateService: jest.Mocked<MixHeadHeadCalculateService>;
  let mockMixPerformanceCalculateService: jest.Mocked<MixPerformanceCalculateService>;

  beforeEach(() => {
    mockMixMultiStatsCalculateService = {
      calculateReboundsAssistsValue: jest.fn(),
      calculateReboundsPointsValue: jest.fn(),
      calculateReboundsAssistsPointsValue: jest.fn(),
      calculateStealsBlocksValue: jest.fn(),
    } as any;

    mockMixDoubleDoubleCalculateService = {
      calculateDoubleDoubleValue: jest.fn(),
      calculateTripleDoubleValue: jest.fn(),
    } as any;

    mockMixHeadHeadCalculateService = {
      calculateMixHeadHeadValue: jest.fn(),
    } as any;

    mockMixPerformanceCalculateService = {
      autoFillMixPerformance: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AutoFillPlayerService,
        { provide: MixMultiStatsCalculateService, useValue: mockMixMultiStatsCalculateService },
        { provide: MixDoubleDoubleCalculateService, useValue: mockMixDoubleDoubleCalculateService },
        { provide: MixHeadHeadCalculateService, useValue: mockMixHeadHeadCalculateService },
        { provide: MixPerformanceCalculateService, useValue: mockMixPerformanceCalculateService },
      ],
    });

    service = TestBed.inject(AutoFillPlayerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  function createMockResultDetail(
    resourceId: string,
    betType: string,
    settlementStatusId: number = SettlementStatusId.Running
  ): ResultDetail {
    return {
      resourceId,
      betType,
      settlementStatusId,
      homeValue: '',
      checked: false,
    } as ResultDetail;
  }

  describe('autoFillPlayerName', () => {
    it('should filter results by targetBetTypes and Running status', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.doubleDouble, SettlementStatusId.Running),
        createMockResultDetail('R003', PlayerBetTypes.points, SettlementStatusId.Running), // Not in targetBetTypes
        createMockResultDetail('R004', PlayerBetTypes.reboundsAssists, SettlementStatusId.Calculated), // Not Running
      ];
      const finalResult = createMockResultDetail('FT', '');

      service.autoFillPlayerName(resultDetails, finalResult);

      // Should only process R001 and R002
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetails[0]
      );
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetails[1]
      );
    });

    it('should call all calculation methods for each filtered result', () => {
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, SettlementStatusId.Running);
      const resultDetails = [resultDetail];
      const finalResult = createMockResultDetail('FT', '');

      const calculateMultiStatsSpy = jest.spyOn(service as any, 'calculateMultiStats');
      const calculateDoubleTripleDoubleSpy = jest.spyOn(service as any, 'calculateDoubleTripleDouble');
      const calculateHeadToHeadSpy = jest.spyOn(service as any, 'calculateHeadToHead');
      const calculatePerformanceSpy = jest.spyOn(service as any, 'calculatePerformance');

      service.autoFillPlayerName(resultDetails, finalResult);

      expect(calculateMultiStatsSpy).toHaveBeenCalledWith(resultDetails, resultDetail);
      expect(calculateDoubleTripleDoubleSpy).toHaveBeenCalledWith(resultDetails, resultDetail);
      expect(calculateHeadToHeadSpy).toHaveBeenCalledWith(resultDetails, resultDetail);
      expect(calculatePerformanceSpy).toHaveBeenCalledWith(resultDetails, resultDetail, finalResult);
    });

    it('should handle empty resultDetails array', () => {
      const resultDetails: ResultDetail[] = [];
      const finalResult = createMockResultDetail('FT', '');

      service.autoFillPlayerName(resultDetails, finalResult);

      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).not.toHaveBeenCalled();
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).not.toHaveBeenCalled();
    });

    it('should handle multiple filtered results', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.doubleDouble, SettlementStatusId.Running),
        createMockResultDetail('R003', PlayerBetTypes.mostPoints, SettlementStatusId.Running),
      ];
      const finalResult = createMockResultDetail('FT', '');

      service.autoFillPlayerName(resultDetails, finalResult);

      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).toHaveBeenCalledTimes(1);
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalledTimes(1);
      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).toHaveBeenCalledTimes(1);
    });
  });

  describe('calculateMultiStats', () => {
    it('should call calculateReboundsAssistsPointsValue for reboundsAssistsPoints betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.reboundsAssistsPoints);

      service['calculateMultiStats'](resultDetails, resultDetail);

      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsPointsValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should call calculateReboundsAssistsValue for reboundsAssists betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.reboundsAssists);

      service['calculateMultiStats'](resultDetails, resultDetail);

      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should call calculateReboundsPointsValue for reboundsPoints betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.reboundsPoints);

      service['calculateMultiStats'](resultDetails, resultDetail);

      expect(mockMixMultiStatsCalculateService.calculateReboundsPointsValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should call calculateStealsBlocksValue for stealsBlocks betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.stealsBlocks);

      service['calculateMultiStats'](resultDetails, resultDetail);

      expect(mockMixMultiStatsCalculateService.calculateStealsBlocksValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should not call any method for non-multi-stats betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.doubleDouble);

      service['calculateMultiStats'](resultDetails, resultDetail);

      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsPointsValue).not.toHaveBeenCalled();
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).not.toHaveBeenCalled();
      expect(mockMixMultiStatsCalculateService.calculateReboundsPointsValue).not.toHaveBeenCalled();
      expect(mockMixMultiStatsCalculateService.calculateStealsBlocksValue).not.toHaveBeenCalled();
    });
  });

  describe('calculateDoubleTripleDouble', () => {
    it('should call calculateDoubleDoubleValue for doubleDouble betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.doubleDouble);

      service['calculateDoubleTripleDouble'](resultDetails, resultDetail);

      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should call calculateTripleDoubleValue for tripleDouble betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.tripleDouble);

      service['calculateDoubleTripleDouble'](resultDetails, resultDetail);

      expect(mockMixDoubleDoubleCalculateService.calculateTripleDoubleValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should not call any method for non-double/triple betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.reboundsAssists);

      service['calculateDoubleTripleDouble'](resultDetails, resultDetail);

      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).not.toHaveBeenCalled();
      expect(mockMixDoubleDoubleCalculateService.calculateTripleDoubleValue).not.toHaveBeenCalled();
    });
  });

  describe('calculateHeadToHead', () => {
    it('should call calculateMixHeadHeadValue for mostPoints betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.mostPoints);

      service['calculateHeadToHead'](resultDetails, resultDetail);

      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should call calculateMixHeadHeadValue for mostRebounds betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.mostRebounds);

      service['calculateHeadToHead'](resultDetails, resultDetail);

      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should call calculateMixHeadHeadValue for mostAssists betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.mostAssists);

      service['calculateHeadToHead'](resultDetails, resultDetail);

      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should call calculateMixHeadHeadValue for mostSteals betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.mostSteals);

      service['calculateHeadToHead'](resultDetails, resultDetail);

      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should call calculateMixHeadHeadValue for mostPointShotsScored betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.mostPointShotsScored);

      service['calculateHeadToHead'](resultDetails, resultDetail);

      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
    });

    it('should not call calculateMixHeadHeadValue for non-headToHead betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.doubleDouble);

      service['calculateHeadToHead'](resultDetails, resultDetail);

      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).not.toHaveBeenCalled();
    });
  });

  describe('calculatePerformance', () => {
    it('should call autoFillMixPerformance for performance betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.performance);
      const finalResult = createMockResultDetail('FT', '');

      service['calculatePerformance'](resultDetails, resultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledWith(
        resultDetails,
        resultDetail,
        finalResult
      );
    });

    it('should call autoFillMixPerformance for performanceDouble betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.performanceDouble);
      const finalResult = createMockResultDetail('FT', '');

      service['calculatePerformance'](resultDetails, resultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledWith(
        resultDetails,
        resultDetail,
        finalResult
      );
    });

    it('should call autoFillMixPerformance for performanceTriple betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.performanceTriple);
      const finalResult = createMockResultDetail('FT', '');

      service['calculatePerformance'](resultDetails, resultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledWith(
        resultDetails,
        resultDetail,
        finalResult
      );
    });

    it('should not call autoFillMixPerformance for non-performance betType', () => {
      const resultDetails: ResultDetail[] = [];
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.doubleDouble);
      const finalResult = createMockResultDetail('FT', '');

      service['calculatePerformance'](resultDetails, resultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });
  });

  describe('integration scenarios', () => {
    it('should process reboundsAssists betType correctly', () => {
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, SettlementStatusId.Running);
      const resultDetails = [resultDetail];
      const finalResult = createMockResultDetail('FT', '');

      service.autoFillPlayerName(resultDetails, finalResult);

      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).not.toHaveBeenCalled();
      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).not.toHaveBeenCalled();
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });

    it('should process doubleDouble betType correctly', () => {
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.doubleDouble, SettlementStatusId.Running);
      const resultDetails = [resultDetail];
      const finalResult = createMockResultDetail('FT', '');

      service.autoFillPlayerName(resultDetails, finalResult);

      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).not.toHaveBeenCalled();
      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).not.toHaveBeenCalled();
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });

    it('should process mostPoints betType correctly', () => {
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.mostPoints, SettlementStatusId.Running);
      const resultDetails = [resultDetail];
      const finalResult = createMockResultDetail('FT', '');

      service.autoFillPlayerName(resultDetails, finalResult);

      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).toHaveBeenCalledWith(
        resultDetails,
        resultDetail
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).not.toHaveBeenCalled();
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).not.toHaveBeenCalled();
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });

    it('should process performance betType correctly', () => {
      const resultDetail = createMockResultDetail('R001', PlayerBetTypes.performance, SettlementStatusId.Running);
      const resultDetails = [resultDetail];
      const finalResult = createMockResultDetail('FT', '');

      service.autoFillPlayerName(resultDetails, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledWith(
        resultDetails,
        resultDetail,
        finalResult
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).not.toHaveBeenCalled();
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).not.toHaveBeenCalled();
      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).not.toHaveBeenCalled();
    });

    it('should process multiple different betTypes in one call', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.doubleDouble, SettlementStatusId.Running),
        createMockResultDetail('R003', PlayerBetTypes.mostPoints, SettlementStatusId.Running),
        createMockResultDetail('R004', PlayerBetTypes.performance, SettlementStatusId.Running),
      ];
      const finalResult = createMockResultDetail('FT', '');

      service.autoFillPlayerName(resultDetails, finalResult);

      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).toHaveBeenCalledTimes(1);
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalledTimes(1);
      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).toHaveBeenCalledTimes(1);
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledTimes(1);
    });

    it('should exclude results with non-Running settlementStatusId', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.reboundsAssists, SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.doubleDouble, SettlementStatusId.Calculated),
        createMockResultDetail('R003', PlayerBetTypes.mostPoints, SettlementStatusId.Refund),
      ];
      const finalResult = createMockResultDetail('FT', '');

      service.autoFillPlayerName(resultDetails, finalResult);

      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).toHaveBeenCalledTimes(1);
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).not.toHaveBeenCalled();
      expect(mockMixHeadHeadCalculateService.calculateMixHeadHeadValue).not.toHaveBeenCalled();
    });

    it('should exclude results not in targetBetTypes', () => {
      const resultDetails = [
        createMockResultDetail('R001', PlayerBetTypes.points, SettlementStatusId.Running),
        createMockResultDetail('R002', PlayerBetTypes.rebounds, SettlementStatusId.Running),
        createMockResultDetail('R003', PlayerBetTypes.reboundsAssists, SettlementStatusId.Running),
      ];
      const finalResult = createMockResultDetail('FT', '');

      service.autoFillPlayerName(resultDetails, finalResult);

      // Only reboundsAssists should be processed
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).toHaveBeenCalledTimes(1);
    });
  });
});
