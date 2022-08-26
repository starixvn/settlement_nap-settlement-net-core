import { HttpClient, HttpClientModule, HttpHandler } from "@angular/common/http";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { fakeAsync, TestBed } from "@angular/core/testing";
import { GetMoveTicketsRequest, MoveRunningTicketsRequest, ValidateMatchesRequest } from "../../models";
import { BlockUIService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { MoveRunningTicketsService } from "./move-running-tickets.service";

describe('MoveTicketsService', () => {
    let httpRequestService: HttpRequestService;
    let moveRunningTicketsService: MoveRunningTicketsService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule],
        providers: [
          HttpRequestService,
          MoveRunningTicketsService,
          BlockUIService,
          HttpClient,
          HttpHandler,
          MessageBoxService,
        ],
        schemas: [NO_ERRORS_SCHEMA],
      });

      httpRequestService = TestBed.inject(HttpRequestService);
      moveRunningTicketsService = TestBed.inject(MoveRunningTicketsService);
    });

    it('should be created', () => {
      const service: MoveRunningTicketsService = TestBed.inject(MoveRunningTicketsService);
      expect(service).toBeTruthy();
    });

    it('validateMatches - should post with correct url', fakeAsync(() => {
      spyOn(httpRequestService, 'postJson');
      const request = new ValidateMatchesRequest();
      const expectedUrl = 'localhost/api/moveticket/validate-matches';

      moveRunningTicketsService.validateMatches(request);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(request, expectedUrl);
    }));

    it('getMoveTicketsMatches - should post with correct url', fakeAsync(() => {
      spyOn(httpRequestService, 'postJson');
      const request = new GetMoveTicketsRequest();
      const expectedUrl = 'localhost/api/moveticket/get-move-tickets-matches';

      moveRunningTicketsService.getMoveTicketsMatches(request);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(request, expectedUrl);
    }));

    it('moveRunningTickets - should post with correct url', fakeAsync(() => {
      spyOn(httpRequestService, 'postJson');
      const request = new MoveRunningTicketsRequest();
      const expectedUrl = 'localhost/api/moveticket/move-running-tickets';

      moveRunningTicketsService.moveRunningTickets(request);

      expect(httpRequestService.postJson).toHaveBeenCalledWith(request, expectedUrl);
    }));
});