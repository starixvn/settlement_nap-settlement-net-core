import { TestBed } from '@angular/core/testing';
import { MixDoubleDoubleService } from './mix-double-double.service';
import { MixCoreService } from './mix-core.service';
import { MixDoubleDoubleCalculateService } from './mix-double-double-calculate.service';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { PlayerBetTypes } from '../constants';

describe('MixDoubleDoubleService', () => {
  let service: MixDoubleDoubleService;
  let mockMixCoreService: jest.Mocked<MixCoreService>;
  let mockMixDoubleDoubleCalculateService: jest.Mocked<MixDoubleDoubleCalculateService>;

  beforeEach(() => {
    mockMixCoreService = {
      findMixResultByBetType: jest.fn(),
    } as any;

    mockMixDoubleDoubleCalculateService = {
      calculateDoubleDoubleValue: jest.fn(),
      calculateTripleDoubleValue: jest.fn(),
    } as any;

    TestBed.configureTestingModule({
      providers: [
        MixDoubleDoubleService,
        { provide: MixCoreService, useValue: mockMixCoreService },
        { provide: MixDoubleDoubleCalculateService, useValue: mockMixDoubleDoubleCalculateService },
      ],
    });

    service = TestBed.inject(MixDoubleDoubleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have correct targetBetTypes', () => {
    expect(service.targetBetTypes).toEqual([
      PlayerBetTypes.points,
      PlayerBetTypes.assists,
      PlayerBetTypes.rebounds,
      PlayerBetTypes.steals,
      PlayerBetTypes.blocks,
    ]);
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

  describe('autoFillMixDoubleDouble', () => {
    it('should return early when betType is not in targetBetTypes', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.doubleDouble);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).not.toHaveBeenCalled();
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).not.toHaveBeenCalled();
      expect(mockMixDoubleDoubleCalculateService.calculateTripleDoubleValue).not.toHaveBeenCalled();
    });

    it('should process doubleDouble when found for points betType', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);
      const doubleDoubleResult = createMockResultDetail('R002', PlayerBetTypes.doubleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(doubleDoubleResult);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(
        resultDetails,
        'R001',
        PlayerBetTypes.doubleDouble
      );
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalledWith(
        resultDetails,
        doubleDoubleResult
      );
    });

    it('should process tripleDouble when found for points betType', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);
      const tripleDoubleResult = createMockResultDetail('R003', PlayerBetTypes.tripleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType
        .mockReturnValueOnce(undefined) // doubleDouble not found
        .mockReturnValueOnce(tripleDoubleResult); // tripleDouble found

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledWith(
        resultDetails,
        'R001',
        PlayerBetTypes.tripleDouble
      );
      expect(mockMixDoubleDoubleCalculateService.calculateTripleDoubleValue).toHaveBeenCalledWith(
        resultDetails,
        tripleDoubleResult
      );
    });

    it('should process both doubleDouble and tripleDouble when both found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);
      const doubleDoubleResult = createMockResultDetail('R002', PlayerBetTypes.doubleDouble, 'R001');
      const tripleDoubleResult = createMockResultDetail('R003', PlayerBetTypes.tripleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType
        .mockReturnValueOnce(doubleDoubleResult)
        .mockReturnValueOnce(tripleDoubleResult);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalledWith(
        resultDetails,
        doubleDoubleResult
      );
      expect(mockMixDoubleDoubleCalculateService.calculateTripleDoubleValue).toHaveBeenCalledWith(
        resultDetails,
        tripleDoubleResult
      );
    });

    it('should not process when doubleDouble is not found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);

      mockMixCoreService.findMixResultByBetType.mockReturnValue(undefined);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalledTimes(2);
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).not.toHaveBeenCalled();
      expect(mockMixDoubleDoubleCalculateService.calculateTripleDoubleValue).not.toHaveBeenCalled();
    });

    it('should process doubleDouble for assists betType', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.assists);
      const doubleDoubleResult = createMockResultDetail('R002', PlayerBetTypes.doubleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(doubleDoubleResult);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalled();
    });

    it('should process doubleDouble for rebounds betType', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.rebounds);
      const doubleDoubleResult = createMockResultDetail('R002', PlayerBetTypes.doubleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(doubleDoubleResult);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalled();
    });

    it('should process doubleDouble for steals betType', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.steals);
      const doubleDoubleResult = createMockResultDetail('R002', PlayerBetTypes.doubleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(doubleDoubleResult);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalled();
    });

    it('should process doubleDouble for blocks betType', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.blocks);
      const doubleDoubleResult = createMockResultDetail('R002', PlayerBetTypes.doubleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(doubleDoubleResult);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalled();
    });

    it('should call findMixResultByBetType with correct parameters for doubleDouble', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);
      const doubleDoubleResult = createMockResultDetail('R002', PlayerBetTypes.doubleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType.mockReturnValue(doubleDoubleResult);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenNthCalledWith(
        1,
        resultDetails,
        'R001',
        PlayerBetTypes.doubleDouble
      );
    });

    it('should call findMixResultByBetType with correct parameters for tripleDouble', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);
      const tripleDoubleResult = createMockResultDetail('R003', PlayerBetTypes.tripleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(tripleDoubleResult);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenNthCalledWith(
        2,
        resultDetails,
        'R001',
        PlayerBetTypes.tripleDouble
      );
    });

    it('should process doubleDouble even when tripleDouble is not found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);
      const doubleDoubleResult = createMockResultDetail('R002', PlayerBetTypes.doubleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType
        .mockReturnValueOnce(doubleDoubleResult)
        .mockReturnValueOnce(undefined);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).toHaveBeenCalled();
      expect(mockMixDoubleDoubleCalculateService.calculateTripleDoubleValue).not.toHaveBeenCalled();
    });

    it('should process tripleDouble even when doubleDouble is not found', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);
      const tripleDoubleResult = createMockResultDetail('R003', PlayerBetTypes.tripleDouble, 'R001');

      mockMixCoreService.findMixResultByBetType
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce(tripleDoubleResult);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).not.toHaveBeenCalled();
      expect(mockMixDoubleDoubleCalculateService.calculateTripleDoubleValue).toHaveBeenCalled();
    });

    it('should handle empty resultDetails array', () => {
      const resultDetails: ResultDetail[] = [];
      const changedResultDetail = createMockResultDetail('R001', PlayerBetTypes.points);

      mockMixCoreService.findMixResultByBetType.mockReturnValue(undefined);

      service.autoFillMixDoubleDouble(resultDetails, changedResultDetail);

      expect(mockMixCoreService.findMixResultByBetType).toHaveBeenCalled();
      expect(mockMixDoubleDoubleCalculateService.calculateDoubleDoubleValue).not.toHaveBeenCalled();
    });
  });
});
