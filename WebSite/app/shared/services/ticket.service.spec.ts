import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { TicketService } from './ticket.service';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';

describe('TicketService', () => {
  let service: TicketService = null;
  let httpRequestService: HttpRequestService;
  beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
          TicketService,
          HttpRequestService,
          BlockUIService,
          MessageBoxService,
        ],
        imports: [
          HttpClientModule,
        ],
    });

    service = TestBed.inject(TicketService);
    httpRequestService = TestBed.inject(HttpRequestService);
});

  beforeEach(inject([TicketService], (ticketService: TicketService) => {
      service = ticketService;
  }));

  it('should create a service', () => {
      expect(service).toBeTruthy();
  });

  it('checkMarkedTickets - Call exact Url and param',
    fakeAsync(
      () => {
        // Arrange
        const matchId = 7000000;
        const url = '/api/sportsbook-aio/checking-marked-tickets';
        const param = {
          matchId,
        };

        // Act
        spyOn(httpRequestService, 'postJson');
        service.checkMarkedTickets(param);
        tick();

        // Assert
        expect(httpRequestService.postJson)
          .toHaveBeenCalledWith(param, url, false);
  }));
});
