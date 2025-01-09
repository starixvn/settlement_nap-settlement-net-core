import { GoalRecordWithSemicolonService } from './goal-record-with-semicolon.service';
import { TestBed } from '@angular/core/testing';
import { GoalNameIcon } from '../models/constant.native';
import { CreateDataTest } from './create-data-test.native';
import { GoalIcon } from '../../../models/goal-icon.model';
import { VerifyScoreGoalService } from "./verify-score-goal.service";

describe('Soccer - Verify Goal Record with semicolon', () => {
    let service: GoalRecordWithSemicolonService;
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            GoalRecordWithSemicolonService,
            VerifyScoreGoalService
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(GoalRecordWithSemicolonService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe("oneCharacterHalftimeGoalRecord", () => {
        it('Should return halfTimeHomeGoal when first character goal record = H', () => {
            const goalIcon = service.oneCharacterHalftimeGoalRecord("H");
            expect(goalIcon.halfTimeHomeGoal).toEqual(GoalNameIcon.halftimeFirstLastGoal);
        });

        it('Should return halfTimeAwayGoal when first character goal record = A', () => {
            const goalIcon = service.oneCharacterHalftimeGoalRecord("A");
            expect(goalIcon.halfTimeAwayGoal).toEqual(GoalNameIcon.halftimeFirstLastGoal);
        });
    })

    describe("manyCharacterHalftimeGoalRecord", () => {
        const matchDetail = CreateDataTest.MatchDetail();

        it('Should return halfTimeHomeGoal when first, last character goal record = H', () => {
            matchDetail.goalRecord = "HAAAH";
            const goalIcon = service.manyCharacterHalftimeGoalRecord(matchDetail.goalRecord);
            expect(goalIcon.halfTimeHomeGoal).toEqual(GoalNameIcon.halftimeFirstLastGoal);
        });

        it('Should return halfTimeAwayGoal when first, last character goal record = A', () => {
            matchDetail.goalRecord = "AHAAA";
            const goalIcon = service.manyCharacterHalftimeGoalRecord(matchDetail.goalRecord);
            expect(goalIcon.halfTimeAwayGoal).toEqual(GoalNameIcon.halftimeFirstLastGoal);
        });

        it('Should return halfTimeHomeGoal, halfTimeAwayGoal when first character goal record = A, last character = H', () => {
            matchDetail.goalRecord = "AHAAAH";
            const goalIcon = service.manyCharacterHalftimeGoalRecord(matchDetail.goalRecord);
            expect(goalIcon.halfTimeHomeGoal).toEqual(GoalNameIcon.halftimeLastGoal);
            expect(goalIcon.halfTimeAwayGoal).toEqual(GoalNameIcon.halftimeFirstGoal);
        });

        it('Should return halfTimeHomeGoal, halfTimeAwayGoal when first character goal record = H, last character = A', () => {
            matchDetail.goalRecord = "HAAA";
            const goalIcon = service.manyCharacterHalftimeGoalRecord(matchDetail.goalRecord);
            expect(goalIcon.halfTimeHomeGoal).toEqual(GoalNameIcon.halftimeFirstGoal);
            expect(goalIcon.halfTimeAwayGoal).toEqual(GoalNameIcon.halftimeLastGoal);
        });
    })

    describe("oneCharacterFulTimeGoalRecord", () => {
        const matchDetail = CreateDataTest.MatchDetail();
        const goal = new GoalIcon("", "", "", "");

        it('Should return homeGoal when finalScore is not empty and first character goalrecord = H', () => {
            matchDetail.goalRecord = "H";
            matchDetail.finalHomeScore = '2';
            matchDetail.finalAwayScore = '1';
            const goalIcon = service.oneCharacterFulTimeGoalRecord(matchDetail, matchDetail.goalRecord, goal);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.firstLastGoal);
        });

        it('Should return awayGoal when finalScore is not empty and first character goalrecord = A', () => {
            matchDetail.goalRecord = "A";
            matchDetail.finalHomeScore = '2';
            matchDetail.finalAwayScore = '1';
            const goalIcon = service.oneCharacterFulTimeGoalRecord(matchDetail, matchDetail.goalRecord, goal);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.firstLastGoal);
        });

        it('Should return homeGoal when finalScore is empty and first character goalrecord = H', () => {
            matchDetail.goalRecord = "H";
            matchDetail.finalHomeScore = null;
            matchDetail.finalAwayScore = null;
            const goalIcon = service.oneCharacterFulTimeGoalRecord(matchDetail, matchDetail.goalRecord, goal);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.firstGoal);
        });

        it('Should return awayGoal when finalScore is empty and first character goalrecord = A', () => {
            matchDetail.goalRecord = "A";
            matchDetail.finalHomeScore = null;
            matchDetail.finalAwayScore = null;
            const goalIcon = service.oneCharacterFulTimeGoalRecord(matchDetail, matchDetail.goalRecord, goal);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.firstGoal);
        });
    })
});