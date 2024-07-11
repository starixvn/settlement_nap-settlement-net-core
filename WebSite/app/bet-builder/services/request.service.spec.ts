
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
    const Url = '/api/bet-builder';
    const urlApiSetting = '/api/setting';
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

    it('getSport - Call exact Url and param', fakeAsync(() => {
        const url = `${Url}/get-sports`;
        const query = {} as object;

        jest.spyOn(httpRequestService, 'postJson');
        service.getSport(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, false);
    }));

    it('getLeague - Call exact Url and param', fakeAsync(() => {
        const url = `${Url}/get-leagues`;
        const query = {} as object;

        jest.spyOn(httpRequestService, 'postJson');
        service.getLeague(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, false);
    }));

    it('getDate - Call exact Url and param',  fakeAsync(() => {
        const url = `${Url}/get-date`;

        jest.spyOn(httpRequestService, 'getJson');
        service.getDate();

        expect(httpRequestService.getJson).toHaveBeenCalledWith(url);
    }));

    it('search - Call exact Url and param', fakeAsync(() => {
        const url = `${Url}/search`;
        const query = new GetMatchesQuery("aa", "", "1", "1", "","");

        jest.spyOn(httpRequestService, 'postJson');
        service.search(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('getMatch - Call exact Url and param', fakeAsync(() => {
        const url = `${Url}/get-match`;
        const matchId = 7000000;
        const query = {
            matchId,
        };

        jest.spyOn(httpRequestService, 'postJson');
        service.getMatch(matchId);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('getSelection - Call exact Url and param', fakeAsync(() => {
        const url = `${Url}/get-selection`;
        const matchId = 7000000;
        const query = {
            matchId,
        };

        jest.spyOn(httpRequestService, 'postJson');
        service.getSelection(matchId);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('push - Call exact Url and param', fakeAsync(() => {
        const url = `${Url}/settle`;
        const query = {} as object;

        jest.spyOn(httpRequestService, 'postJson');
        service.push(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    }));

    it('refreshMatches - Call exact Url and param', fakeAsync(() => {
        const url = `${Url}/refresh-matches`;
        const query = {} as MatchWaitingRequest;

        jest.spyOn(httpRequestService, 'postJson');
        service.refreshMatches(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, false);
    }));

    it('updateLeague - Call exact Url and param', () => {
        const url = `${urlApiSetting}/update-setting-league`;
        const query = {} as AutoSettingLeagueQuery;

        jest.spyOn(httpRequestService, 'postJson');
        service.updateLeague(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    });

    it('updateMatch - Call exact Url and param', () => {
        const url = `${urlApiSetting}/update-setting-match`;
        const query = new AutoSettingMatchQuery(1, 1, true);

        jest.spyOn(httpRequestService, 'postJson');
        service.updateMatch(query);

        expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
    });
});