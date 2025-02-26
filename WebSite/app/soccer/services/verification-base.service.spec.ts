import { TestBed } from "@angular/core/testing";
import { MatchDetailBase } from "../models";
import { VerificationBaseService } from "./verification-base.service";

describe('Soccer refund - VerificationBaseService', () => {
    let service: VerificationBaseService;

    const matchDetail = {} as MatchDetailBase;
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            VerificationBaseService,
        ], imports: [
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(VerificationBaseService);
    });

    it('isEmptyScore - isEmpty - should return true when score is empty or null', () => {
        expect(service.isEmptyScore(null)).toBeTruthy();
        expect(service.isEmpty(null)).toBeTruthy();
        expect(service.isEmpty("")).toBeTruthy();
    });

    describe('goalRecordExistSemicolon', () => {
        it('should return false when match not apply goal record', () => {
            matchDetail.applyGoalRecord = false;

            expect(service.goalRecordExistSemicolon(matchDetail)).toBeFalsy();
        });

        it('should return false when goal record not exist semicolon', () => {
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "H"

            expect(service.goalRecordExistSemicolon(matchDetail)).toBeFalsy();
        });
    });

    describe('goalRecordNotExistSemicolon', () => {
        it('should return false when match not apply goal record', () => {
            matchDetail.applyGoalRecord = false;

            expect(service.goalRecordNotExistSemicolon(matchDetail)).toBeFalsy();
        });

        it('should return false when goal record include semicolon', () => {
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = ";H"

            expect(service.goalRecordNotExistSemicolon(matchDetail)).toBeFalsy();
        });
    });

    describe('isHtGoalRecordInvalid', () => {
        it('should return true when goal record length not equal sum of score', () => {
            matchDetail.halfTimeAwayScore = '1';
            matchDetail.halfTimeHomeScore = '1';
            matchDetail.goalRecord = "HAH;";

            const actual = service.isHtGoalRecordInvalid(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return true when goal record home value not equal home score', () => {
            matchDetail.halfTimeAwayScore = '1';
            matchDetail.halfTimeHomeScore = '1';
            matchDetail.goalRecord = "AA;";

            const actual = service.isHtGoalRecordInvalid(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return true when goal record away value not equal away score', () => {
            matchDetail.halfTimeAwayScore = '1';
            matchDetail.halfTimeHomeScore = '1';
            matchDetail.goalRecord = "HH;";

            const actual = service.isHtGoalRecordInvalid(matchDetail);

            expect(actual).toBeTruthy();
        });
    });

    describe('isHTGoalRecordConsistent', () => {
        it('should return true when halftime score has value', () => {
            matchDetail.halfTimeAwayScore = '1';
            matchDetail.goalRecord = "A;";
            matchDetail.applyGoalRecord = true;

            jest.spyOn(service, 'isHtGoalRecordInvalid').mockReturnValue(true);

            const actual = service.isHTGoalRecordConsistent(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return true when goal record has semicolon', () => {
            matchDetail.halfTimeAwayScore = null;
            matchDetail.halfTimeHomeScore = null;
            matchDetail.goalRecord = "H;";
            matchDetail.applyGoalRecord = true;
            jest.spyOn(service, 'isHtGoalRecordInvalid').mockReturnValue(true);

            const actual = service.isHTGoalRecordConsistent(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return false when ht goal record consistent', () => {
            matchDetail.halfTimeAwayScore = null;
            matchDetail.halfTimeHomeScore = null;
            matchDetail.goalRecord = "";
            matchDetail.betStatus = "Calculated";

            const actual = service.isHTGoalRecordConsistent(matchDetail);

            expect(actual).toBeFalsy();
        });
    });

    describe('isAlreadyRefundHT', () => {
        it('should return true when score is null', () => {
            matchDetail.betStatus = "Refund HT";

            const actual = service.isAlreadyRefundHT(matchDetail.betStatus);

            expect(actual).toBeTruthy();
        });

        it('should return false  when bet status is empty', () => {
            matchDetail.betStatus = "";

            const actual = service.isAlreadyRefundHT(matchDetail.betStatus);

            expect(actual).toBeFalsy();
        });
    });

    describe('isFullTimeGoalRecordInvalid', () => {
        it('should return true when score length not equal goal record length', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';
            matchDetail.goalRecord = ';H';
            matchDetail.applyGoalRecord = true;

            const actual = service.isFullTimeGoalRecordInvalid(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return true when Home score length not equal goal record Home length', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';
            matchDetail.goalRecord = ';HH';
            matchDetail.applyGoalRecord = true;

            const actual = service.isFullTimeGoalRecordInvalid(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return true when away score length not equal goal record away length', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';
            matchDetail.goalRecord = ';AA';
            matchDetail.applyGoalRecord = true;

            const actual = service.isFullTimeGoalRecordInvalid(matchDetail);

            expect(actual).toBeTruthy();
        });

        it('should return false when score  equal goal record ', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';
            matchDetail.goalRecord = ';HA';
            matchDetail.applyGoalRecord = true;

            const actual = service.isFullTimeGoalRecordInvalid(matchDetail);

            expect(actual).toBeFalsy();
        });

        it('should return false when match no apply goal record ', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '2';
            matchDetail.goalRecord = ';HA';
            matchDetail.applyGoalRecord = false;

            const actual = service.isFullTimeGoalRecordInvalid(matchDetail);

            expect(actual).toBeFalsy();
        });
    });

});