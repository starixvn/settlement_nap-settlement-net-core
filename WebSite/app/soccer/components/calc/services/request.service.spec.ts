
import { HttpClientModule } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../../shared/services';
import { RequestService } from './request.service';
import { SettleQuery, InstantCalculationQuery } from "../models/query.model";
describe('Soccer - request service', () => {
    let service: RequestService;
    let httpRequestService: HttpRequestService;
    const ApiUrl = 'api/soccer';
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            RequestService,
            HttpRequestService,
            BlockUIService,
            MessageBoxService
        ], imports: [
            HttpClientModule,
            NgbModule
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(RequestService);
        httpRequestService = TestBed.inject(HttpRequestService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getMatch - Call exact Url and param', fakeAsync(() => {
        const matchId = 7000000;
        const url = `${ApiUrl}/get-match`;
        const query = {
            matchId,
            isRefundPage: false,
        };

        spyOn(httpRequestService, 'postJson');
        service.getMatch(7000000);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('checkNewStatus - Call exact Url and param', fakeAsync(() => {
        const matchId = 7000000;
        const url = `${ApiUrl}/check-status`;
        const query = {
            matchId,
            actionName: "calc",
        };

        spyOn(httpRequestService, 'postJson');
        service.checkNewStatus(7000000, "calc");

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('getLastestMatchResult - Call exact Url and param', fakeAsync(() => {
        const matchId = 7000000;
        const url = `${ApiUrl}/get-lastest-match-detail`;
        const query = {
            matchId
        };

        spyOn(httpRequestService, 'postJson');
        service.getLastestMatchResult(7000000);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('calculate - Call exact Url and param', fakeAsync(() => {
        const query = {} as SettleQuery;
        const url = `${ApiUrl}/calculate`;

        spyOn(httpRequestService, 'postJson');
        service.calculate(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('undoCheckingScore - Call exact Url and param', fakeAsync(() => {
        const matchId = 7000000;
        const url = `${ApiUrl}/undo-checking-score`;
        const query = {
            matchId
        };

        spyOn(httpRequestService, 'postJson');
        service.undoCheckingScore(matchId);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('pushInstantScore - Call exact Url and param', fakeAsync(() => {
        const query = {} as InstantCalculationQuery;
        const url = `${ApiUrl}/push-instant-score`;

        spyOn(httpRequestService, 'postJson');
        service.pushInstantScore(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));
});