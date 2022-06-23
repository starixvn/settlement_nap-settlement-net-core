import { FilterRequest, MoveTicketsRequest, GetChildMatchesRequest, CalculateMPRequest } from '../../models';
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { TestBed} from '@angular/core/testing';

import { MoveTicketsService } from './move-tickets.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { ApiKeys } from '../../../shared/constants';
import { MaterialModule } from '../../../shared/material-module';

describe('MoveTicketsService', () => {
  let httpRequestService: HttpRequestService;
  let moveTicketsService: MoveTicketsService;
  let dialogBoxService: DialogBoxService;
  const apiUrl = 'localhost';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule, MaterialModule],
      providers: [
        HttpRequestService,
        MoveTicketsService,
        BlockUIService,
        MessageBoxService,
        DialogBoxService,
        HttpClient,
        HttpHandler,
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    httpRequestService = TestBed.inject(HttpRequestService);
    moveTicketsService = TestBed.inject(MoveTicketsService);
    dialogBoxService = TestBed.inject(DialogBoxService);
  });

  it('should be created', () => {
    const service: MoveTicketsService = TestBed.inject(MoveTicketsService);
    expect(service).toBeTruthy();
  });

  it(`getLeague - Call right Url and param`, () => {
    // Arrange
    const url = `localhost/api/multi-sports/getLeague`;
    const param = {
      apikey: ApiKeys.MultiSportGetCombobox,
    };

    // Act
    spyOn(httpRequestService, 'postJson');
    moveTicketsService.getLeague(param, apiUrl);

    // Assert
    expect(httpRequestService.postJson).toHaveBeenCalledWith(param, url, false);
  });

  it('getDate - Call right Url', () => {
        // Arrange
        const url = "localhost/api/multi-sports/get-date";

        // Act
        spyOn(httpRequestService, 'getJson');
        moveTicketsService.getDate(apiUrl);

        // Assert
        expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
  });

  it('filter - Call right Url and param', () => {
        // Arrange
        const param: FilterRequest = {
          fromDate: "22/03/2019",
          toDate: "30/03/2019",
          ticketStatus: '',
          matchCode: '',
          matchStatus: '',
          holdStatus:'',
          leagueIds: '',
          sportTypes: '',
          isIncludeTest: true,
        };

        // Act
        spyOn(httpRequestService, 'postJson');
        moveTicketsService.filter(param, apiUrl);

        // Assert
        expect(httpRequestService.postJson)
          .toHaveBeenCalledWith(param, "localhost/api/moveticket/get-match");
    }
  );

  it('moveTickets - Call right Url and param', () => {
    // Arrange
    const param: MoveTicketsRequest = {
      matchId: '12345'
    };

    // Act
    spyOn(httpRequestService, 'postJson');
    moveTicketsService.moveTickets(param, apiUrl);

    // Assert
    expect(httpRequestService.postJson)
      .toHaveBeenCalledWith(param, "localhost/api/moveticket/move-ticket");
  });

  it('getChildMatches - Call right Url and param', () => {
    // Arrange
    const param = new GetChildMatchesRequest('12345');

    // Act
    spyOn(httpRequestService, 'postJson');
    moveTicketsService.getChildMatches(param, apiUrl);

    // Assert
    expect(httpRequestService.postJson)
      .toHaveBeenCalledWith(param, "localhost/api/moveticket/get-child-match");
  });

  it('calculateMP - Call right Url and param', () => {
    // Arrange
    const param = new CalculateMPRequest('12345');

    // Act
    spyOn(httpRequestService, 'postJson');
    moveTicketsService.calculateMP(param);

    // Assert
    expect(httpRequestService.postJson)
      .toHaveBeenCalledWith(param, "api/calculation/calculate-mix-parlay");
  });

  it('popupLog - should open dialog box', () => {
    spyOn(dialogBoxService, 'popup');

    moveTicketsService.popupLog('1', '', '');

    expect(dialogBoxService.popup).toHaveBeenCalled();
  });
});
