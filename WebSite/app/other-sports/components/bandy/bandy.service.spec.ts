import { TestBed } from '@angular/core/testing';
import { BandyService } from './bandy.service';
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
import { AioService } from '../../../shared/services';
import { CalculateAction } from '../../../shared/constants';
import { ResultDetail } from '../../../shared/models/sportsbook-sop/result-detail.model';
import { Result } from '../../../shared/models/result.model';

describe('BandyService', () => {
  let service: BandyService;
  let intervalBackgroundPipe: jest.Mocked<IntervalBackgroundPipe>;
  let aioService: jest.Mocked<AioService>;

  const mockMatchDetail = {
    matchId: 12345,
    sportType: 1,
    homeTeam: 'Team A',
    awayTeam: 'Team B'
  };

  const mockResultDetails: ResultDetail[] = [
    {
      resourceId: '01',
      homeValue: '1',
      awayValue: '0',
      resultSettingData: null
    } as ResultDetail,
    {
      resourceId: '0001',
      homeValue: '2',
      awayValue: '1',
      resultSettingData: null
    } as ResultDetail
  ];

  beforeEach(() => {
    const intervalBackgroundPipeSpy = {
      transform: jest.fn()
    };

    const aioServiceSpy = {
      push: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        BandyService,
        { provide: IntervalBackgroundPipe, useValue: intervalBackgroundPipeSpy },
        { provide: AioService, useValue: aioServiceSpy }
      ]
    });

    service = TestBed.inject(BandyService);
    intervalBackgroundPipe = TestBed.inject(IntervalBackgroundPipe) as jest.Mocked<IntervalBackgroundPipe>;
    aioService = TestBed.inject(AioService) as jest.Mocked<AioService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getIntervalBackground', () => {
    it('should call intervalBackgroundPipe.transform with settlementStatusId', () => {
      // Arrange
      const settlementStatusId = 5;
      const expectedResult = 'calculated';
      intervalBackgroundPipe.transform.mockReturnValue(expectedResult);

      // Act
      const result = service.getIntervalBackground(settlementStatusId);

      // Assert
      expect(intervalBackgroundPipe.transform).toHaveBeenCalledWith(settlementStatusId);
      expect(result).toBe(expectedResult);
    });

    it('should return the result from intervalBackgroundPipe.transform', () => {
      // Arrange
      const settlementStatusId = 3;
      const expectedResult = 'refunded';
      intervalBackgroundPipe.transform.mockReturnValue(expectedResult);

      // Act
      const result = service.getIntervalBackground(settlementStatusId);

      // Assert
      expect(result).toBe(expectedResult);
    });
  });

  describe('sendSettleRequest', () => {
    const defaultParams = {
      type: CalculateAction.calculate,
      matchDetail: mockMatchDetail,
      resultDetails: mockResultDetails,
      isReSettledTickets: false,
      isScoreDirect: true,
      isLeader: false,
      refResultStatus: null,
      betStatus: 'active'
    };

    beforeEach(() => {
      const mockResult = new Result();
      mockResult.isSuccessful = true;
      mockResult.errCode = 0;
      mockResult.errMsg = '';
      aioService.push.mockResolvedValue(mockResult);
    });

    it('should create SettleQuery with correct parameters', async () => {
      // Arrange
      const params = { ...defaultParams };

      // Act
      await service.sendSettleRequest(params);

      // Assert
      expect(aioService.push).toHaveBeenCalledWith(
        expect.objectContaining({
          matchId: mockMatchDetail.matchId,
          selectedResources: mockResultDetails,
          actionName: CalculateAction.calculate,
          apikey: 'bandy',
          isReSettledTickets: false,
          isLeader: false,
          isDirectly: true,
          betStatus: 'active',
          refResultStatus: null,
          sportType: mockMatchDetail.sportType
        })
      );
    });

    it('should set apikey to "bandy"', async () => {
      // Arrange
      const params = { ...defaultParams };

      // Act
      await service.sendSettleRequest(params);

      // Assert
      expect(aioService.push).toHaveBeenCalledWith(
        expect.objectContaining({
          apikey: 'bandy'
        })
      );
    });

    it('should handle isLeader parameter correctly', async () => {
      // Arrange
      const params = { ...defaultParams, isLeader: true };

      // Act
      await service.sendSettleRequest(params);

      // Assert
      expect(aioService.push).toHaveBeenCalledWith(
        expect.objectContaining({
          isLeader: true
        })
      );
    });

    it('should handle refResultStatus parameter correctly', async () => {
      // Arrange
      const params = { ...defaultParams, refResultStatus: 5 };

      // Act
      await service.sendSettleRequest(params);

      // Assert
      expect(aioService.push).toHaveBeenCalledWith(
        expect.objectContaining({
          refResultStatus: 5
        })
      );
    });

    it('should handle betStatus parameter correctly', async () => {
      // Arrange
      const params = { ...defaultParams, betStatus: 'settled' };

      // Act
      await service.sendSettleRequest(params);

      // Assert
      expect(aioService.push).toHaveBeenCalledWith(
        expect.objectContaining({
          betStatus: 'settled'
        })
      );
    });

    describe('when type is unCalculate', () => {
      it('should clear homeValue and awayValue for all resultDetails', async () => {
        // Arrange
        const params = { ...defaultParams, type: CalculateAction.unCalculate };
        const resultDetailsWithValues = [
          { ...mockResultDetails[0], homeValue: '1', awayValue: '0' },
          { ...mockResultDetails[1], homeValue: '2', awayValue: '1' }
        ];
        params.resultDetails = resultDetailsWithValues;

        // Act
        await service.sendSettleRequest(params);

        // Assert
        expect(resultDetailsWithValues[0].homeValue).toBe('');
        expect(resultDetailsWithValues[0].awayValue).toBe('');
        expect(resultDetailsWithValues[1].homeValue).toBe('');
        expect(resultDetailsWithValues[1].awayValue).toBe('');
      });

      it('should still call aioService.push after clearing values', async () => {
        // Arrange
        const params = { ...defaultParams, type: CalculateAction.unCalculate };

        // Act
        await service.sendSettleRequest(params);

        // Assert
        expect(aioService.push).toHaveBeenCalledTimes(1);
      });
    });

    describe('when type is not unCalculate', () => {
      it('should not modify resultDetails values', async () => {
        // Arrange
        const params = { ...defaultParams, type: CalculateAction.calculate };
        const originalHomeValue = mockResultDetails[0].homeValue;
        const originalAwayValue = mockResultDetails[0].awayValue;

        // Act
        await service.sendSettleRequest(params);

        // Assert
        expect(mockResultDetails[0].homeValue).toBe(originalHomeValue);
        expect(mockResultDetails[0].awayValue).toBe(originalAwayValue);
      });
    });

    it('should return the result from aioService.push', async () => {
      // Arrange
      const params = { ...defaultParams };
      const expectedResult = new Result();
      expectedResult.isSuccessful = true;
      expectedResult.errCode = 0;
      expectedResult.errMsg = 'Settlement completed';
      aioService.push.mockResolvedValue(expectedResult);

      // Act
      const result = await service.sendSettleRequest(params);

      // Assert
      expect(result).toBe(expectedResult);
    });

    it('should handle different CalculateAction types', async () => {
      // Arrange
      const actionTypes = [
        CalculateAction.calculate,
        CalculateAction.refund,
        CalculateAction.earlyCalculate,
        CalculateAction.calculateHalfTime,
        CalculateAction.calculateFullTime
      ];

      for (const actionType of actionTypes) {
        const params = { ...defaultParams, type: actionType };
        
        // Act
        await service.sendSettleRequest(params);

        // Assert
        expect(aioService.push).toHaveBeenCalledWith(
          expect.objectContaining({
            actionName: actionType
          })
        );
      }
    });

    it('should handle empty resultDetails array', async () => {
      // Arrange
      const params = { ...defaultParams, resultDetails: [] };

      // Act
      await service.sendSettleRequest(params);

      // Assert
      expect(aioService.push).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedResources: []
        })
      );
    });

    it('should handle aioService.push rejection', async () => {
      // Arrange
      const params = { ...defaultParams };
      const error = new Error('API Error');
      aioService.push.mockRejectedValue(error);

      // Act & Assert
      await expect(service.sendSettleRequest(params)).rejects.toThrow('API Error');
    });

    it('should use default values for optional parameters', async () => {
      // Arrange
      const params = {
        type: CalculateAction.calculate,
        matchDetail: mockMatchDetail,
        resultDetails: mockResultDetails,
        isReSettledTickets: false,
        isScoreDirect: true,
        isLeader: false,
        refResultStatus: null,
        betStatus: ''
      };

      // Act
      await service.sendSettleRequest(params);

      // Assert
      expect(aioService.push).toHaveBeenCalledWith(
        expect.objectContaining({
          isLeader: false,
          refResultStatus: null,
          betStatus: ''
        })
      );
    });
  });
});
