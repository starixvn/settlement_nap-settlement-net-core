
import { HttpClientModule } from '@angular/common/http';
import { fakeAsync, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { RequestService } from './request.service';
import { GetMatchesQuery, MatchWaitingRequest } from '../models';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, Result } from '../../shared/models';
describe('Bet Builder - RequestService', () => {
    let service: RequestService;
    let httpRequestService: HttpRequestService;
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
        service.apiUrl = 'Local';
        httpRequestService = TestBed.inject(HttpRequestService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getSport - Call exact Url and param', fakeAsync(() => {
        const url = 'Local/api/bet-builder/get-sports';
        const query = {} as object;

        spyOn(httpRequestService, 'postJson');
        service.getSport(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, false);
    }));

    it('getLeague - Call exact Url and param', fakeAsync(() => {
        const url = 'Local/api/bet-builder/get-leagues';
        const query = {} as object;

        spyOn(httpRequestService, 'postJson');
        service.getLeague(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, false);
    }));

    it('getDate - Call exact Url and param',fakeAsync(() => {
        const url = 'Local/api/bet-builder/get-date';

        spyOn(httpRequestService, 'getJson');
        service.getDate();

        expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
    }));

    it('search - Call exact Url and param', fakeAsync(() => {
        const url = 'Local/api/bet-builder/search';
        const query = {} as GetMatchesQuery;

        spyOn(httpRequestService, 'postJson');
        service.search(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('getMatch - Call exact Url and param', fakeAsync(() => {
        const url = 'Local/api/bet-builder/get-match';
        const matchId = 7000000;
        const query = {
            matchId,
        };

        spyOn(httpRequestService, 'postJson');
        service.getMatch(matchId);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('getSelection - Call exact Url and param', fakeAsync(() => {
        const url = 'Local/api/bet-builder/get-selection';
        const matchId = 7000000;
        const query = {
            matchId,
        };

        spyOn(httpRequestService, 'postJson');
        service.getSelection(matchId);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('push - Call exact Url and param', fakeAsync(() => {
        const url = 'Local/api/bet-builder/settle';
        const query = {} as object;

        spyOn(httpRequestService, 'postJson');
        service.push(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('refreshMatches - Call exact Url and param', fakeAsync(() => {
        const url = 'Local/api/bet-builder/refresh-matches';
        const query = {} as MatchWaitingRequest;

        spyOn(httpRequestService, 'postJson');
        service.refreshMatches(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, false);
    }));

    it('updateLeague - Call exact Url and param', fakeAsync(() => {
        const url = 'Local/api/setting/update-setting-league';
        const query = {} as AutoSettingLeagueQuery;

        spyOn(httpRequestService, 'postJson');
        service.updateLeague(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('updateMatch - Call exact Url and param', fakeAsync(() => {
        const url = 'Local/api/setting/update-setting-match';
        const query = {} as AutoSettingMatchQuery;

        spyOn(httpRequestService, 'postJson');
        service.updateMatch(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));
});