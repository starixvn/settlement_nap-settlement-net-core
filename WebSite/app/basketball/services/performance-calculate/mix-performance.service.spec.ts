import { TestBed } from '@angular/core/testing';
import { MixPerformanceService } from './mix-performance.service';
import { MixPerformanceCalculateService } from './mix-performance-calculate.service';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import { PlayerBetTypes, PlayerTypes } from '../../constants';
import { SettlementStatusId } from '../../../shared/constants';

describe('MixPerformanceService', () => {
  let service: MixPerformanceService;
  let mockMixPerformanceCalculateService: jest.Mocked<MixPerformanceCalculateService>;

  beforeEach(() => {
    mockMixPerformanceCalculateService = {
      autoFillMixPerformance: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        MixPerformanceService,
        { provide: MixPerformanceCalculateService, useValue: mockMixPerformanceCalculateService },
      ],
    });

    service = TestBed.inject(MixPerformanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  function createMockResultDetail(
    resourceId: string,
    betType: string,
    homeValue: string = '',
    relatedCalResources: string = '',
    settlementStatusId: number = SettlementStatusId.Running
  ): ResultDetail {
    return {
      resourceId,
      betType,
      homeValue,
      relatedCalResources,
      settlementStatusId,
    } as ResultDetail;
  }

  describe('autoFillMixPerformance', () => {
    it('should return early when betType is not in baseStats', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.doubleDouble, '10');
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });

    it('should return early when homeValue is empty string', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '');
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });

    it('should call autoFillMixPerformance for performance betType with matching resourceId', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R001,R002',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledWith(
        resultDetails,
        performanceResult,
        finalResult
      );
    });

    it('should handle comma-separated relatedCalResources with spaces', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R001, R002 , R003',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalled();
    });

    it('should not call autoFillMixPerformance when settlementStatusId is not Running', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R001',
        SettlementStatusId.Calculated
      );
      const resultDetails = [performanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });

    it('should only call autoFillMixPerformance for Running status results', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const performanceResult1 = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R001',
        SettlementStatusId.Running
      );
      const performanceResult2 = createMockResultDetail(
        'PERF002',
        PlayerBetTypes.performance,
        '',
        'R001',
        SettlementStatusId.Calculated
      );
      const performanceResult3 = createMockResultDetail(
        'PERF003',
        PlayerBetTypes.performance,
        '',
        'R001',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult1, performanceResult2, performanceResult3];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledTimes(2);
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledWith(
        resultDetails,
        performanceResult1,
        finalResult
      );
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledWith(
        resultDetails,
        performanceResult3,
        finalResult
      );
    });

    it('should not call autoFillMixPerformance when resourceId is not in relatedCalResources', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R002,R003',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });

    it('should handle all baseStats betTypes', () => {
      const finalResult = createMockResultDetail('FT', '', '');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R001',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult];

      // Test points
      const pointsResult = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      service.autoFillMixPerformance(resultDetails, pointsResult, finalResult);
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalled();

      mockMixPerformanceCalculateService.autoFillMixPerformance.mockClear();

      // Test rebounds
      const reboundsResult = createMockResultDetail('R001', PlayerBetTypes.rebounds, '10');
      service.autoFillMixPerformance(resultDetails, reboundsResult, finalResult);
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalled();

      mockMixPerformanceCalculateService.autoFillMixPerformance.mockClear();

      // Test assists
      const assistsResult = createMockResultDetail('R001', PlayerBetTypes.assists, '5');
      service.autoFillMixPerformance(resultDetails, assistsResult, finalResult);
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalled();

      mockMixPerformanceCalculateService.autoFillMixPerformance.mockClear();

      // Test steals
      const stealsResult = createMockResultDetail('R001', PlayerBetTypes.steals, '3');
      service.autoFillMixPerformance(resultDetails, stealsResult, finalResult);
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalled();

      mockMixPerformanceCalculateService.autoFillMixPerformance.mockClear();

      // Test shotsScored
      const shotsScoredResult = createMockResultDetail('R001', PlayerBetTypes.shotsScored, '8');
      service.autoFillMixPerformance(resultDetails, shotsScoredResult, finalResult);
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalled();
    });

    it('should handle undefined relatedCalResources gracefully', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        undefined as any,
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      // This should not throw, but also should not match
      expect(() => {
        service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);
      }).not.toThrow();

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });

    it('should handle empty relatedCalResources', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        '',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });

    it('should handle empty resultDetails array', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const resultDetails: ResultDetail[] = [];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).not.toHaveBeenCalled();
    });

    it('should filter out non-performance betTypes', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R001',
        SettlementStatusId.Running
      );
      const nonPerformanceResult = createMockResultDetail(
        'OTHER001',
        PlayerBetTypes.doubleDouble,
        '',
        'R001',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult, nonPerformanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledTimes(1);
      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalledWith(
        resultDetails,
        performanceResult,
        finalResult
      );
    });

    it('should handle resourceId matching at different positions in relatedCalResources', () => {
      const changedResultDetail = createMockResultDetail('R002', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R001,R002,R003',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalled();
    });

    it('should handle resourceId at the beginning of relatedCalResources', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R001,R002',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalled();
    });

    it('should handle resourceId at the end of relatedCalResources', () => {
      const changedResultDetail = createMockResultDetail('R003', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R001,R002,R003',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalled();
    });

    it('should handle single resourceId in relatedCalResources', () => {
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points, '25');
      const performanceResult = createMockResultDetail(
        'PERF001',
        PlayerBetTypes.performance,
        '',
        'R001',
        SettlementStatusId.Running
      );
      const resultDetails = [performanceResult];
      const finalResult = createMockResultDetail('FT', '', '');

      service.autoFillMixPerformance(resultDetails, changedResultDetail, finalResult);

      expect(mockMixPerformanceCalculateService.autoFillMixPerformance).toHaveBeenCalled();
    });
  });
});
