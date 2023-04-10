import { inject, TestBed } from "@angular/core/testing";
import { ResourceNameByIdPipe } from "../../tennis/pipes";
import { ExternalResultDetail, MatchDetail, ResultDetail, ExternalResult, GeneralMatch } from "../../shared/models/sportsbook-sop";
import { VerificationBaseService } from "./verification-base.service";
import { Language } from "../../shared/language.native";
import { TicketStatusText, SportType } from "../../shared/constants";
import { ResultByTeamNamePipe } from "../../shared/pipes/result-by-team-name.pipe";

describe('VerificationBaseService', () => {
    let service: VerificationBaseService = null;
    const resultDetail = new ResultDetail();
    resultDetail.resourceId = "0101";
    resultDetail.awayValue = "1";
    resultDetail.homeValue = "2";
    
    const final = new ResultDetail();
    final.resourceId = "00";
    const externalResultDetail = new ExternalResultDetail(1, '1', '', '', '2', '1');

    const originalResultDetail = new ResultDetail();
    originalResultDetail.resourceId = 'M1';
    originalResultDetail.externalScores = [new ExternalResultDetail(1001, 'M1', ''), new ExternalResultDetail(0, 'M1', '')];
    const originalResultDetails = [originalResultDetail];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                VerificationBaseService,
                ResultByTeamNamePipe
            ]
        })

        service = TestBed.inject(VerificationBaseService);
    });

    beforeEach(inject([VerificationBaseService], (verificationService: VerificationBaseService) => {
        service = verificationService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    it('invalidInputScore - return true when exist map has score', () => {
        resultDetail.awayValue = "";
        final.homeValue = "0";
        const actualOne = service.invalidInputScore([resultDetail], false, '');
        const actualTwo = service.invalidInputScore([final], true, '00');

        expect(actualOne).toBeTruthy();
        expect(actualTwo).toBeTruthy();
    });

    it("getCalculationConfirmMessage - return correct message", () => {
        resultDetail.homeValue = "1";
        resultDetail.awayValue = "2";
        resultDetail.resourceId = "0101";

        const actualResult = service.getCalculationConfirmMessage([resultDetail], new ResourceNameByIdPipe());
        const expectedResult = `${Language.CalculationConfirmMessage}<br/>${Language.CalculationAdditionalConfirmation}<br/>`
            + `Set 1: 1-2<br/>`;

        expect(actualResult).toEqual(expectedResult);
    });

    describe("isTicketOnGame", () => {
        it('return true when exist result set has ticket', () => {
            resultDetail.ticketStatus = TicketStatusText.calculated;

            const actualResult = service.isTicketOnGame([resultDetail], '', '');

            expect(actualResult).toBeTruthy();
        });

        it('return true when exist result Match with special bettype', () => {
            resultDetail.ticketStatus = TicketStatusText.noTicket;
            resultDetail.isSpecialBettype = true;
            resultDetail.resourceId = "01"

            const actualResult = service.isTicketOnGame([resultDetail], '', '01');

            expect(actualResult).toBeTruthy();
        });
    });

    it('isExistMismatchScore - return true when exist result mismatch', () => {
        final.isScoreMismatched = true;
        final.checked = true;
        resultDetail.checked = true;

        const actualResult = service.isExistMismatchScore([resultDetail, final]);

        expect(actualResult).toBeTruthy();
    });

    describe('allMapHaveScoreSources', () => {
        it('should return true when all maps have score sources', () => {
            resultDetail.checked = true;
            const outsideResult = new ExternalResultDetail(1001, '', '', '', '2', '1');
            resultDetail.externalScores = [externalResultDetail, outsideResult];

            const result = service.allMapHaveScoreSources([resultDetail]);

            expect(result).toBe(true);
        });
        it('should return false when map missing score source', () => {
            resultDetail.checked = true;
            resultDetail.externalScores = [externalResultDetail];

            const result = service.allMapHaveScoreSources([resultDetail]);

            expect(result).toBe(false);
        });
    });

    it('isExistedHomeAwayScore - return false when exist value', () => {

        const result = service.isExistedHomeAwayScore("", "1");

        expect(result).toBe(false);
    });

    describe('autoFillScore', () => {
        beforeEach(() => {
            resultDetail.homeValue = '0';
            resultDetail.awayValue = '0';
            const outsideResult = new ExternalResultDetail(1001, '', '', '', '2', '1');
            externalResultDetail.homeValue = '2';
            externalResultDetail.awayValue = '1';
            resultDetail.externalScores = [externalResultDetail, outsideResult];
            resultDetail.isScoreMismatched = false;
        });

        it('should fill home and away when all condition passed', () => {
            service.autoFillScore(resultDetail);

            expect(resultDetail.homeValue).toEqual('2');
            expect(resultDetail.awayValue).toEqual('1');
        });

        it('should fill blank for home and away when scores are mismatch', () => {
            resultDetail.isScoreMismatched = true;
            service.autoFillScore(resultDetail);

            expect(resultDetail.homeValue).toEqual('');
            expect(resultDetail.awayValue).toEqual('');
        });
    });

    describe('isScoreConsecutive', () => {
        it('should return true when score is consecutive', () => {
            const map1 = new ResultDetail();
            map1.resourceId = '01';
            const map2 = new ResultDetail();
            map2.resourceId = '02';

            const result = service.isScoreConsecutive([map1, map2], "01");

            expect(result).toBe(true);
        });

        it('should return true when score is empty', () => {
            const result = service.isScoreConsecutive([], "01");

            expect(result).toBe(true);
        });

        it('should return false when only 1 score existed', () => {
            const result = service.isScoreConsecutive([resultDetail], "01");

            expect(result).toBe(false);
        });

        it('should return false when score is not consecutive', () => {
            const map1 = new ResultDetail();
            map1.resourceId = '01';
            const map3 = new ResultDetail();
            map3.resourceId = '03';

            const result = service.isScoreConsecutive([map1, map3], "01");

            expect(result).toBe(false);
        });
    });

    describe('isOutsideScoreConsecutive', () => {
        it('should return true when score is consecutive', () => {
            const map1 = new ExternalResultDetail(100, '01', '');
            const map2 = new ExternalResultDetail(100, '02', '');

            const result = service.isOutsideScoreConsecutive([map1, map2], '01');

            expect(result).toBe(true);
        });

        it('should return true when score is empty', () => {
            const result = service.isOutsideScoreConsecutive([], '01');

            expect(result).toBe(true);
        });

        it('should return false when only 1 score existed', () => {
            const map1 = new ExternalResultDetail(100, '01', '');

            const result = service.isOutsideScoreConsecutive([map1], '01');

            expect(result).toBe(false);
        });

        it('should return false when score is not consecutive', () => {
            const map1 = new ExternalResultDetail(100, '01', '');
            const map3 = new ExternalResultDetail(100, '03', '');

            const result = service.isOutsideScoreConsecutive([map1, map3], '01');

            expect(result).toBe(false);
        });
    });

    describe('isMismatchedWarning', () => {
        beforeEach(() => {
            resultDetail.homeValue = '2';
            resultDetail.awayValue = '1';
            externalResultDetail.homeValue = '2';
            externalResultDetail.awayValue = '1';
            resultDetail.externalScores = [externalResultDetail];
        });

        it('should return false when result detail is empty', () => {
            resultDetail.homeValue = '';
            resultDetail.awayValue = '';

            const result = service.isMismatchedWarning(resultDetail);

            expect(result).toBe(false);
        });

        it('should return false when external score is empty', () => {
            externalResultDetail.homeValue = '';
            externalResultDetail.awayValue = '';

            const result = service.isMismatchedWarning(resultDetail);

            expect(result).toBe(false);
        });

        it('should return true when exist a mismatch score', () => {
            resultDetail.homeValue = '0';

            const result = service.isMismatchedWarning(resultDetail);

            expect(result).toBe(true);
        });

        it('should return false when all scores are matched', () => {
            const result = service.isMismatchedWarning(resultDetail);

            expect(result).toBe(false);
        });

        it('should return false when no result detail but external scores are match', () => {
            resultDetail.homeValue = null;
            resultDetail.awayValue = null;

            const result = service.isMismatchedWarning(resultDetail);

            expect(result).toBe(false);
        });
    });

    it('verifyFinalResource - return message when score not equal', () => {
        final.homeValue = "1";
        final.awayValue = "1";
        final.checked = true;

        const result = service.verifyFinalResource([final], "00", "2-2", "total set");

        const expected = Language.TotalScoreNotMatchConfirmation
            .replace(/TOTAL_SCORE/g, "total set")
            .replace(/OLD_SCORE/g, "1-1")
            .replace(/NEW_SCORE/g, "2-2");

        expect(result).toBe(expected);
    });

    it('changeToNewFinalResource - should set new value', () => {
        final.homeValue = "1";
        final.awayValue = "1";

        service.changeToNewFinalResource(final, "2-2");

        expect(final.homeValue).toEqual("2");
        expect(final.awayValue).toEqual("2");
        expect(final.isScoreMismatched).toBeFalsy();
    });

    describe('getNewFinalResource', () => {
        it('return sum of value', () => {
            resultDetail.homeValue = "1";
            resultDetail.awayValue = "1";

            const actual = service.getNewFinalResource([resultDetail, resultDetail], "00", true);

            expect(actual).toEqual("2-2");
        });

        it('return count win set', () => {
            resultDetail.homeValue = "2";
            resultDetail.awayValue = "1";

            const actual = service.getNewFinalResource([resultDetail, resultDetail], "00", false);

            expect(actual).toEqual("2-0");
        });
    });

    describe('isEarlyMismatchedWarning', () => {
        beforeEach(() => {
            resultDetail.homeValue = 'H';
            externalResultDetail.homeValue = 'H';
            resultDetail.externalScores = [externalResultDetail];
        });

        it('should return false when result detail is empty', () => {
            resultDetail.homeValue = '';

            const result = service.isEarlyMismatchedWarning(resultDetail);

            expect(result).toBe(false);
        });

        it('should return false when external score is empty', () => {
            externalResultDetail.homeValue = '';

            const result = service.isEarlyMismatchedWarning(resultDetail);

            expect(result).toBe(false);
        });

        it('should return true when exist a mismatch score', () => {
            resultDetail.homeValue = '0';

            const result = service.isEarlyMismatchedWarning(resultDetail);

            expect(result).toBe(true);
        });

        it('should return false when all scores are matched', () => {
            const result = service.isEarlyMismatchedWarning(resultDetail);

            expect(result).toBe(false);
        });

        it('should return false when no result detail but external scores are match', () => {
            resultDetail.homeValue = null;

            const result = service.isEarlyMismatchedWarning(resultDetail);

            expect(result).toBe(false);
        });
    });

    describe('autoFillEarlyResult', () => {
        beforeEach(() => {
            resultDetail.homeValue = 'H';
            const outsideResult = new ExternalResultDetail(1001, '', '', '', 'H', '1');
            externalResultDetail.homeValue = 'H';
            resultDetail.externalScores = [externalResultDetail, outsideResult];
            resultDetail.isScoreMismatched = false;
        });

        it('should fill home value when all condition passed', () => {
            service.autoFillEarlyResult(resultDetail);

            expect(resultDetail.homeValue).toEqual('H');
        });

        it('should fill blank for home value when scores are mismatch', () => {
            resultDetail.isScoreMismatched = true;
            externalResultDetail.homeValue = 'A';
            service.autoFillEarlyResult(resultDetail);

            expect(resultDetail.homeValue).toEqual('');
        });
    });

    describe('allResultsHaveScoreSources', () => {
        it('should return true when all results have score sources', () => {
            resultDetail.checked = true;
            const outsideResult = new ExternalResultDetail(1001, '', '', '', 'H', '');
            resultDetail.externalScores = [externalResultDetail, outsideResult];

            const result = service.allResultsHaveScoreSources([resultDetail]);

            expect(result).toBe(true);
        });
        it('should return false when result missing score source', () => {
            resultDetail.checked = true;
            resultDetail.externalScores = [externalResultDetail];

            const result = service.allResultsHaveScoreSources([resultDetail]);

            expect(result).toBe(false);
        });
    });

    describe('isFullTimeMismatched', () => {
        beforeEach(() => {
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '1';
        });
        it('should return true when fulltime score is mismatch', () => {
            final.homeValue = '5';
            final.awayValue = '6';

            const result = service.isFullTimeMismatched([resultDetail, resultDetail, final], false, '00', true);

            expect(result).toBe(true);
        });

        it('should return false when fulltime is match', () => {
            final.homeValue = '2';
            final.awayValue = '2';

            const result = service.isFullTimeMismatched([resultDetail, resultDetail, final], false, '00', true);

            expect(result).toBe(false);
        });

        it('should return false when input fulltime score directly', () => {
            final.homeValue = '9';
            final.awayValue = '9';

            const result = service.isFullTimeMismatched([resultDetail, resultDetail, final], true, '00', true);

            expect(result).toBe(false);
        });
    });

    it('getOutsideScores - should get all valid outside sources and map score', () => {
        resultDetail.resourceId = 'M1';
        resultDetail.checked = true;
        resultDetail.externalScores = [new ExternalResultDetail(1001, 'M1', '', '', '1', '1'), new ExternalResultDetail(0, 'M1', '')];
        const resultDetails = [resultDetail];

        const result = service.getOutsideScores(resultDetails);

        expect(result.length).toEqual(2);
    });

    it('getChangedScores - should get only changed score', () => {
        resultDetail.resourceId = 'M1';
        resultDetail.checked = true;
        resultDetail.externalScores = [new ExternalResultDetail(1001, 'M1', '', '', '1', '1'), new ExternalResultDetail(0, 'M1', '')];
        const resultDetails = [resultDetail];

        const result = service.getChangedScores(resultDetails, originalResultDetails);

        expect(result.length).toEqual(1);
    });

    describe('generateExternalScores', () => {
        resultDetail.resourceId = 'M1';
        resultDetail.checked = true;
        resultDetail.externalScores = [new ExternalResultDetail(1001, 'M1', '', '', '1', '1'), new ExternalResultDetail(0, 'M1', '')];
        const resultDetails = [resultDetail];

        let match: GeneralMatch;
        const trader = new ExternalResultDetail(100, 'M1', '');
        const provider = new ExternalResultDetail(16, 'M1', '');
        const outside = new ExternalResultDetail(1001, 'M1', '');

        beforeEach(() => {
            match = new GeneralMatch(new MatchDetail());
            resultDetail.resourceId = 'M1';
        });

        it('should generate external score for result detail', () => {
            match.externalResults = [
                new ExternalResult(100, [trader]),
                new ExternalResult(16, [provider]),
                new ExternalResult(1001, [outside])
            ];

            service.generateExternalScores(match, resultDetails, SportType.eSports);

            expect(resultDetail.externalScores.length).toEqual(4);
        });

        it('should generate trader and external score for tennis result detail', () => {
            match.externalResults = [
                new ExternalResult(16, [provider]),
                new ExternalResult(1001, [outside])
            ];

            service.generateExternalScores(match, resultDetails, SportType.tennis);

            expect(resultDetail.externalScores.length).toEqual(4);
        });

        it('should generate trader and external score for e-sports result detail', () => {
            match.externalResults = [
                new ExternalResult(16, [provider]),
                new ExternalResult(1001, [outside])
            ];

            service.generateExternalScores(match, resultDetails, SportType.eSports);

            expect(resultDetail.externalScores.length).toEqual(4);
        });
    });
});