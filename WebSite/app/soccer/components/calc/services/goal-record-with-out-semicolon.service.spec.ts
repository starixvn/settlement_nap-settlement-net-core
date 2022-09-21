import { GoalRecordWithOutSemicolonService } from './goal-record-with-out-semicolon.service';
import { TestBed } from '@angular/core/testing';
import { GoalNameIcon } from '../models/constant.native';
import { CreateDataTest } from './create-data-test.native';
import { GoalIcon } from '../../../models/goal-icon.model';
import { VerifyScoreGoalService } from "./verify-score-goal.service";

describe('Soccer - Verify Goal Record with out semicolon', () => {
    let service: GoalRecordWithOutSemicolonService;
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            GoalRecordWithOutSemicolonService,
            VerifyScoreGoalService
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(GoalRecordWithOutSemicolonService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe("oneCharacterGoalRecord", () => {
        const newGoalIcon = new GoalIcon("", "", "", "");

        it('Should return homeGoal when first character goalrecord = H', () => {
            const goalIcon = service.oneCharacterGoalRecord("H", newGoalIcon);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.firstGoal);
        });

        it('Should return awayGoal when first character goalrecord = A', () => {
            const goalIcon = service.oneCharacterGoalRecord("A", newGoalIcon);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.firstGoal);
        });
    })

    describe("manyCharacterGoalRecord", () => {
        const matchDetail = CreateDataTest.MatchDetail();
        const goal = new GoalIcon("", "", "", "");
        it('Should return homeGoal when finalScore is not empty and first, last character goalrecord = H', () => {
            matchDetail.goalRecord = "HAAAH";
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 1;
            const goalRecord = matchDetail.goalRecord;
            const goalIcon = service.manyCharacterGoalRecord(matchDetail, goalRecord, goal);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.firstLastGoal);
        });

        it('Should return awayGoal when finalScore is not empty and first, last character goalrecord = A', () => {
            matchDetail.goalRecord = "AHAAAHA";
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 1;
            const goalRecord = matchDetail.goalRecord;
            const goalIcon = service.manyCharacterGoalRecord(matchDetail, goalRecord, goal);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.firstLastGoal);
        });

        it('Should return homeGoal, awayGoal when finalScore is not empty and first character goalrecord = A, last character = H', () => {
            matchDetail.goalRecord = "AHAAAH";
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 1;
            const goalRecord = matchDetail.goalRecord;
            const goalIcon = service.manyCharacterGoalRecord(matchDetail, goalRecord, goal);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.lastGoal);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.firstGoal);
        });

        it('Should return homeGoal, awayGoal when finalScore is not empty and first character goalrecord = H, last character = A', () => {
            matchDetail.goalRecord = "HAAAHA";
            matchDetail.finalHomeScore = 2;
            matchDetail.finalAwayScore = 1;
            const goalRecord = matchDetail.goalRecord;
            const goalIcon = service.manyCharacterGoalRecord(matchDetail, goalRecord, goal);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.firstGoal);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.lastGoal);
        });

        it('Should return homeGoal when finalScore is empty and first character goalrecord = H', () => {
            matchDetail.goalRecord = "HAAA";
            const goalRecord = matchDetail.goalRecord;
            const goalIcon = service.manyCharacterGoalRecord(matchDetail, goalRecord, goal);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.firstGoal);
        });

        it('Should return awayGoal when finalScore is empty and first character goalrecord = A', () => {
            matchDetail.goalRecord = "AHHHH";
            const goalRecord = matchDetail.goalRecord;
            const goalIcon = service.manyCharacterGoalRecord(matchDetail, goalRecord, goal);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.firstGoal);
        });
    })
});