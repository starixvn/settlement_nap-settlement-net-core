import { TestBed } from '@angular/core/testing';
import { CalculateHandler } from './calculate.handler';
import { ClosePopupService } from '../../../shared/services';
import { RequestService } from '../../components/calc/services/request.service';
import { CalculateStorage } from '../../storage/calculate.storage';
import { CalculateBaseStorage } from '../../storage/storage.service.native';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Match, MatchDetailSoccer as MatchDetail, ChildMatch, HedgeMatchDetail } from '../../components/calc/models/match.model';
import { Permission } from '../../../shared/models/sportsbook-sop/permission.model';
import { ResultDetail } from '../../../shared/models/sportsbook-sop';
import { CalculateAction } from '../../../shared/constants';
import { ResourceIds } from '../../constants';
import { SettleQuery } from '../../components/calc/models/query.model';
import { Result } from '../../../shared/models';
import { VerifyScoreGoalService } from '../../components/calc/services/verify-score-goal.service';

describe('CalculateHandler', () => {
  let handler: CalculateHandler;
  let storage: CalculateBaseStorage;
  let closePopupService: ClosePopupService;
  let requestService: RequestService;

  const createMatchDetail = (): MatchDetail => ({
    matchId: 1,
    finalAwayScore: '',
    finalHomeScore: '',
    halfTimeAwayScore: '',
    halfTimeHomeScore: '',
    applyGoalRecord: false,
    goalRecord: '',
    isExistFgLg: false,
    isExistHtFgLg: false,
    isExistFgNg: false,
    leagueGroupId: 1,
    isFantasyMatch: false,
    childMatchType: 0,
    sportType: 1,
    parentId: 0,
    isEnabledGoalRecordFt: false,
    isEnabledGoalRecordHt: false
  } as any);

  const createHedgeMatchDetail = (): HedgeMatchDetail => ({
    matchId: 2
  } as any);

  const createChildMatch = (matchId: number, checked: boolean): ChildMatch => ({
    matchId,
    checked
  } as any);

  const createResultDetail = (resourceId: string, homeValue: string, awayValue: string, checked: boolean): ResultDetail => ({
    resourceId,
    homeValue,
    awayValue,
    checked
  } as any);

  const match: Match = {
    matchDetail: createMatchDetail(),
    permission: new Permission(),
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: createHedgeMatchDetail(),
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
        CalculateHandler,
        ClosePopupService,
        RequestService,
        CalculateStorage,
        ToastrService,
        VerifyScoreGoalService
      ]
    });

    handler = TestBed.inject(CalculateHandler);
    storage = TestBed.inject(CalculateStorage);
    closePopupService = TestBed.inject(ClosePopupService);
    requestService = TestBed.inject(RequestService);

    // Reset match to default state
    match.matchDetail = createMatchDetail();
    match.hedgeMatchDetail = createHedgeMatchDetail();
    match.childMatches = [];
    match.resultDetails = [];

    // Mock storage methods
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculate);
    storage.isApplyHedgeMatch = jest.fn().mockReturnValue(false);
    storage.getIsResettleTicket = jest.fn().mockReturnValue(false);
    storage.error = jest.fn();

    // Mock services
    closePopupService.closePopup = jest.fn();
    requestService.calculate = jest.fn();
    requestService.alertMessageToLetstalkForFastMarket = jest.fn();
  });

  describe('handle method', () => {
    it('should handle successful calculation with no child matches', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      const htResult = createResultDetail(ResourceIds.halfTime, '1', '0', true);
      const ftResult = createResultDetail(ResourceIds.fullTime, '2', '1', true);
      
      match.resultDetails = [htResult, ftResult];
      requestService.calculate = jest.fn().mockResolvedValue(result);
      requestService.alertMessageToLetstalkForFastMarket = jest.fn().mockResolvedValue(undefined);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.calculate).toHaveBeenCalledWith(
        expect.objectContaining({
          matchId: 1,
          actionName: CalculateAction.calculate,
          childMatchIds: null,
          hedgeMatchId: 0,
          isResettledTickets: false
        })
      );
      expect(match.matchDetail.halfTimeHomeScore).toBe('1');
      expect(match.matchDetail.halfTimeAwayScore).toBe('0');
      expect(match.matchDetail.finalHomeScore).toBe('2');
      expect(match.matchDetail.finalAwayScore).toBe('1');
      expect(requestService.alertMessageToLetstalkForFastMarket).toHaveBeenCalledWith(1, CalculateAction.calculate);
      expect(closePopupService.closePopup).toHaveBeenCalled();
      expect(storage.error).not.toHaveBeenCalled();
    });

    it('should handle successful calculation with selected child matches', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      const childMatch1 = createChildMatch(10, true);
      const childMatch2 = createChildMatch(20, false);
      const childMatch3 = createChildMatch(30, true);

      match.childMatches = [childMatch1, childMatch2, childMatch3];
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateFullTime);
      requestService.calculate = jest.fn().mockResolvedValue(result);
      requestService.alertMessageToLetstalkForFastMarket = jest.fn().mockResolvedValue(undefined);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.calculate).toHaveBeenCalledWith(
        expect.objectContaining({
          childMatchIds: '10,30',
          actionName: CalculateAction.calculateFullTime
        })
      );
      expect(requestService.alertMessageToLetstalkForFastMarket).toHaveBeenCalledWith(1, CalculateAction.calculateFullTime);
      expect(closePopupService.closePopup).toHaveBeenCalled();
    });

    it('should handle calculation with no selected child matches (should pass "0")', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      const childMatch1 = createChildMatch(10, false);
      const childMatch2 = createChildMatch(20, false);

      match.childMatches = [childMatch1, childMatch2];
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateFullTime);
      requestService.calculate = jest.fn().mockResolvedValue(result);
      requestService.alertMessageToLetstalkForFastMarket = jest.fn().mockResolvedValue(undefined);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.calculate).toHaveBeenCalledWith(
        expect.objectContaining({
          childMatchIds: '0'
        })
      );
      expect(closePopupService.closePopup).toHaveBeenCalled();
    });

    it('should handle half-time calculation (childMatchIds should be null)', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      const childMatch1 = createChildMatch(10, true);

      match.childMatches = [childMatch1];
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateHalfTime);
      requestService.calculate = jest.fn().mockResolvedValue(result);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.calculate).toHaveBeenCalledWith(
        expect.objectContaining({
          childMatchIds: null,
          actionName: CalculateAction.calculateHalfTime
        })
      );
      expect(requestService.alertMessageToLetstalkForFastMarket).not.toHaveBeenCalled();
      expect(closePopupService.closePopup).toHaveBeenCalled();
    });

    it('should handle calculation with hedge match applied', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      
      storage.isApplyHedgeMatch = jest.fn().mockReturnValue(true);
      storage.getIsResettleTicket = jest.fn().mockReturnValue(true);
      requestService.calculate = jest.fn().mockResolvedValue(result);
      requestService.alertMessageToLetstalkForFastMarket = jest.fn().mockResolvedValue(undefined);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.calculate).toHaveBeenCalledWith(
        expect.objectContaining({
          hedgeMatchId: 2,
          isResettledTickets: true
        })
      );
      expect(closePopupService.closePopup).toHaveBeenCalled();
    });

    it('should handle calculation failure', async () => {
      // Arrange
      const result = { isSuccessful: false, errMsg: 'Calculation failed' } as Result;
      
      requestService.calculate = jest.fn().mockResolvedValue(result);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.calculate).toHaveBeenCalled();
      expect(storage.error).toHaveBeenCalledWith('Calculation failed');
      expect(closePopupService.closePopup).not.toHaveBeenCalled();
      expect(requestService.alertMessageToLetstalkForFastMarket).not.toHaveBeenCalled();
    });

    it('should not call alertMessageToLetstalkForFastMarket for non-applicable actions', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.unCalculate);
      requestService.calculate = jest.fn().mockResolvedValue(result);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.alertMessageToLetstalkForFastMarket).not.toHaveBeenCalled();
      expect(closePopupService.closePopup).toHaveBeenCalled();
    });

    it('should parse scores correctly for multiple result details', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      const htResult = createResultDetail(ResourceIds.halfTime, '2', '1', true);
      const ftResult = createResultDetail(ResourceIds.fullTime, '3', '2', true);
      const uncheckedResult = createResultDetail(ResourceIds.fullTime, '5', '5', false);
      
      match.resultDetails = [htResult, ftResult, uncheckedResult];
      requestService.calculate = jest.fn().mockResolvedValue(result);
      requestService.alertMessageToLetstalkForFastMarket = jest.fn().mockResolvedValue(undefined);

      // Act
      await handler.handle(storage);

      // Assert
      expect(match.matchDetail.halfTimeHomeScore).toBe('2');
      expect(match.matchDetail.halfTimeAwayScore).toBe('1');
      expect(match.matchDetail.finalHomeScore).toBe('3');
      expect(match.matchDetail.finalAwayScore).toBe('2');
      expect(closePopupService.closePopup).toHaveBeenCalled();
    });

    it('should not parse scores for unchecked result details', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      const uncheckedHtResult = createResultDetail(ResourceIds.halfTime, '1', '0', false);
      const uncheckedFtResult = createResultDetail(ResourceIds.fullTime, '2', '1', false);
      
      match.resultDetails = [uncheckedHtResult, uncheckedFtResult];
      requestService.calculate = jest.fn().mockResolvedValue(result);
      requestService.alertMessageToLetstalkForFastMarket = jest.fn().mockResolvedValue(undefined);

      // Act
      await handler.handle(storage);

      // Assert
      expect(match.matchDetail.halfTimeHomeScore).toBe('');
      expect(match.matchDetail.halfTimeAwayScore).toBe('');
      expect(match.matchDetail.finalHomeScore).toBe('');
      expect(match.matchDetail.finalAwayScore).toBe('');
      expect(closePopupService.closePopup).toHaveBeenCalled();
    });

    it('should create SettleQuery with correct parameters', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      const htResult = createResultDetail(ResourceIds.halfTime, '1', '0', true);
      
      match.resultDetails = [htResult];
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateFullTime);
      storage.isApplyHedgeMatch = jest.fn().mockReturnValue(true);
      storage.getIsResettleTicket = jest.fn().mockReturnValue(true);
      requestService.calculate = jest.fn().mockResolvedValue(result);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.calculate).toHaveBeenCalledWith(
        expect.any(SettleQuery)
      );
      
      const settleQuery = (requestService.calculate as jest.Mock).mock.calls[0][0] as SettleQuery;
      expect(settleQuery.matchId).toBe(1);
      expect(settleQuery.hedgeMatchId).toBe(2);
      expect(settleQuery.actionName).toBe(CalculateAction.calculateFullTime);
      expect(settleQuery.isResettledTickets).toBe(true);
      expect(settleQuery.selectedResultDetails).toEqual([htResult]);
    });
  });

  describe('parseScoreToMatchDetail method', () => {
    it('should parse only half-time scores when only HT result is checked', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      const htResult = createResultDetail(ResourceIds.halfTime, '1', '2', true);
      const ftResult = createResultDetail(ResourceIds.fullTime, '3', '4', false);
      
      match.resultDetails = [htResult, ftResult];
      requestService.calculate = jest.fn().mockResolvedValue(result);

      // Act
      await handler.handle(storage);

      // Assert
      expect(match.matchDetail.halfTimeHomeScore).toBe('1');
      expect(match.matchDetail.halfTimeAwayScore).toBe('2');
      expect(match.matchDetail.finalHomeScore).toBe('');
      expect(match.matchDetail.finalAwayScore).toBe('');
    });

    it('should parse only full-time scores when only FT result is checked', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      const htResult = createResultDetail(ResourceIds.halfTime, '1', '2', false);
      const ftResult = createResultDetail(ResourceIds.fullTime, '3', '4', true);
      
      match.resultDetails = [htResult, ftResult];
      requestService.calculate = jest.fn().mockResolvedValue(result);

      // Act
      await handler.handle(storage);

      // Assert
      expect(match.matchDetail.halfTimeHomeScore).toBe('');
      expect(match.matchDetail.halfTimeAwayScore).toBe('');
      expect(match.matchDetail.finalHomeScore).toBe('3');
      expect(match.matchDetail.finalAwayScore).toBe('4');
    });
  });

  describe('alertMessageToLetsTalkForFastMarket method', () => {
    it('should call alertMessageToLetstalkForFastMarket for calculateFullTime action', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculateFullTime);
      requestService.calculate = jest.fn().mockResolvedValue(result);
      requestService.alertMessageToLetstalkForFastMarket = jest.fn().mockResolvedValue(undefined);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.alertMessageToLetstalkForFastMarket).toHaveBeenCalledWith(1, CalculateAction.calculateFullTime);
    });

    it('should call alertMessageToLetstalkForFastMarket for calculate action', async () => {
      // Arrange
      const result = { isSuccessful: true } as Result;
      
      storage.getCalculateAction = jest.fn().mockReturnValue(CalculateAction.calculate);
      requestService.calculate = jest.fn().mockResolvedValue(result);
      requestService.alertMessageToLetstalkForFastMarket = jest.fn().mockResolvedValue(undefined);

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.alertMessageToLetstalkForFastMarket).toHaveBeenCalledWith(1, CalculateAction.calculate);
    });
  });
});
