import { TestBed } from '@angular/core/testing';
import {  HttpClient, HttpHandler } from '@angular/common/http';
import { RequestService } from './request.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { SettleQuery, BetType, CheckingMarkedTicketsQuery, EventCounter,  UpdateWaterBreakQuery } from '../models';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery } from '../../shared/models';

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
    spyOn(httpRequestService, 'postJson');
    spyOn(httpRequestService, 'getJson');
    service.apiUrl = 'localhost';
  });

  it('should create a service', () => {
      expect(service).toBeTruthy();
  });

  it('checkingMarkedTickets - Call exact Url and param', () => {
        // Arrange
        const matchId = 7000000;
        const betType: BetType[] = [];
        const url = 'localhost/api/fastMarkets/checking-marked-tickets';
        const param = new CheckingMarkedTicketsQuery(matchId, betType);

        // Act
        service.checkingMarkedTickets(param);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url, false);
  });

  it('getMatchDetail - Call exact Url and param', () => {
        // Arrange
        const matchId = 7000000;
        const url = `localhost/api/fastMarkets/get-match`;
        const query = {matchId};

        // Act
        service.getMatchDetail(matchId);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  });

  it('getFastMarketResult - Call exact Url and param', () => {
        // Arrange
        const matchId = 7000000;
        const url = `localhost/api/fastMarkets/get-bettype-interval`;
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
        const url = 'localhost/api/fastMarkets/settle';
        const param = new SettleQuery(eventCounters, betType, matchId, action, isReSettledTickets);

        // Act
        service.doSubmitByAction(param);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  });

  it('getFilterData - Call exact Url and param', () => {
        // Arrange
        const url = 'localhost/api/fastMarkets/initial-filter';

        // Act
        service.getFilterData();

        // Assert
        expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  });

  it('updateMatchAutoSettle - Call exact Url and param', () => {
        // Arrange
        const matchId = 7000000;
        const isEnabled = true;
        const url = 'localhost/api/setting/update-setting-match';
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
        const url = 'localhost/api/setting/update-setting-league';
        const param = new AutoSettingLeagueQuery(matchId, 1, isEnabled, isApplyAll);

        // Act
        service.updateLeagueAutoSettle(param);

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url);
  });

  it('updateWaterBreakSetting - Call exact url and param', () => {
      const query = new UpdateWaterBreakQuery();
      const url = "localhost/api/fastMarkets/update-water-break";

      service.updateWaterBreakSetting(query);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  })
});