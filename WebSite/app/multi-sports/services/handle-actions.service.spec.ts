import { TestBed } from "@angular/core/testing";
import { LeagueMatch, Match, SportMatch } from "../models";
import { HandleActionsService } from "./handle-actions.service";
import { ChangedMatchSetting, ChangeSettingResult, Remark, } from "../../shared/models";
import { BackgroundColor, EventStatus } from "../../shared/constants";
describe('MultiSport - HandleActionsService', () => {
    let service: HandleActionsService;
    let match: Match;
    const league: LeagueMatch = {
        leagueId: 7000000,
        matches: [match],
        name: 'mock league',
        collapse: false,
        isAutoPayoutForLeague: false,
        autoWaitingTime: 0
        autoWaitingTime: 0
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
});