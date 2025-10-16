import { TestBed } from '@angular/core/testing';
import {  HttpClient, HttpHandler } from '@angular/common/http';
import { RequestService } from './request.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { SettleQuery, BetType, CheckingMarkedTicketsQuery, EventCounter,  UpdateWaterBreakQuery, GetLastestResultQuery, TimeMachineResult } from '../models';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery } from '../../shared/models';
import { IUpdateSettlementResultHistoryStatus } from '../../shared/models/update-settle-result-history-status';
import { of } from 'rxjs';


describe('FastMarketService', () => {
  let service: RequestService = null;
  let httpRequestService: HttpRequestService;
  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
          RequestService,
          HttpRequestService,
          HttpClient,
          HttpHandler,
          BlockUIService,
          MessageBoxService,
        ]
    });

    service = TestBed.inject(RequestService);
    httpRequestService = TestBed.inject(HttpRequestService);
    jest.spyOn(httpRequestService, 'postJson');
    jest.spyOn(httpRequestService, 'getJson');
  });

  it('should create a service', () => {
      expect(service).toBeTruthy();
  });

  it('checkingMarkedTickets - Call exact Url and param', () => {
        // Arrange
        const matchId = 7000000;
        const betType: BetType[] = [];
        const url = '/api/fast-market/checking-marked-tickets';
        const param = new CheckingMarkedTicketsQuery(matchId, betType);

        // Act
        service.checkingMarkedTickets(param);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url, false);
  });

  it('getMatchDetail - Call exact Url and param', () => {
        // Arrange
        const matchId = 7000000;
        const url = `/api/fast-market/get-match`;
        const query = {matchId};

        // Act
        service.getMatchDetail(matchId);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('getFastMarketResult - Call exact Url and param', () => {
        // Arrange
        const matchId = 7000000;
        const url = `/api/fast-market/get-bettype-interval`;
        const query = {matchId};

        // Act
        service.getFastMarketResult(matchId);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('doSubmitByAction - Call exact Url and param', () => {
        // Arrange
        const matchId = 7000000;
        const betType: BetType[] = [];
        const eventCounters: EventCounter[] = [];
        const action = 'CALC';
        const isReSettledTickets = false;
        const url = '/api/fast-market/settle';
        const param = new SettleQuery(eventCounters, betType, matchId, action, isReSettledTickets);

        // Act
        service.doSubmitByAction(param);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  });

  it('getFilterData - Call exact Url and param', () => {
        // Arrange
        const url = '/api/fast-market/initial-filter';

        // Act
        service.getFilterData();

        // Assert
        expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  });

  it('updateMatchAutoSettle - Call exact Url and param', () => {
        // Arrange
        const matchId = 7000000;
        const isEnabled = true;
        const url = '/api/setting/update-setting-match';
        const param = new AutoSettingMatchQuery(matchId, 1, isEnabled);

        // Act
        service.updateMatchAutoSettle(param);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  });

  it('updateLeagueAutoSettle - Call exact Url and param', () => {
        // Arrange
        const matchId = 7000000;
        const isEnabled = true;
        const isApplyAll = true;
        const url = '/api/setting/update-setting-league';
        const param = new AutoSettingLeagueQuery(matchId, 1, isEnabled, isApplyAll);

        // Act
        service.updateLeagueAutoSettle(param);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  });

  it('updateWaterBreakSetting - Call exact url and param', () => {
      const query = new UpdateWaterBreakQuery();
      const url = "/api/fast-market/update-water-break";

      service.updateWaterBreakSetting(query);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('updateAutoSettle - Call exact url and param', () => {
      const query = { matchId: 123, leagueId: 456, typeObject: "Match" };
      const url = '/api/auto-settle-settings/update-settings';

      service.updateAutoSettle(query);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('getLastestResult - Call exact url and param', () => {
      const query = new GetLastestResultQuery();
      const url = '/api/fast-market/get-latest-result';

      service.getLastestResult(query);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('getTimeMachineHdpResult - Call exact url and param', () => {
      const matchId = 7000000;
      const url = '/api/fast-market/get-time-machine-result';
      const query = { matchId };

      service.getTimeMachineHdpResult(matchId);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('getTimeMachineOuResult - Call exact url and param', () => {
      const matchId = 7000000;
      const url = '/api/fast-market/get-ou-result';
      const query = { matchId };

      service.getTimeMachineOuResult(matchId);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('checkingStatus - Call exact url and param with default isSettleDetermined', () => {
      const matchId = 7000000;
      const actionName = 'CALC';
      const url = '/api/soccer/check-status';
      const query = {
          matchId,
          actionName,
          isSettleDetermined: false,
          isEarly: true,
      };

      service.checkingStatus(matchId, actionName);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('checkingStatus - Call exact url and param with custom isSettleDetermined', () => {
      const matchId = 7000000;
      const actionName = 'SETTLE';
      const isSettleDetermined = true;
      const url = '/api/soccer/check-status';
      const query = {
          matchId,
          actionName,
          isSettleDetermined,
          isEarly: true,
      };

      service.checkingStatus(matchId, actionName, isSettleDetermined);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('updateSettlementResultHistoryStatus - Call exact url and param', async () => {
      const query: IUpdateSettlementResultHistoryStatus = {
          matchId: 123,
          sessionIds: 'session123',
          sportType: 1,
          IsOrg: false
      };
      const url = '/api/aio/update-settlement-result-history-status';
      const mockResponse = { success: true };
      
      jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(mockResponse));

      const result = await service.updateSettlementResultHistoryStatus(query);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
      expect(result).toEqual(mockResponse);
  });

  describe('Edge cases and error handling', () => {
      it('should handle null matchId in getMatchDetail', () => {
          const matchId = null;
          const url = `/api/fast-market/get-match`;
          const query = { matchId };

          service.getMatchDetail(matchId);

          expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
      });

      it('should handle undefined matchId in getFastMarketResult', () => {
          const matchId = undefined;
          const url = `/api/fast-market/get-bettype-interval`;
          const query = { matchId };

          service.getFastMarketResult(matchId);

          expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
      });

      it('should handle zero matchId in getTimeMachineHdpResult', () => {
          const matchId = 0;
          const url = '/api/fast-market/get-time-machine-result';
          const query = { matchId };

          service.getTimeMachineHdpResult(matchId);

          expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
      });

      it('should handle negative matchId in getTimeMachineOuResult', () => {
          const matchId = -1;
          const url = '/api/fast-market/get-ou-result';
          const query = { matchId };

          service.getTimeMachineOuResult(matchId);

          expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
      });

      it('should handle empty actionName in checkingStatus', () => {
          const matchId = 7000000;
          const actionName = '';
          const url = '/api/soccer/check-status';
          const query = {
              matchId,
              actionName,
              isSettleDetermined: false,
              isEarly: true,
          };

          service.checkingStatus(matchId, actionName);

          expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
      });

      it('should handle null actionName in checkingStatus', () => {
          const matchId = 7000000;
          const actionName = null;
          const url = '/api/soccer/check-status';
          const query = {
              matchId,
              actionName,
              isSettleDetermined: false,
              isEarly: true,
          };

          service.checkingStatus(matchId, actionName);

          expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
      });
  });

  describe('Promise-based methods', () => {
      it('getFilterData - should return a Promise', async () => {
          const mockFilter = { leagues: [], sports: [] };
          jest.spyOn(httpRequestService, 'getJson').mockReturnValue(of(mockFilter));

          const result = await service.getFilterData();

          expect(result).toEqual(mockFilter);
          expect(httpRequestService.getJson).toHaveBeenCalledWith('/api/fast-market/initial-filter');
      });

      it('updateSettlementResultHistoryStatus - should handle Promise rejection', async () => {
          const query: IUpdateSettlementResultHistoryStatus = {
              matchId: 123,
              sessionIds: 'session123',
              sportType: 1,
              IsOrg: false
          };
          const error = new Error('Network error');
          
          jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of(error));

          await expect(service.updateSettlementResultHistoryStatus(query)).resolves.toEqual(error);
      });
  });

  describe('Method return types', () => {
      it('checkingMarkedTickets should return Observable', () => {
          const query = new CheckingMarkedTicketsQuery(123, []);
          const result = service.checkingMarkedTickets(query);
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });

      it('getFastMarketResult should return Observable', () => {
          const result = service.getFastMarketResult(123);
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });

      it('getTimeMachineHdpResult should return Observable', () => {
          const result = service.getTimeMachineHdpResult(123);
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });

      it('getTimeMachineOuResult should return Observable', () => {
          const result = service.getTimeMachineOuResult(123);
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });

      it('doSubmitByAction should return Observable', () => {
          const query = new SettleQuery([], [], 123, 'CALC', false);
          const result = service.doSubmitByAction(query);
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });

      it('updateMatchAutoSettle should return Observable', () => {
          const query = new AutoSettingMatchQuery(123, 1, true);
          const result = service.updateMatchAutoSettle(query);
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });

      it('updateLeagueAutoSettle should return Observable', () => {
          const query = new AutoSettingLeagueQuery(123, 1, true, true);
          const result = service.updateLeagueAutoSettle(query);
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });

      it('updateAutoSettle should return Observable', () => {
          const query = { matchId: 123 };
          const result = service.updateAutoSettle(query);
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });

      it('updateWaterBreakSetting should return Observable', () => {
          const query = new UpdateWaterBreakQuery();
          const result = service.updateWaterBreakSetting(query);
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });

      it('getLastestResult should return Observable', () => {
          const query = new GetLastestResultQuery();
          const result = service.getLastestResult(query);
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });

      it('checkingStatus should return Observable', () => {
          const result = service.checkingStatus(123, 'CALC');
          
          expect(result).toBeDefined();
          expect(typeof result.subscribe).toBe('function');
      });
  });
});