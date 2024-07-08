import { HttpClientModule } from "@angular/common/http";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { getTestBed, TestBed } from "@angular/core/testing";
import { BlockUIService, HttpRequestService, MessageBoxService } from "../../shared/services";
import { OutrightService } from "./outright.service";
import { LogRequest } from "outright/models/log-request.model";

describe('Outright Service under TEST', () => {

    let outrightService: OutrightService;
    let injector: TestBed;
    let httpRequestService: HttpRequestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [
                HttpRequestService,
                OutrightService,
                BlockUIService,
                MessageBoxService,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        injector = getTestBed();
        httpRequestService = TestBed.inject(HttpRequestService);
        outrightService = TestBed.inject(OutrightService);
    })
    it('should be created', () => {
        expect(outrightService).toBeTruthy();
    });

    it(`getFilterView - Call right Url `, () => {
        const url = `/api/outright/get-filter-view`;


        jest.spyOn(httpRequestService, 'getJson');
        outrightService.getFilterView();

        expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
    });


    it(`getMatches - Call right Url and param`, () => {
        const url = `/api/outright/get-league-info`;
        const query = {
            leagueId: 1,
            statusId: 1,
            sportType: 1
        }

        jest.spyOn(httpRequestService, 'postJson');
        outrightService.getMatches(query.leagueId, query.statusId, query.sportType);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    });


    it(`getLogs - Call right Url and param`, () => {
        const url = `/api/outright/get-log`;
        const request: LogRequest = {
            matchCode: '',
            leagueId: 1,
            fromDate: '',
            toDate: ''
        };

        jest.spyOn(httpRequestService, 'postJson');
        outrightService.getLogs(request);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(request, url, true);
    });
});