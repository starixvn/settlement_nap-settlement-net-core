import { TestBed } from '@angular/core/testing';
import { GoalNameIcon } from '../models/constant.model';
import { CreateDataTest } from './create-data-test.native';
import { GoalIcon } from '../../../models/goal-icon.model';
import { GoalIconService } from './goal-icon.service';
import { GoalRecordWithOutSemicolonService } from './goal-record-with-out-semicolon.service';
import { GoalRecordWithSemicolonService } from './goal-record-with-semicolon.service';
import { VerifyScoreGoalService } from "./verify-score-goal.service";
import { ResultDetail } from '../../../../shared/models/sportsbook-sop';
describe('Soccer - Verify Goal Icon service', () => {
    let service: GoalIconService;
    let goalRecordWithOutSemicolonService: GoalRecordWithOutSemicolonService;
    let goalRecordWithSemicolonService: GoalRecordWithSemicolonService;

    const firstHalf = new ResultDetail();
    const fullTime = new ResultDetail();
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            GoalIconService,
            GoalRecordWithOutSemicolonService,
            GoalRecordWithSemicolonService,
            VerifyScoreGoalService
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(GoalIconService);
        goalRecordWithOutSemicolonService = TestBed.inject(GoalRecordWithOutSemicolonService);
        goalRecordWithSemicolonService = TestBed.inject(GoalRecordWithSemicolonService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe("goalRecordWithOutSemicolon", () => {
        const matchDetail = CreateDataTest.MatchDetail();
        it('Should return expected goalIcon when goalrecord is empty', () => {
            const expectedGoalIcon = new GoalIcon("", "", "", "");
            const actualGoalIcon = service.generateGoalIcon(matchDetail, firstHalf, fullTime)
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call oneCharacterGoalRecord function from goalRecordWithOutSemicolonService when isExistFgLg = 1 and goalrecord only one character.', () => {
            const expectedGoalIcon = new GoalIcon(GoalNameIcon.firstGoal, "", "", "");
            matchDetail.isExistFgLg = true;
            matchDetail.goalRecord = "H";
            goalRecordWithOutSemicolonService.oneCharacterGoalRecord = jest.fn().mockReturnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail, firstHalf, fullTime);
            expect(goalRecordWithOutSemicolonService.oneCharacterGoalRecord).toHaveBeenCalled();
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call manyCharacterGoalRecord function from goalRecordWithOutSemicolonService when isExistFgLg = 1 and goalrecord many character.', () => {
            const expectedGoalIcon = new GoalIcon(GoalNameIcon.firstLastGoal, "", "", "");
            matchDetail.isExistFgLg = true;
            matchDetail.goalRecord = "HHA";
            goalRecordWithOutSemicolonService.manyCharacterGoalRecord = jest.fn().mockReturnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail, firstHalf, fullTime);
            expect(goalRecordWithOutSemicolonService.manyCharacterGoalRecord).toHaveBeenCalled();
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });
    })

    describe("goalRecordWithSemicolon", () => {
        const matchDetail = CreateDataTest.MatchDetail();
        it('Should return expected goalIcon when goalrecord = ;', () => {
            const expectedGoalIcon = new GoalIcon("", "", "", "");
            matchDetail.goalRecord = ";"
            const actualGoalIcon = service.generateGoalIcon(matchDetail, firstHalf, fullTime)
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call oneCharacterHalftimeGoalRecord function from goalRecordWithSemicolonService when isExistHtFgLg = 1 and goalrecord only one character.', () => {
            const expectedGoalIcon = new GoalIcon("", "", GoalNameIcon.halftimeFirstLastGoal , "");
            matchDetail.isExistHtFgLg = true;
            matchDetail.goalRecord = "H;";
            firstHalf.homeValue = '1';
            firstHalf.awayValue = '0';
            goalRecordWithSemicolonService.oneCharacterHalftimeGoalRecord = jest.fn().mockReturnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail, firstHalf, fullTime);
            expect(goalRecordWithSemicolonService.oneCharacterHalftimeGoalRecord).toHaveBeenCalled();
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call manyCharacterHalftimeGoalRecord function from goalRecordWithSemicolonService when isExistHtFgLg = 1 and goalrecord many character.', () => {
            const expectedGoalIcon = new GoalIcon(GoalNameIcon.firstLastGoal, "", "", "");
            matchDetail.isExistHtFgLg = true;
            matchDetail.goalRecord = "HH;";
            firstHalf.homeValue = '1';
            firstHalf.awayValue = '0';
            goalRecordWithSemicolonService.manyCharacterHalftimeGoalRecord = jest.fn().mockReturnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail, firstHalf, fullTime);
            expect(goalRecordWithSemicolonService.manyCharacterHalftimeGoalRecord).toHaveBeenCalled();
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        }); 

        it('Should expected goalIcon when isExistFgLg = 0 and isExistHtFgLg = 1 and goalrecord only one character.', () => {
            const expectedGoalIcon = new GoalIcon("", "", GoalNameIcon.halftimeFirstLastGoal , "");
            matchDetail.isExistFgLg = false;
            matchDetail.isExistHtFgLg = true;
            matchDetail.goalRecord = "H;H";
            firstHalf.homeValue = '1';
            firstHalf.awayValue = '0';
            goalRecordWithSemicolonService.oneCharacterHalftimeGoalRecord = jest.fn().mockReturnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail, firstHalf, fullTime);
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call oneCharacterFulTimeGoalRecord function from goalRecordWithSemicolonService when isExistFgLg = 1 and goalrecord only one character.', () => {
            const expectedGoalIcon = new GoalIcon(GoalNameIcon.firstLastGoal, "", "" , "");
            matchDetail.isExistFgLg = true;
            matchDetail.goalRecord = ";H";
            goalRecordWithSemicolonService.oneCharacterFulTimeGoalRecord = jest.fn().mockReturnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail, firstHalf, fullTime);
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call manyCharacterGoalRecord function from goalRecordWithOutSemicolonService when isExistFgLg = 1 and goalrecord many character.', () => {
            const expectedGoalIcon = new GoalIcon(GoalNameIcon.firstLastGoal, "", "" , "");
            matchDetail.isExistFgLg = true;
            matchDetail.goalRecord = ";AA";
            goalRecordWithOutSemicolonService.manyCharacterGoalRecord = jest.fn().mockReturnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail, firstHalf, fullTime);
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

    })
});