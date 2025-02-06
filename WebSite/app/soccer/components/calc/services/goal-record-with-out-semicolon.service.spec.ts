import { GoalRecordWithOutSemicolonService } from './goal-record-with-out-semicolon.service';
import { TestBed } from '@angular/core/testing';
import { GoalNameIcon } from '../models/constant.native';
import { GoalIcon } from '../../../models/goal-icon.model';
import { VerifyScoreGoalService } from "./verify-score-goal.service";
import { ResultDetail } from '../../../models';

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
        const goal = new GoalIcon("", "", "", "");
        it('Should return homeGoal when finalScore is not empty and first, last character goalrecord = H', () => {
            const goalRecord = "HAAAH";
            const fulltimeResult = { homeValue: '2', awayValue: '1' } as unknown as ResultDetail;
            const goalIcon = service.manyCharacterGoalRecord(fulltimeResult, goalRecord, goal);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.firstLastGoal);
        });

        it('Should return awayGoal when finalScore is not empty and first, last character goalrecord = A', () => {
            const goalRecord = "AHAAAHA";
            const fulltimeResult = { homeValue: '2', awayValue: '1' } as unknown as ResultDetail;
            const goalIcon = service.manyCharacterGoalRecord(fulltimeResult, goalRecord, goal);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.firstLastGoal);
        });

        it('Should return homeGoal, awayGoal when finalScore is not empty and first character goalrecord = A, last character = H', () => {
            const goalRecord = "AHAAAH";
            const fulltimeResult = { homeValue: '2', awayValue: '1' } as unknown as ResultDetail;
            const goalIcon = service.manyCharacterGoalRecord(fulltimeResult, goalRecord, goal);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.lastGoal);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.firstGoal);
        });

        it('Should return homeGoal, awayGoal when finalScore is not empty and first character goalrecord = H, last character = A', () => {
            const goalRecord = "HAAAHA";
            const fulltimeResult = { homeValue: '2', awayValue: '1' } as unknown as ResultDetail;
            const goalIcon = service.manyCharacterGoalRecord(fulltimeResult, goalRecord, goal);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.firstGoal);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.lastGoal);
        });

        it('Should return homeGoal when finalScore is empty and first character goalrecord = H', () => {
            const goalRecord = "HAAA";
            const goalIcon = service.manyCharacterGoalRecord(new ResultDetail(), goalRecord, goal);
            expect(goalIcon.homeGoal).toEqual(GoalNameIcon.firstGoal);
        });

        it('Should return awayGoal when finalScore is empty and first character goalrecord = A', () => {
            const goalRecord = "AHHHH";
            const goalIcon = service.manyCharacterGoalRecord(new ResultDetail(), goalRecord, goal);
            expect(goalIcon.awayGoal).toEqual(GoalNameIcon.firstGoal);
        });
    })
});