import { TestBed } from "@angular/core/testing";
import { MultiSport } from "../models";
import { HandleActionsService } from "./handle-actions.service";
import { EventStatus } from "../constants";
import { ChangedMatchSetting, ChangeSettingResult, LeagueMatch, Match, MixParlay, Remark, SportMatch } from "../../shared/models";
import { BackgroundColor, SportType } from "../../shared/constants";
import { Permission } from "../../shared/models/sportsbook-sop/permission.model";
describe('MultiSport - HandleActionsService', () => {
    let service: HandleActionsService;
    let match: Match;
    const league: LeagueMatch = {
        leagueId: 7000000,
        matches: [match],
        name: 'mock league',
        collapse: false,
        isCheckedCalcMP: true,
        disableCheckCalcMP: false,
        isMergedParlay: false
    };

    const sport: SportMatch = {
    id: 100000,
    name: 'mock sport',
    leagues: [league],
    collapse: false,
    };

    const multiSport: MultiSport = {
        sports: [sport],
         permission: new Permission(),
        isCheckedCalcMP: false,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                HandleActionsService,
            ]
        });

        service = TestBed.inject(HandleActionsService);
    });

    it('should create service', () => {
        expect(service).toBeTruthy();
    });

    describe('handleEventStatusColor - should return', () => {
        beforeEach(() => {
            match = new Match();
        });

        it('postponed blinking color when match is postpone and having marked tickets', () => {
            match.eventStatus = EventStatus.postponed;
            match.isExistMarkedTicket = true;

            const result = service.handleEventStatusColor(match, false);

            expect(result).toEqual(BackgroundColor.postponedBlinking);
        });

        it('postponed color when match is postponed', () => {
            match.eventStatus = EventStatus.postponed;

            const result = service.handleEventStatusColor(match, false);

            expect(result).toEqual(BackgroundColor.postponed);
        });

        it('white blinking color when match is completed and having marked ticket', () => {
            match.eventStatus = EventStatus.completed;
            match.isExistMarkedTicket = true;
            match.isExistRunningTicket = false;

            const result = service.handleEventStatusColor(match, false);

            expect(result).toEqual(BackgroundColor.whiteBlinking);
        });

        it('running ticket blinking when match is completed and having marked and running tickets', () => {
            match.eventStatus = EventStatus.completed;
            match.isExistRunningTicket = true;
            match.isExistMarkedTicket = true;

            const result = service.handleEventStatusColor(match, false);

            expect(result).toEqual(BackgroundColor.runningTicketBlinking);
        });

        it('half time calculated color when match is completed and having running tickets', () => {
            match.eventStatus = EventStatus.completed;
            match.isExistMarkedTicket = false;
            match.isExistRunningTicket = true;

            const result = service.handleEventStatusColor(match, false);

            expect(result).toEqual(BackgroundColor.halfTimeCalculated);
        });

        it('empty when match is completed', () => {
            match.eventStatus = EventStatus.completed;

            const result = service.handleEventStatusColor(match, false);

            expect(result).toEqual('');
        });

        it('pending blinking when match is marked pending and having marked tickets', () => {
            match.isExistMarkedTicket = true;

            const result = service.handleEventStatusColor(match, true);

            expect(result).toEqual(BackgroundColor.pendingBlinking);
        });

        it('pending color when match is marked pending', () => {
            const result = service.handleEventStatusColor(match, true);

            expect(result).toEqual(BackgroundColor.pending);
        });

        it('white blinking when match is having marked ticket', () => {
            match.isExistMarkedTicket = true;

            const result = service.handleEventStatusColor(match, false);

            expect(result).toEqual(BackgroundColor.whiteBlinking);
        });

        it('empty when match is running', () => {
            match.eventStatus = 'running';

            const result = service.handleEventStatusColor(match, false);

            expect(result).toEqual('');
        });
    });

    describe('resetCheckboxCalcMixParlay', () => {
        beforeEach(() => {
            match = new Match();
        });

        it('should check all calc mp check box', () => {
            match.leagueId = 7000000;
            match.sportType = SportType.eSports;
            match.mixParlay = new MixParlay();
            match.mixParlay.hasMixParlay = true;
            multiSport.permission.canCalculateMp = true;
            match.isCheckedCalcMP = true;
            league.matches = [match];

            service.resetCheckboxCalcMixParlay(match, [sport], multiSport);

            expect(multiSport.isCheckedCalcMP).toBe(true);
            expect(league.isCheckedCalcMP).toBe(true);
        });

        it('should uncheck all calc mp check box', () => {
            match.leagueId = 7000000;
            match.sportType = SportType.eSports;
            match.mixParlay = new MixParlay();
            multiSport.permission.canCalculateMp = true;
            league.matches = [match];

            service.resetCheckboxCalcMixParlay(match, [sport], multiSport);

            expect(multiSport.isCheckedCalcMP).toBe(false);
            expect(league.isCheckedCalcMP).toBe(false);
        });
    });

    describe('handleChangeRemarkSetting', () => {
        const changeSetting = new ChangeSettingResult();
        changeSetting.match = new ChangedMatchSetting();
        changeSetting.match.remark = new Remark();

        it('should show link when no marked status', () => {
            service.handleChangeRemarkSetting(changeSetting, match, [sport], multiSport);

            expect(match.showLink).toBe(true);
        });

        it('should lock link when exist marked status', () => {
            changeSetting.match.remark.isKeyHold = true;

            service.handleChangeRemarkSetting(changeSetting, match, [sport], multiSport);

            expect(match.showLink).toBe(false);
        });
    })
});