import { TestBed } from '@angular/core/testing';
import { GoalNameIcon } from '../models/constant.native';
import { CreateDataTest } from './create-data-test.native';
import { GoalIcon } from '../../../models/goal-icon.model';
import { GoalIconService } from './goal-icon.service';
import { GoalRecordWithOutSemicolonService } from './goal-record-with-out-semicolon.service';
import { GoalRecordWithSemicolonService } from './goal-record-with-semicolon.service';
import { VerifyScoreGoalService } from "./verify-score-goal.service";
describe('Soccer - Verify Goal Icon service', () => {
    let service: GoalIconService;
    let goalRecordWithOutSemicolonService: GoalRecordWithOutSemicolonService;
    let goalRecordWithSemicolonService: GoalRecordWithSemicolonService;
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
        goalRecordWithOutSemicolonService = TestBed.get(GoalRecordWithOutSemicolonService);
        goalRecordWithSemicolonService = TestBed.get(GoalRecordWithSemicolonService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe("goalRecordWithOutSemicolon", () => {
        const matchDetail = CreateDataTest.MatchDetail();
        it('Should return expected goalIcon when goalrecord is empty', () => {
            const expectedGoalIcon = new GoalIcon("", "", "", "");
            const actualGoalIcon = service.generateGoalIcon(matchDetail)
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call oneCharacterGoalRecord function from goalRecordWithOutSemicolonService when isExistFgLg = 1 and goalrecord only one character.', () => {
            const expectedGoalIcon = new GoalIcon(GoalNameIcon.firstGoal, "", "", "");
            matchDetail.isExistFgLg = true;
            matchDetail.goalRecord = "H";
            spyOn(goalRecordWithOutSemicolonService, 'oneCharacterGoalRecord').and.returnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail);
            expect(goalRecordWithOutSemicolonService.oneCharacterGoalRecord).toHaveBeenCalled();
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call manyCharacterGoalRecord function from goalRecordWithOutSemicolonService when isExistFgLg = 1 and goalrecord many character.', () => {
            const expectedGoalIcon = new GoalIcon(GoalNameIcon.firstLastGoal, "", "", "");
            matchDetail.isExistFgLg = true;
            matchDetail.goalRecord = "HHA";
            spyOn(goalRecordWithOutSemicolonService, 'manyCharacterGoalRecord').and.returnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail);
            expect(goalRecordWithOutSemicolonService.manyCharacterGoalRecord).toHaveBeenCalled();
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });
    })

    describe("goalRecordWithSemicolon", () => {
        const matchDetail = CreateDataTest.MatchDetail();
        it('Should return expected goalIcon when goalrecord = ;', () => {
            const expectedGoalIcon = new GoalIcon("", "", "", "");
            matchDetail.goalRecord = ";"
            const actualGoalIcon = service.generateGoalIcon(matchDetail)
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call oneCharacterHalftimeGoalRecord function from goalRecordWithSemicolonService when isExistHtFgLg = 1 and goalrecord only one character.', () => {
            const expectedGoalIcon = new GoalIcon("", "", GoalNameIcon.halftimeFirstLastGoal , "");
            matchDetail.isExistHtFgLg = true;
            matchDetail.goalRecord = "H;";
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.halfTimeAwayScore = 0;
            spyOn(goalRecordWithSemicolonService, 'oneCharacterHalftimeGoalRecord').and.returnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail);
            expect(goalRecordWithSemicolonService.oneCharacterHalftimeGoalRecord).toHaveBeenCalled();
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call manyCharacterHalftimeGoalRecord function from goalRecordWithSemicolonService when isExistHtFgLg = 1 and goalrecord many character.', () => {
            const expectedGoalIcon = new GoalIcon(GoalNameIcon.firstLastGoal, "", "", "");
            matchDetail.isExistHtFgLg = true;
            matchDetail.goalRecord = "HH;";
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.halfTimeAwayScore = 0;
            spyOn(goalRecordWithSemicolonService, 'manyCharacterHalftimeGoalRecord').and.returnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail);
            expect(goalRecordWithSemicolonService.manyCharacterHalftimeGoalRecord).toHaveBeenCalled();
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        }); 

        it('Should expected goalIcon when isExistFgLg = 0 and isExistHtFgLg = 1 and goalrecord only one character.', () => {
            const expectedGoalIcon = new GoalIcon("", "", GoalNameIcon.halftimeFirstLastGoal , "");
            matchDetail.isExistFgLg = false;
            matchDetail.isExistHtFgLg = true;
            matchDetail.goalRecord = "H;H";
            matchDetail.halfTimeHomeScore = 1;
            matchDetail.halfTimeAwayScore = 0;
            spyOn(goalRecordWithSemicolonService, 'oneCharacterHalftimeGoalRecord').and.returnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail);
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call oneCharacterFulTimeGoalRecord function from goalRecordWithSemicolonService when isExistFgLg = 1 and goalrecord only one character.', () => {
            const expectedGoalIcon = new GoalIcon(GoalNameIcon.firstLastGoal, "", "" , "");
            matchDetail.isExistFgLg = true;
            matchDetail.goalRecord = ";H";
            spyOn(goalRecordWithSemicolonService, 'oneCharacterFulTimeGoalRecord').and.returnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail);
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

        it('Should call manyCharacterGoalRecord function from goalRecordWithOutSemicolonService when isExistFgLg = 1 and goalrecord many character.', () => {
            const expectedGoalIcon = new GoalIcon(GoalNameIcon.firstLastGoal, "", "" , "");
            matchDetail.isExistFgLg = true;
            matchDetail.goalRecord = ";AA";
            spyOn(goalRecordWithOutSemicolonService, 'manyCharacterGoalRecord').and.returnValue(expectedGoalIcon);
            const actualGoalIcon = service.generateGoalIcon(matchDetail);
            expect(expectedGoalIcon).toEqual(actualGoalIcon);
        });

    })
});