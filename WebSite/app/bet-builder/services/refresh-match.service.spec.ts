import { TestBed, inject, fakeAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RefreshMatchService, RequestService } from './';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SportLeagues, AutoSetting, LeagueMatches, MatchDetail, MatchWaitingRequest, MoreScore } from '../models';
import { of } from 'rxjs';

describe('BetBuilder - Calculation Filter Sevice', () => {
    let service: RefreshMatchService = null;
    let requestService: RequestService;
    const autoSetting = new AutoSetting();
    autoSetting.isAutoSettingForMatch = true;
    const matchWaiting: MatchDetail = {
        matchId: 7000000,
        eventStatus: 'Running',
        parlayStatus: 'Running',
        autoCalcSetting: autoSetting,
        queueStatus: 2,
        leagueName: 'mock league name',
        sportType: 1,
        sportName: 'soccer',
        matchCode: 'abc',
        homeName: 'home name',
        awayName: 'away name',
        isShowLink: true,
        kickOffTime: '',
        betStatus: '',
        moreScores: new MoreScore()
    };

    const expectedMatch = new MatchDetail();
    expectedMatch.matchId = 7000000;
    expectedMatch.eventStatus = 'Running';
    expectedMatch.parlayStatus = 'Running';
    expectedMatch.autoCalcSetting = autoSetting;
    expectedMatch.moreScores = new MoreScore();
    expectedMatch.isShowLink = true;
    expectedMatch.queueStatus = 2;

    const match = new MatchDetail();
    match.matchId = 7000000;
    match.queueStatus = 2;
    match.autoCalcSetting = new AutoSetting();
    const league = new LeagueMatches();
    league.matches = [match];
    const leagues = [league];
    const request = new MatchWaitingRequest('', '', '', '');
    const sport: SportLeagues = {
        id: 1,
        name: 'mock sport',
        leagues,
        collapse: false,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RefreshMatchService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
                RequestService,
            ],
            imports: [
                HttpClientModule,
                NgbModule,
            ],
        });
    });

    beforeEach(inject([RefreshMatchService], (refreshMatchService: RefreshMatchService) => {
        service = refreshMatchService;
        requestService = TestBed.inject(RequestService);
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('refreshMatches', () => {
        it('should get matches and change info after refresh', fakeAsync(() => {
            spyOn(requestService, 'refreshMatches').and.returnValue(of([matchWaiting]));

            service.refreshMatches([sport], request);

            expect(leagues[0].matches[0]).toEqual(expectedMatch);
        }));

        it('should update waiting parlay status', fakeAsync(() => {
            matchWaiting.queueStatus = 0;
            expectedMatch.parlayStatus = 'Waiting';
            matchWaiting.parlayStatus = 'Waiting';
            spyOn(requestService, 'refreshMatches').and.returnValue(of([matchWaiting]));

            service.refreshMatches([sport], request);

            expect(leagues[0].matches[0]).toEqual(expectedMatch);
        }));

        it('should update running parlay status', fakeAsync(() => {
            matchWaiting.queueStatus = 1;
            expectedMatch.parlayStatus = 'Calculating';
            matchWaiting.parlayStatus = 'Calculating';
            spyOn(requestService, 'refreshMatches').and.returnValue(of([matchWaiting]));

            service.refreshMatches([sport], request);

            expect(leagues[0].matches[0]).toEqual(expectedMatch);
        }));
    });
});