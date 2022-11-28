import { TestBed } from "@angular/core/testing";
import { Match } from "../models";
import { AutoSetting, MoreScore, Remark } from "../../shared/models";
import { DetectChangesService } from "./detect-changes.service";

describe('MultiSport - DetectChangesService', () => {
    let service: DetectChangesService;
    let oldMatch: Match;
    let newMatch: Match;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DetectChangesService,
            ]
        });

        service = TestBed.inject(DetectChangesService);
    });

    it('should create service', () => {
        expect(service).toBeTruthy();
    });

    describe('detect', () => {
        beforeEach(() => {
            oldMatch = new Match();
            newMatch = new Match();
        });

        it('should return false when old match equals new match', () => {
            const result = service.detect(oldMatch, newMatch);

            expect(result).toBe(false);
        });

        it('should return false when old match and new match have different match id', () => {
            oldMatch.matchId = '12345';
            newMatch.matchId = '54321';

            const result = service.detect(oldMatch, newMatch);

            expect(result).toBe(false);
        });

        it('should return true when matches info are different', () => {
            newMatch.eventStatus = 'running';
            newMatch.halfTimeHomeScore = 1;
            newMatch.halfTimeAwayScore = 2;
            newMatch.finalAwayScore = 1;
            newMatch.finalHomeScore = 2;
            newMatch.betStatus = '1-0';
            newMatch.earlySettleStatus = 'running';
            newMatch.moreScores = new MoreScore();
            newMatch.remark = new Remark();

            const result = service.detect(oldMatch, newMatch);

            expect(result).toBe(true);
        });

        it('should return true when matches status are different', () => {
            newMatch.isCalRefund = true;
            newMatch.isCalculated = true;
            newMatch.isCalculatingMP = 1;
            newMatch.isCalculatingSingle = 1;
            newMatch.isExistMarkedTicket = true;
            newMatch.isExistMarkedTicketParlay = true;
            newMatch.isExistRunningTicket = true;
            newMatch.isHalfTimeCal = true;
            newMatch.isMultiCaled = true;
            newMatch.isRefund = true;

            const result = service.detect(oldMatch, newMatch);

            expect(result).toBe(true);
        });

        it('should return true when suspenders are different', () => {
            newMatch.suspenderHalfTime = 'abc';
            newMatch.suspenderFullTime = 'abc';

            const result = service.detect(oldMatch, newMatch);

            expect(result).toBe(true);
        });
    })
});