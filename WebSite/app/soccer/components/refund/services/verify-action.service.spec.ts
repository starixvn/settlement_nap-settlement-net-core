import { TestBed } from "@angular/core/testing";
import { CalculateAction } from "../../../../shared/constants";
import { Language } from "../../../../shared/language.native";
import { BetDaq, BetFair, Match, MatchDetail } from "../model/match.model";
import { VerifyActionService } from "./verify-action.service";
import { VerifyMatchService } from "./verify-match.service";

describe('Soccer refund - VerifyActionService', () => {
    let service: VerifyActionService;

    const matchDetail = {} as MatchDetail;
    const betDaq = {} as BetDaq;
    const betFair = {} as BetFair;
    const match: Match = {
        matchDetail,
        permission: null,
        resultDetails: [],
        hedgeMatchDetail: null,
        betDaq,
        betFair
    };
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            VerifyActionService,
            VerifyMatchService
        ], imports: [
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(VerifyActionService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('createContentSpecificBetTypes', () => {
        it('should return  correct content when both betDaq and betFair checked', () => {
            betDaq.settleDeterminedBetDaq = true;
            betFair.settleDeterminedBetFair = true;
            const expected = `${Language.specificBetType.betDaq} and ${Language.specificBetType.betFair}`;

            expect(service.createContentSpecificBetTypes(betDaq, betFair)).toEqual(expected);
        });

        it('should return correct content when betDaq is checked', () => {
            betDaq.settleDeterminedBetDaq = true;
            betFair.settleDeterminedBetFair = false;

            expect(service.createContentSpecificBetTypes(betDaq, betFair)).toEqual(Language.specificBetType.betDaq);
        });

        it('should return correct content when betFair is checked', () => {
            betDaq.settleDeterminedBetDaq = false;
            betFair.settleDeterminedBetFair = true;

            expect(service.createContentSpecificBetTypes(betDaq, betFair)).toEqual(Language.specificBetType.betFair);
        });

        it('should return empty when both betDaq and betFair not checked', () => {
            betDaq.settleDeterminedBetDaq = false;
            betFair.settleDeterminedBetFair = false;

            expect(service.createContentSpecificBetTypes(betDaq, betFair)).toEqual("");
        });
    });

    describe('verifyFulltime', () => {
        it('should return error message about input score when score empty', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = null;

            expect(service.verifyFulltime(matchDetail)).toEqual(Language.warningInputScore);
        });

        it('should return message about semicolon when bet status equal refund ht', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';
            matchDetail.applyGoalRecord = true;
            matchDetail.betStatus = "Refund HT;";
            matchDetail.goalRecord = "HA;";

            expect(service.verifyFulltime(matchDetail)).toEqual(Language.soccer.noNeedSemicolonOnGoalRecord);
        });

        it('should return message about semicolon when match not refund ht', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';
            matchDetail.applyGoalRecord = true;
            matchDetail.betStatus = "running";
            matchDetail.goalRecord = "HA";

            expect(service.verifyFulltime(matchDetail)).toEqual(Language.soccer.needSemicolonOnGoalRecord);
        });

        it('should return message about goal record when goal record not match with final score', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';
            matchDetail.applyGoalRecord = true;
            matchDetail.betStatus = "running";
            matchDetail.goalRecord = ";AA";

            expect(service.verifyFulltime(matchDetail)).toEqual(Language.soccer.goalRecordNotConsistent);
        });

        it('should return message about goal record when goal record not match with halfTime score', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';
            matchDetail.halfTimeAwayScore = '1';
            matchDetail.halfTimeHomeScore = '1';
            matchDetail.applyGoalRecord = true;
            matchDetail.betStatus = "running";
            matchDetail.goalRecord = "A;H";

            expect(service.verifyFulltime(matchDetail)).toEqual(Language.soccer.halfTimeGoalRecordNotConsistent);
        });

        it('should return message about score Inconsistent when HT score > FT Score', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';
            matchDetail.isScoreInconsistent = true;
            matchDetail.applyGoalRecord = false;
            matchDetail.betStatus = "running";

            expect(service.verifyFulltime(matchDetail)).toEqual(Language.soccer.confirmWithInconsistentScore);
        });

        it('should return empty when pass all validation', () => {
            matchDetail.finalAwayScore = '1';
            matchDetail.finalHomeScore = '1';
            matchDetail.isScoreInconsistent = false;
            matchDetail.applyGoalRecord = false;
            matchDetail.betStatus = "running";

            expect(service.verifyFulltime(matchDetail)).toEqual("");
        });
    });

    describe('verifyAll', () => {
        it('should return error message about input score when score empty', () => {
            matchDetail.halfTimeAwayScore = '1';
            matchDetail.halfTimeHomeScore = null;

            expect(service.verifyAll(matchDetail)).toEqual(Language.warningInputScore);
        });

        it('should return message about semicolon when goal record  exist semicolon', () => {
            matchDetail.halfTimeAwayScore = '1';
            matchDetail.halfTimeHomeScore = '1';
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "HA;";

            expect(service.verifyAll(matchDetail)).toEqual(Language.soccer.noNeedSemicolonOnGoalRecord);
        });


        it('should return message about goal record when goal record not match with halfTime score', () => {
            matchDetail.halfTimeAwayScore = '1';
            matchDetail.halfTimeHomeScore = '1';
            matchDetail.applyGoalRecord = true;
            matchDetail.goalRecord = "A";

            expect(service.verifyAll(matchDetail)).toEqual(Language.soccer.halfTimeGoalRecordNotConsistent);
        });

        it('should return message about score Inconsistent when HT score > FT Score', () => {
            matchDetail.halfTimeAwayScore = '1';
            matchDetail.halfTimeHomeScore = '1';
            matchDetail.isScoreInconsistent = true;
            matchDetail.applyGoalRecord = false;

            expect(service.verifyAll(matchDetail)).toEqual(Language.soccer.confirmWithInconsistentScore);
        });

        it('should return empty when pass all validation', () => {
            matchDetail.halfTimeAwayScore = '1';
            matchDetail.halfTimeHomeScore = '1';
            matchDetail.isScoreInconsistent = false;
            matchDetail.applyGoalRecord = false;

            expect(service.verifyAll(matchDetail)).toEqual("");
        });
    });

    describe('getMessageConfirm', () => {
        it('should return correct message when action is refund all and match abandoned', () => {
            match.matchDetail.isSettleAbandonedMatchIBC = true;

            expect(service.getMessageConfirm(CalculateAction.refund, match)).toEqual(Language.soccer.refundAllAbandoned);
        });

        it('should return correct message when action is refund all and match not abandoned', () => {
            match.matchDetail.isSettleAbandonedMatchIBC = false;

            expect(service.getMessageConfirm(CalculateAction.refund, match)).toEqual(Language.soccer.refundAllNormal);
        });

        it('should return correct message when action is refund FT and match not abandoned', () => {
            match.matchDetail.isSettleAbandonedMatchIBC = false;

            expect(service.getMessageConfirm(CalculateAction.refundFullTime, match)).toEqual(Language.soccer.refundFullTimeNormalNotSdt);
        });

        it('should return correct message when action is refund FT and match abandoned', () => {
            match.matchDetail.isSettleAbandonedMatchIBC = true;

            expect(service.getMessageConfirm(CalculateAction.refundFullTime, match)).toEqual(Language.soccer.refundFullTimeAbandoned);
        });
    });
});