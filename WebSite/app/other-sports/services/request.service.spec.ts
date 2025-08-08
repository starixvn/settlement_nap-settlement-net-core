import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { RequestService } from './request.service';
import { jest } from '@jest/globals';
import { of } from 'rxjs';

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
        const url = apiUrl + '/get-match';
        const query = {
          matchId,
          action: "REFUND"
        };

        // Act
        jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of({}));
        service.getMatch(query);
        tick();

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
  }));


  it('checkMarkedTickets - Call exact Url and param',
    fakeAsync(
      () => {
        // Arrange
        const matchId = 7000000;
        const url = apiUrl + '/check-marked-tickets';
        const query = {
          matchId,
          action: "REFUND",
        };

        // Act
        jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of({}));
        service.checkMarkedTickets(query);
        tick();

        // Assert
        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, false);
  }));
});
