import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { RequestSettle } from '../models';
import { RequestService } from './request.service';

describe('RequestService', () => {
  let service: RequestService = null;
  let httpRequestService: HttpRequestService;
  const apiUrl = 'Test';
  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
         RequestService,
          HttpRequestService,
          BlockUIService,
          MessageBoxService,
        ],
        imports: [
          HttpClientModule,
        ],
    });

    service = TestBed.inject(RequestService);
    httpRequestService = TestBed.inject(HttpRequestService);
    service.apiUrl = apiUrl;
});

  beforeEach(inject([RequestService], (requestService: RequestService) => {
      service = requestService;
  }));

  it('should create a service', () => {
      expect(service).toBeTruthy();
  });

  it('getMatch - Call exact Url and param',
    fakeAsync(
      () => {
        // Arrange
        const matchId = '7000000';
        const url = apiUrl + '/api/othersports/get-match';
        const query = {
          matchId,
          action: "REFUND"
        };

        // Act
        spyOn(httpRequestService, 'postJson');
        service.getMatch(query);
        tick();

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  }));

  it('calculate - Call exact Url and param',
    fakeAsync(
      () => {
        // Arrange
        const matchId = 7000000;
        const url = apiUrl + '/api/othersports/calculate';
        const query = new RequestSettle(matchId, 'CAL', false, "", 0, 0);

        // Act
        spyOn(httpRequestService, 'postJson');
        service.calculate(query);
        tick();

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  }));

  it('refund - Call exact Url and param',
    fakeAsync(
      () => {
        // Arrange
        const matchId = 7000000;
        const url = apiUrl + '/api/othersports/refund';
        const query = new RequestSettle(matchId, 'REFUND', false, "", 0, 0);

        // Act
        spyOn(httpRequestService, 'postJson');
        service.refund(query);
        tick();

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  }));

  it('refundParlay - Call exact Url and param',
    fakeAsync(
      () => {
        // Arrange
        const matchId = 7000000;
        const url = apiUrl + '/api/othersports/refund-parlay';
        const query = {
          matchId,
          action: "REFUND",
          settleAbandonedMatchIbcParlay: 0,
        };

        // Act
        spyOn(httpRequestService, 'postJson');
        service.refundParlay(query);
        tick();

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  }));

  it('checkMarkedTickets - Call exact Url and param',
    fakeAsync(
      () => {
        // Arrange
        const matchId = 7000000;
        const url = apiUrl + '/api/othersports/check-marked-tickets';
        const query = {
          matchId,
          action: "REFUND",
        };

        // Act
        spyOn(httpRequestService, 'postJson');
        service.checkMarkedTickets(query);
        tick();

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, false);
  }));
});
