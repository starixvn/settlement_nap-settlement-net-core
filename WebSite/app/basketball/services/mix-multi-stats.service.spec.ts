import { TestBed } from '@angular/core/testing';
import { MixMultiStatsService } from './mix-multi-stats.service';
import { MixCoreService } from './mix-core.service';
import { MixMultiStatsCalculateService } from './mix-multi-stats-calculate.service';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { Resources, PlayerBetTypes } from '../constants';

describe('MixMultiStatsService', () => {
  let service: MixMultiStatsService;
  let mockMixCoreService: jest.Mocked<MixCoreService>;
  let mockMixMultiStatsCalculateService: jest.Mocked<MixMultiStatsCalculateService>;

  beforeEach(() => {
    mockMixCoreService = {
      findMixResultByBetType: jest.fn(),
    } as any;

    mockMixMultiStatsCalculateService = {
      calculateReboundsAssistsValue: jest.fn(),
      calculateReboundsPointsValue: jest.fn(),
      calculateReboundsAssistsPointsValue: jest.fn(),
      calculateStealsBlocksValue: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        MixMultiStatsService,
        { provide: MixCoreService, useValue: mockMixCoreService },
        { provide: MixMultiStatsCalculateService, useValue: mockMixMultiStatsCalculateService },
      ],
    });

    service = TestBed.inject(MixMultiStatsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  function createMockResultDetail(
    resourceId: string,
    betType: string,
    relatedCalResources: string = ''
  ): ResultDetail {
    return {
      resourceId,
      betType,
      relatedCalResources,
      homeValue: '',
      checked: false,
    } as ResultDetail;
  }

  describe('autoFillMixReboundsAssists', () => {
    it('should call all four handler methods', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);

      const handleReboundsAssistsSpy = jest.spyOn(service as any, 'handleReboundsAssistsMix');
      const handleReboundsPointsSpy = jest.spyOn(service as any, 'handleReboundsPointsMix');
      const handleReboundsAssistsPointsSpy = jest.spyOn(service as any, 'handleReboundsAssistsPointsMix');
      const handleStealsBlocksSpy = jest.spyOn(service as any, 'handleStealsBlocksMix');

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(handleReboundsAssistsSpy).toHaveBeenCalledWith(resultDetails, changedResultDetail);
      expect(handleReboundsPointsSpy).toHaveBeenCalledWith(resultDetails, changedResultDetail);
      expect(handleReboundsAssistsPointsSpy).toHaveBeenCalledWith(resultDetails, changedResultDetail);
      expect(handleStealsBlocksSpy).toHaveBeenCalledWith(resultDetails, changedResultDetail);
    });
  });

  describe('handleReboundsAssistsMix', () => {
    it('should calculate when betType is in mixReboundsAssists and result is found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.assists);
      const reboundsAssistsResult = createMockResultDetail('R002', PlayerBetTypes.reboundsAssists, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(reboundsAssistsResult);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(
        resultDetails,
        'R001',
        PlayerBetTypes.reboundsAssists
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).toHaveBeenCalledWith(
        resultDetails,
        reboundsAssistsResult
      );
    });

    it('should not calculate when betType is not in mixReboundsAssists', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        PlayerBetTypes.reboundsAssists
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).not.toHaveBeenCalled();
    });

    it('should not calculate when result is not found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.assists);

      mockMixCoreService.findMixResultByBetType.mockReturnValue(undefined);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalled();
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).not.toHaveBeenCalled();
    });

    it('should handle when betType is rebounds (part of mixReboundsAssists)', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.rebounds);
      const reboundsAssistsResult = createMockResultDetail('R002', PlayerBetTypes.reboundsAssists, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(reboundsAssistsResult);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(
        resultDetails,
        'R001',
        PlayerBetTypes.reboundsAssists
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsValue).toHaveBeenCalled();
    });
  });

  describe('handleReboundsPointsMix', () => {
    it('should calculate when betType is in mixReboundsPoints and result is found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);
      const reboundsPointsResult = createMockResultDetail('R002', PlayerBetTypes.reboundsPoints, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(reboundsPointsResult);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(
        resultDetails,
        'R001',
        PlayerBetTypes.reboundsPoints
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsPointsValue).toHaveBeenCalledWith(
        resultDetails,
        reboundsPointsResult
      );
    });

    it('should not calculate when betType is not in mixReboundsPoints', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.assists);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        PlayerBetTypes.reboundsPoints
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsPointsValue).not.toHaveBeenCalled();
    });

    it('should not calculate when result is not found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);

      mockMixCoreService.findMixResultByBetType.mockReturnValue(undefined);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalled();
      expect(mockMixMultiStatsCalculateService.calculateReboundsPointsValue).not.toHaveBeenCalled();
    });

    it('should handle when betType is rebounds (part of mixReboundsPoints)', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.rebounds);
      const reboundsPointsResult = createMockResultDetail('R002', PlayerBetTypes.reboundsPoints, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(reboundsPointsResult);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(
        resultDetails,
        'R001',
        PlayerBetTypes.reboundsPoints
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsPointsValue).toHaveBeenCalled();
    });
  });

  describe('handleReboundsAssistsPointsMix', () => {
    it('should calculate when betType is in mixReboundsAssistsPoints and result is found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);
      const reboundsAssistsPointsResult = createMockResultDetail('R002', PlayerBetTypes.reboundsAssistsPoints, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(reboundsAssistsPointsResult);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(
        resultDetails,
        'R001',
        PlayerBetTypes.reboundsAssistsPoints
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsPointsValue).toHaveBeenCalledWith(
        resultDetails,
        reboundsAssistsPointsResult
      );
    });

    it('should not calculate when betType is not in mixReboundsAssistsPoints', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.steals);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        PlayerBetTypes.reboundsAssistsPoints
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsPointsValue).not.toHaveBeenCalled();
    });

    it('should not calculate when result is not found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);

      mockMixCoreService.findMixResultByBetType.mockReturnValue(undefined);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalled();
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsPointsValue).not.toHaveBeenCalled();
    });

    it('should handle when betType is assists (part of mixReboundsAssistsPoints)', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.assists);
      const reboundsAssistsPointsResult = createMockResultDetail('R002', PlayerBetTypes.reboundsAssistsPoints, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(reboundsAssistsPointsResult);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(
        resultDetails,
        'R001',
        PlayerBetTypes.reboundsAssistsPoints
      );
      expect(mockMixMultiStatsCalculateService.calculateReboundsAssistsPointsValue).toHaveBeenCalled();
    });
  });

  describe('handleStealsBlocksMix', () => {
    it('should calculate when betType is in mixStealsBlocks and result is found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.steals);
      const stealsBlocksResult = createMockResultDetail('R002', PlayerBetTypes.stealsBlocks, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(stealsBlocksResult);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(
        resultDetails,
        'R001',
        PlayerBetTypes.stealsBlocks
      );
      expect(mockMixMultiStatsCalculateService.calculateStealsBlocksValue).toHaveBeenCalledWith(
        resultDetails,
        stealsBlocksResult
      );
    });

    it('should not calculate when betType is not in mixStealsBlocks', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        PlayerBetTypes.stealsBlocks
      );
      expect(mockMixMultiStatsCalculateService.calculateStealsBlocksValue).not.toHaveBeenCalled();
    });

    it('should not calculate when result is not found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.steals);

      mockMixCoreService.findMixResultByBetType.mockReturnValue(undefined);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalled();
      expect(mockMixMultiStatsCalculateService.calculateStealsBlocksValue).not.toHaveBeenCalled();
    });

    it('should handle when betType is blocks (part of mixStealsBlocks)', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.blocks);
      const stealsBlocksResult = createMockResultDetail('R002', PlayerBetTypes.stealsBlocks, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(stealsBlocksResult);

      service.autoFillMixReboundsAssists(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(
        resultDetails,
        'R001',
        PlayerBetTypes.stealsBlocks
      );
      expect(mockMixMultiStatsCalculateService.calculateStealsBlocksValue).toHaveBeenCalled();
    });
  });
});
