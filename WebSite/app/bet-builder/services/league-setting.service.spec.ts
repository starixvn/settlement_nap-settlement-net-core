import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { LeagueSettingService, RequestService } from './';
import { HttpRequestService, BlockUIService, MessageBoxService } from '../../shared/services';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatchDetail, AutoSetting, LeagueMatches } from '../models';
import { of } from 'rxjs';

describe('BetBuilder - League setting Service', () => {
    let service: LeagueSettingService = null;
    let requestService: RequestService;
    let messageBoxService: MessageBoxService;

    const errorMessage = "Error message";
    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
        childMatchIds: '1,2',
        settledSessionId: "",
        hasResultAmendment: false,
        isOrg: false
    };

    const unSuccessfulResult = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
        childMatchIds: "",
        settledSessionId: "",
        hasResultAmendment: false,
        isOrg: false
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                LeagueSettingService,
                HttpRequestService,
                BlockUIService,
                MessageBoxService,
                RequestService
            ],
            imports: [
                HttpClientModule,
                NgbModule,
            ],
        });
    });

    beforeEach(inject([LeagueSettingService], (leagueSettingService: LeagueSettingService) => {
        service = leagueSettingService;
        requestService = TestBed.inject(RequestService);
        messageBoxService = TestBed.inject(MessageBoxService);
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('getConfirmMessage', () =>{
        it('should return correct message when auto is on', () => {
            const expectMessage = "You have changed Auto Setting of League from ON to OFF. "
            + "Do you want to update OFF for all matches in the league?";

            const message =  service.getConfirmMessage(true);

            expect(message).toEqual(expectMessage);
        });

        it('should return correct message when auto is OFF', () => {
            const expectMessage = "You have changed Auto Setting of League from OFF to ON. "
            + "Do you want to update ON for all matches in the league?";

            const message =  service.getConfirmMessage(false);

            expect(message).toEqual(expectMessage);
        });
    });

    describe('updateLeague', () => {
         const matchOne = new MatchDetail();
        matchOne.matchId = 1;
        matchOne.autoCalcSetting = new  AutoSetting();
        const matchTwo =  new MatchDetail();
        matchTwo.matchId = 2;
        matchTwo.autoCalcSetting = new  AutoSetting();

        const leagueMatches = new LeagueMatches();
        leagueMatches.isAutoSettingForLeague = false;
        leagueMatches.matches = [matchOne, matchTwo];
        it('should reset match of league when update success', async () => {
            jest.spyOn(requestService, 'updateLeague').mockReturnValue(Promise.resolve(successfulResult));
            matchOne.autoCalcSetting.isAutoSettingForMatch = false;
            matchTwo.autoCalcSetting.isAutoSettingForMatch = false;

            await service.updateLeague(leagueMatches, true);

            expect(leagueMatches.isAutoSettingForLeague).toBe(true);
            expect(matchOne.autoCalcSetting.isAutoSettingForMatch).toBe(true);
            expect(matchTwo.autoCalcSetting.isAutoSettingForMatch).toBe(true);
        });

        it('should show alert when update request is unsuccess.', async() => {
            jest.spyOn(requestService, 'updateLeague').mockReturnValue(Promise.resolve(unSuccessfulResult));
            jest.spyOn(messageBoxService , 'alert');

            await service.updateLeague(leagueMatches, true);

            expect(messageBoxService.alert).toHaveBeenCalled();
        });
    });
});