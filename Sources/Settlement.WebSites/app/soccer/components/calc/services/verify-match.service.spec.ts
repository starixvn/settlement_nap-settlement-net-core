import { VerifyMatchService } from './verify-match.service';
import { TestBed } from '@angular/core/testing';
import { CreateDataTest } from './create-data-test.native';
import { FantasyRelatedMatch } from '../models/match.model';
import { Remark } from '../../../../shared/models';

describe('Soccer - VerifyMatchService', () => {
    let service: VerifyMatchService;
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            VerifyMatchService,
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(VerifyMatchService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('Should return true when there are any confirmHT or confirmFT or eventStatus = completed.', () => {
        const data =  CreateDataTest.MatchDetail();
        data.confirmHT = 123;
        expect(service.isCompletedMatch(data)).toBe(true);

        data.confirmHT = 0;
        data.confirmHT = 123;
        expect(service.isCompletedMatch(data)).toBe(true);

        data.confirmHT = 0;
        data.confirmHT = 0;
        data.eventStatus = "Completed";
        expect(service.isCompletedMatch(data)).toBe(true);
    });

    it('Should return true when there are any (isInstant or hasInstantCompleted) and playTime > 0.', () => {
        const data =  CreateDataTest.MatchDetail();
        data.isInstant = true;
        data.playTime = 1
        expect(service.isInstantMatch(data)).toBe(true);

        data.isInstant = false;
        data.hasInstantCompleted = true;
        data.playTime = 1
        expect(service.isInstantMatch(data)).toBe(true);
    });

    it('Should return true when there are leagueGroupId = 113 and playTime > 0.', () => {
        const data =  CreateDataTest.MatchDetail();
        data.leagueGroupId = 113;
        data.playTime = 1
        expect(service.isPinGoal(data)).toBe(true);
    });

    it('Should return true when there are playTime > 45.', () => {
        const data =  CreateDataTest.MatchDetail();
        data.playTime = 46
        expect(service.isEndFirstHalf(data)).toBe(true);
    });

    describe('isRelatedMatchesInsufficient', () => {
        it('should return true when related matches is fewer than related teams', () => {
            const relatedTeams = ["1", "2", "3", "4"];
            const relatedMatch = {} as FantasyRelatedMatch;

            expect(service.isRelatedMatchesInsufficient(relatedTeams, [relatedMatch])).toBe(true);
        });

        it('should return true when related matches teams and related teams are not match', () => {
            const relatedTeams = ["1", "2", "3", "4"];
            const relatedMatchA = {} as FantasyRelatedMatch;
            relatedMatchA.homeId = 1;
            relatedMatchA.awayId = 2;
            const relatedMatchB = {} as FantasyRelatedMatch;
            relatedMatchB.homeId = 1;
            relatedMatchB.awayId = 2;
            const relatedMatches = [relatedMatchA, relatedMatchB];

            expect(service.isRelatedMatchesInsufficient(relatedTeams, relatedMatches)).toBe(true);
        });

        it('should return false when related matches teams and related teams are match', () => {
            const relatedTeams = ["1", "2", "3", "4"];
            const relatedMatchA = {} as FantasyRelatedMatch;
            relatedMatchA.homeId = 1;
            relatedMatchA.awayId = 2;
            const relatedMatchB = {} as FantasyRelatedMatch;
            relatedMatchB.homeId = 3;
            relatedMatchB.awayId = 4;
            const relatedMatches = [relatedMatchA, relatedMatchB];

            expect(service.isRelatedMatchesInsufficient(relatedTeams, relatedMatches)).toBe(false);
        });
    });

    describe('isExistHoldMatch', () => {
        it('should return true when there is hold match', () => {
            const relatedMatch = {} as FantasyRelatedMatch;
            relatedMatch.remark = new Remark();
            relatedMatch.remark.isKeyHold = true;

            expect(service.isExistHoldMatch([relatedMatch])).toBe(true);
        });

        it('should return false when there is no hold match', () => {
            const relatedMatch = {} as FantasyRelatedMatch;
            relatedMatch.remark = new Remark();

            expect(service.isExistHoldMatch([relatedMatch])).toBe(false);
        });
    });
});