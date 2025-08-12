import { TestBed } from '@angular/core/testing';
import { VerifyHoldResultHandler } from './verify-hold-result.handler';
import { RequestService } from '../../components/calc/services/request.service';
import { CalculateStorage } from '../../storage/calculate.storage';
import { CalculateBaseStorage } from '../../storage/storage.service.native';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Match, MatchDetailSoccer as MatchDetail, HedgeMatchDetail } from '../../components/calc/models/match.model';
import { Permission } from '../../../shared/models/sportsbook-sop/permission.model';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import { CalculateAction } from '../../../shared/constants';
import { ResourceIds } from '../../constants';
import { Language } from '../../../shared/language.native';
import { AbstractHandler } from '../abstract.handler.native';
import { ResultSettingModel } from '../../../shared/models/result-setting.model';
import { VerifyScoreGoalService } from '../../components/calc/services/verify-score-goal.service';

describe('VerifyHoldResultHandler', () => {
  let handler: VerifyHoldResultHandler;
  let storage: CalculateBaseStorage;
  let requestService: RequestService;

  const createMatchDetail = (): MatchDetail => ({
    matchId: 123
  } as any);

  const createResultDetail = (resourceId: string, resourceName: string, isHoldResult: boolean): ResultDetail => ({
    resourceId,
    resourceName,
    resultSettingData: {
      isHoldResult,
      isConfirmedRefund: false,
      isConfirmedRefundSdt: false,
      isConfirmedRefundMercy: false,
      iconHoldResult: ''
    } as ResultSettingModel
  } as any);

  const match: Match = {
    matchDetail: createMatchDetail(),
    permission: new Permission(),
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail:null,
    fantasyMatch: undefined,
    childMatches: [],
    externalResults: [],
    originalResultDetail: [],
    oldMatchDetail: null,
    isClickOnCalculate: false,
    isScoreDirect: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        VerifyHoldResultHandler,
        RequestService,
        CalculateStorage,
        ToastrService,
        VerifyScoreGoalService
      ]
    });

    handler = TestBed.inject(VerifyHoldResultHandler);
    storage = TestBed.inject(CalculateStorage);
    requestService = TestBed.inject(RequestService);

    // Reset match to default state
    match.matchDetail = createMatchDetail();

    // Mock storage methods
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculate);
    storage.error = jest.fn();

    // Mock services
    requestService.getResultDetail = jest.fn();
  });

  describe('handle method', () => {
    it('should call super.handle when no results are on hold for regular calculation', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', false),
        createResultDetail(ResourceIds.fullTime, 'Full Time', false)
      ];
      
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(123);
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should call super.handle when no results are on hold for half-time calculation', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', false),
        createResultDetail(ResourceIds.fullTime, 'Full Time', false)
      ];
      
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateHalfTime);
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(123);
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should show error when half-time result is on hold for regular calculation', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', true),
        createResultDetail(ResourceIds.fullTime, 'Full Time', false)
      ];
      
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(123);
      expect(storage.error).toHaveBeenCalledWith(
        Language.ResultHeld.replace('{0}', 'Half Time, Full Time')
      );
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should show error when full-time result is on hold for regular calculation', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', false),
        createResultDetail(ResourceIds.fullTime, 'Full Time', true)
      ];
      
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(123);
      expect(storage.error).toHaveBeenCalledWith(
        Language.ResultHeld.replace('{0}', 'Half Time, Full Time')
      );
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should show error when multiple results are on hold for regular calculation', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', true),
        createResultDetail(ResourceIds.fullTime, 'Full Time', true),
        createResultDetail('GR', 'Goal Record', true)
      ];
      
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(123);
      expect(storage.error).toHaveBeenCalledWith(
        Language.ResultHeld.replace('{0}', 'Half Time, Full Time, Goal Record')
      );
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should filter to only full-time results for half-time calculation', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', true),
        createResultDetail(ResourceIds.fullTime, 'Full Time', false)
      ];
      
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateHalfTime);
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(123);
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should show error when full-time result is on hold for half-time calculation', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', true),
        createResultDetail(ResourceIds.fullTime, 'Full Time', true)
      ];
      
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateHalfTime);
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(123);
      expect(storage.error).toHaveBeenCalledWith(
        Language.ResultHeld.replace('{0}', 'Full Time')
      );
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should proceed when only half-time is on hold for half-time calculation', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', true),
        createResultDetail(ResourceIds.fullTime, 'Full Time', false)
      ];
      
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateHalfTime);
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(123);
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should handle empty result details array', async () => {
      // Arrange
      const resultDetails: ResultDetail[] = [];
      
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(123);
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should handle only non-full-time results for half-time calculation', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', true),
        createResultDetail('GR', 'Goal Record', true)
      ];
      
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateHalfTime);
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(123);
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should construct error message correctly with multiple held results', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail('R1', 'Result One', true),
        createResultDetail('R2', 'Result Two', false),
        createResultDetail('R3', 'Result Three', true)
      ];
      
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(
        Language.ResultHeld.replace('{0}', 'Result One, Result Two, Result Three')
      );
    });

    it('should use correct match ID from storage', async () => {
      // Arrange
      const customMatchDetail = { matchId: 999 } as MatchDetail;
      match.matchDetail = customMatchDetail;
      
      const resultDetails = [createResultDetail(ResourceIds.fullTime, 'Full Time', false)];
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.getResultDetail).toHaveBeenCalledWith(999);
    });
  });

  describe('filtering logic', () => {
    it('should include all results for non-half-time calculations', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', true),
        createResultDetail(ResourceIds.fullTime, 'Full Time', true),
        createResultDetail('OTHER', 'Other Result', true)
      ];
      
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateFullTime);
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(
        Language.ResultHeld.replace('{0}', 'Half Time, Full Time, Other Result')
      );
    });

    it('should only include full-time results for half-time calculations', async () => {
      // Arrange
      const resultDetails = [
        createResultDetail(ResourceIds.halfTime, 'Half Time', true),
        createResultDetail(ResourceIds.fullTime, 'Full Time', true),
        createResultDetail('OTHER', 'Other Result', true)
      ];
      
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateHalfTime);
      requestService.getResultDetail = jest.fn().mockResolvedValue(resultDetails);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(
        Language.ResultHeld.replace('{0}', 'Full Time')
      );
    });
  });
});
