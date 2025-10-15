import { inject, TestBed } from "@angular/core/testing";
import { ResourceNameByIdPipe } from "../../tennis/pipes";
import { ExternalResultDetail, MatchDetail, ResultDetail, ExternalResult, GeneralMatch } from "../../shared/models/sportsbook-sop";
import { VerificationBaseService } from "./verification-base.service";
import { Language } from "../../shared/language.native";
import { TicketStatusText, SportType, ResultStatusId, ScoreSourceType, SettlementStatusId } from "../../shared/constants";
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
            resultDetail.isSpecialBettype = 1;
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

    // Edge Cases and Error Handling Tests
    describe('Edge Cases and Error Handling', () => {
        describe('invalidInputScore - Edge Cases', () => {
            it('should handle null resultDetails', () => {
                // Act & Assert
                expect(() => service.invalidInputScore(null as any, false, '')).not.toThrow();
                expect(service.invalidInputScore(null as any, false, '')).toBeFalsy();
            });

            it('should handle undefined resultDetails', () => {
                // Act & Assert
                expect(() => service.invalidInputScore(undefined as any, false, '')).not.toThrow();
                expect(service.invalidInputScore(undefined as any, false, '')).toBeFalsy();
            });

            it('should handle empty resultDetails array', () => {
                // Act
                const result = service.invalidInputScore([], false, '');

                // Assert
                expect(result).toBeFalsy();
            });

            it('should handle resultDetails with null values', () => {
                // Arrange
                const resultWithNull = new ResultDetail();
                resultWithNull.resourceId = '01';
                resultWithNull.homeValue = null as any;
                resultWithNull.awayValue = null as any;

                // Act
                const result = service.invalidInputScore([resultWithNull], false, '');

                // Assert
                expect(result).toBeTruthy();
            });

            it('should handle resultDetails with undefined values', () => {
                // Arrange
                const resultWithUndefined = new ResultDetail();
                resultWithUndefined.resourceId = '01';
                resultWithUndefined.homeValue = undefined as any;
                resultWithUndefined.awayValue = undefined as any;

                // Act
                const result = service.invalidInputScore([resultWithUndefined], false, '');

                // Assert
                expect(result).toBeTruthy();
            });
        });

        describe('isExistedHomeAwayScore - Edge Cases', () => {
            it('should return false when both values are null', () => {
                // Act
                const result = service.isExistedHomeAwayScore(null as any, null as any);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when both values are undefined', () => {
                // Act
                const result = service.isExistedHomeAwayScore(undefined as any, undefined as any);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when one value is null', () => {
                // Act
                const result = service.isExistedHomeAwayScore('1', null as any);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when one value is undefined', () => {
                // Act
                const result = service.isExistedHomeAwayScore('1', undefined as any);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when both values are empty strings', () => {
                // Act
                const result = service.isExistedHomeAwayScore('', '');

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return true when both values are valid', () => {
                // Act
                const result = service.isExistedHomeAwayScore('1', '2');

                // Assert
                expect(result).toBeTruthy();
            });
        });

        describe('isExistedHomeScore - Edge Cases', () => {
            it('should return false when value is null', () => {
                // Act
                const result = service.isExistedHomeScore(null as any);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when value is undefined', () => {
                // Act
                const result = service.isExistedHomeScore(undefined as any);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when value is empty string', () => {
                // Act
                const result = service.isExistedHomeScore('');

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return true when value is valid', () => {
                // Act
                const result = service.isExistedHomeScore('1');

                // Assert
                expect(result).toBeTruthy();
            });
        });

        describe('hasScore - Edge Cases', () => {
            it('should return false when resultDetail is null', () => {
                // Act
                const result = service.hasScore(null as any);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when resultDetail is undefined', () => {
                // Act
                const result = service.hasScore(undefined as any);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when homeValue is null', () => {
                // Arrange
                const resultDetail = new ResultDetail();
                resultDetail.homeValue = null as any;
                resultDetail.awayValue = '1';

                // Act
                const result = service.hasScore(resultDetail);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when awayValue is null', () => {
                // Arrange
                const resultDetail = new ResultDetail();
                resultDetail.homeValue = '1';
                resultDetail.awayValue = null as any;

                // Act
                const result = service.hasScore(resultDetail);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when homeValue is empty', () => {
                // Arrange
                const resultDetail = new ResultDetail();
                resultDetail.homeValue = '';
                resultDetail.awayValue = '1';

                // Act
                const result = service.hasScore(resultDetail);

                // Assert
                expect(result).toBeFalsy();
            });

            it('should return false when awayValue is empty', () => {
                // Arrange
                const resultDetail = new ResultDetail();
                resultDetail.homeValue = '1';
                resultDetail.awayValue = '';

                // Act
                const result = service.hasScore(resultDetail);

                // Assert
                expect(result).toBeFalsy();
            });
        });
    });

    // Score Validation Tests
    describe('Score Validation Methods', () => {
        describe('isValidTraderConfirmScore', () => {

            it('should return true when trader external score exists and is valid', () => {
                // Arrange
                const result = new ResultDetail();
                result.resultStatusId = ResultStatusId.AutoCompleted;
                result.homeValue = '';
                result.awayValue = '';
                result.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.trader, 'M1', '', '', '1', '2')
                ];

                // Act
                const isValid = service.isValidTraderConfirmScore(result);

                // Assert
                expect(isValid).toBeTruthy();
            });
        });

        describe('isEmptyHomeOrAwayValue', () => {
            it('should return true when homeValue is null', () => {
                // Arrange
                const item = new ResultDetail();
                item.homeValue = null as any;
                item.awayValue = '1';

                // Act
                const isEmpty = service.isEmptyHomeOrAwayValue(item);

                // Assert
                expect(isEmpty).toBeTruthy();
            });

            it('should return true when awayValue is null', () => {
                // Arrange
                const item = new ResultDetail();
                item.homeValue = '1';
                item.awayValue = null as any;

                // Act
                const isEmpty = service.isEmptyHomeOrAwayValue(item);

                // Assert
                expect(isEmpty).toBeTruthy();
            });

            it('should return true when homeValue is empty', () => {
                // Arrange
                const item = new ResultDetail();
                item.homeValue = '';
                item.awayValue = '1';

                // Act
                const isEmpty = service.isEmptyHomeOrAwayValue(item);

                // Assert
                expect(isEmpty).toBeTruthy();
            });

            it('should return true when awayValue is empty', () => {
                // Arrange
                const item = new ResultDetail();
                item.homeValue = '1';
                item.awayValue = '';

                // Act
                const isEmpty = service.isEmptyHomeOrAwayValue(item);

                // Assert
                expect(isEmpty).toBeTruthy();
            });

            it('should return false when both values are valid', () => {
                // Arrange
                const item = new ResultDetail();
                item.homeValue = '1';
                item.awayValue = '2';

                // Act
                const isEmpty = service.isEmptyHomeOrAwayValue(item);

                // Assert
                expect(isEmpty).toBeFalsy();
            });
        });
    });

    // Mismatch Detection Tests
    describe('Mismatch Detection Methods', () => {
        describe('isMismatchedScoreScreenshot', () => {
            it('should return true when scores are different', () => {
                // Arrange
                const map = new ResultDetail();
                map.homeValue = '1';
                map.awayValue = '2';
                map.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.screenshot, 'M1', '', '', '2', '1')
                ];

                // Act
                const isMismatched = service.isMismatchedScoreScreenshot(map);

                // Assert
                expect(isMismatched).toBeTruthy();
            });

            it('should return false when scores match', () => {
                // Arrange
                const map = new ResultDetail();
                map.homeValue = '1';
                map.awayValue = '2';
                map.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.screenshot, 'M1', '', '', '1', '2')
                ];

                // Act
                const isMismatched = service.isMismatchedScoreScreenshot(map);

                // Assert
                expect(isMismatched).toBeFalsy();
            });

            it('should return false when no screenshot score exists', () => {
                // Arrange
                const map = new ResultDetail();
                map.homeValue = '1';
                map.awayValue = '2';
                map.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.trader, 'M1', '', '', '1', '2')
                ];

                // Act
                const isMismatched = service.isMismatchedScoreScreenshot(map);

                // Assert
                expect(isMismatched).toBeFalsy();
            });

            it('should handle partial mismatch correctly', () => {
                // Arrange
                const map = new ResultDetail();
                map.homeValue = '1';
                map.awayValue = '';
                map.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.screenshot, 'M1', '', '', '2', '')
                ];

                // Act
                const isMismatched = service.isMismatchedScoreScreenshot(map);

                // Assert
                expect(isMismatched).toBeTruthy();
            });
        });

        describe('isExistMismatchedScoreScreenshot', () => {
            it('should return true when any checked result has mismatched screenshot', () => {
                // Arrange
                const result1 = new ResultDetail();
                result1.checked = true;
                result1.homeValue = '1';
                result1.awayValue = '2';
                result1.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.screenshot, 'M1', '', '', '2', '1')
                ];

                const result2 = new ResultDetail();
                result2.checked = true;
                result2.homeValue = '1';
                result2.awayValue = '2';
                result2.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.screenshot, 'M1', '', '', '1', '2')
                ];

                // Act
                const hasMismatch = service.isExistMismatchedScoreScreenshot([result1, result2]);

                // Assert
                expect(hasMismatch).toBeTruthy();
            });

            it('should return false when no checked results have mismatched screenshots', () => {
                // Arrange
                const result1 = new ResultDetail();
                result1.checked = true;
                result1.homeValue = '1';
                result1.awayValue = '2';
                result1.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.screenshot, 'M1', '', '', '1', '2')
                ];

                // Act
                const hasMismatch = service.isExistMismatchedScoreScreenshot([result1]);

                // Assert
                expect(hasMismatch).toBeFalsy();
            });

            it('should ignore unchecked results', () => {
                // Arrange
                const result1 = new ResultDetail();
                result1.checked = false;
                result1.homeValue = '1';
                result1.awayValue = '2';
                result1.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.screenshot, 'M1', '', '', '2', '1')
                ];

                // Act
                const hasMismatch = service.isExistMismatchedScoreScreenshot([result1]);

                // Assert
                expect(hasMismatch).toBeFalsy();
            });
        });
    });

    // Score Comparison Tests
    describe('Score Comparison Methods', () => {
        describe('compareInputScoreWithProviderScores', () => {
            it('should mark score as mismatched when provider score differs', () => {
                // Arrange
                const result = new ResultDetail();
                result.resourceId = 'M1';
                result.homeValue = '1';
                result.awayValue = '2';
                result.isScoreMismatched = false;

                const externalResults = [
                    new ExternalResultDetail(16, 'M1', '', '', '2', '1')
                ];

                // Act
                service.compareInputScoreWithProviderScores([result], externalResults);

                // Assert
                expect(result.isScoreMismatched).toBeTruthy();
            });

            it('should not mark score as mismatched when provider score matches', () => {
                // Arrange
                const result = new ResultDetail();
                result.resourceId = 'M1';
                result.homeValue = '1';
                result.awayValue = '2';
                result.isScoreMismatched = false;

                const externalResults = [
                    new ExternalResultDetail(16, 'M1', '', '', '1', '2')
                ];

                // Act
                service.compareInputScoreWithProviderScores([result], externalResults);

                // Assert
                expect(result.isScoreMismatched).toBeFalsy();
            });

            it('should not mark score as mismatched when result has empty values', () => {
                // Arrange
                const result = new ResultDetail();
                result.resourceId = 'M1';
                result.homeValue = '';
                result.awayValue = '';
                result.isScoreMismatched = false;

                const externalResults = [
                    new ExternalResultDetail(16, 'M1', '', '', '1', '2')
                ];

                // Act
                service.compareInputScoreWithProviderScores([result], externalResults);

                // Assert
                expect(result.isScoreMismatched).toBeFalsy();
            });

            it('should handle acceptCaseZero correctly', () => {
                // Arrange
                const result = new ResultDetail();
                result.resourceId = 'M1';
                result.homeValue = '0';
                result.awayValue = '0';
                result.isScoreMismatched = false;

                const externalResults = [
                    new ExternalResultDetail(16, 'M1', '', '', '', '')
                ];

                // Act
                service.compareInputScoreWithProviderScores([result], externalResults);

                // Assert
                expect(result.isScoreMismatched).toBeFalsy();
            });
        });

        describe('compareInputScoreTraderScores', () => {
            it('should mark score as mismatched when trader score differs', () => {
                // Arrange
                const result = new ResultDetail();
                result.resourceId = 'M1';
                result.homeValue = '1';
                result.awayValue = '2';
                result.isScoreMismatched = false;

                const originalResults = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M1';
                        result.homeValue = '2';
                        result.awayValue = '1';
                        return result;
                    })()
                ];

                // Act
                service.compareInputScoreTraderScores(originalResults, [result]);

                // Assert
                expect(result.isScoreMismatched).toBeTruthy();
            });

            it('should not mark score as mismatched when trader score matches', () => {
                // Arrange
                const result = new ResultDetail();
                result.resourceId = 'M1';
                result.homeValue = '1';
                result.awayValue = '2';
                result.isScoreMismatched = false;

                const originalResults = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M1';
                        result.homeValue = '1';
                        result.awayValue = '2';
                        return result;
                    })()
                ];

                // Act
                service.compareInputScoreTraderScores(originalResults, [result]);

                // Assert
                expect(result.isScoreMismatched).toBeFalsy();
            });
        });
    });

    // Consistency Tests
    describe('Consistency Checking Methods', () => {
        describe('isConsistentTraderAndProvider', () => {
            it('should return true when trader and provider scores are inconsistent', () => {
                // Arrange
                const checkedResults = ['M1'];
                const confirmedResultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M1';
                        result.homeValue = '1';
                        result.awayValue = '2';
                        return result;
                    })()
                ];
                const externalResults = [
                    new ExternalResultDetail(16, 'M1', '', '', '2', '1')
                ];

                // Act
                const isInconsistent = service.isConsistentTraderAndProvider(checkedResults, confirmedResultDetails, externalResults);

                // Assert
                expect(isInconsistent).toBeTruthy();
            });

            it('should return false when trader and provider scores are consistent', () => {
                // Arrange
                const checkedResults = ['M1'];
                const confirmedResultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M1';
                        result.homeValue = '1';
                        result.awayValue = '2';
                        return result;
                    })()
                ];
                const externalResults = [
                    new ExternalResultDetail(16, 'M1', '', '', '1', '2')
                ];

                // Act
                const isInconsistent = service.isConsistentTraderAndProvider(checkedResults, confirmedResultDetails, externalResults);

                // Assert
                expect(isInconsistent).toBeFalsy();
            });

            it('should return false when no matching resourceId found', () => {
                // Arrange
                const checkedResults = ['M1'];
                const confirmedResultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M2';
                        result.homeValue = '1';
                        result.awayValue = '2';
                        return result;
                    })()
                ];
                const externalResults = [
                    new ExternalResultDetail(16, 'M1', '', '', '1', '2')
                ];

                // Act
                const isInconsistent = service.isConsistentTraderAndProvider(checkedResults, confirmedResultDetails, externalResults);

                // Assert
                expect(isInconsistent).toBeFalsy();
            });
        });

        describe('isConsistentScoreTraderConfirm', () => {
            it('should return true when trader confirm scores are inconsistent', () => {
                // Arrange
                const originalResultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M1';
                        result.homeValue = '1';
                        result.awayValue = '2';
                        return result;
                    })()
                ];
                const resultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M1';
                        result.homeValue = '2';
                        result.awayValue = '1';
                        return result;
                    })()
                ];

                // Act
                const isInconsistent = service.isConsistentScoreTraderConfirm(originalResultDetails, resultDetails);

                // Assert
                expect(isInconsistent).toBeTruthy();
            });

            it('should return false when trader confirm scores are consistent', () => {
                // Arrange
                const originalResultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M1';
                        result.homeValue = '1';
                        result.awayValue = '2';
                        return result;
                    })()
                ];
                const resultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M1';
                        result.homeValue = '1';
                        result.awayValue = '2';
                        return result;
                    })()
                ];

                // Act
                const isInconsistent = service.isConsistentScoreTraderConfirm(originalResultDetails, resultDetails);

                // Assert
                expect(isInconsistent).toBeFalsy();
            });
        });

        describe('isConsistentScoreProvider', () => {
            it('should return true when provider scores are inconsistent', () => {
                // Arrange
                const resultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M1';
                        result.homeValue = '1';
                        result.awayValue = '2';
                        return result;
                    })()
                ];
                const externalResults = [
                    new ExternalResultDetail(16, 'M1', '', '', '2', '1')
                ];

                // Act
                const isInconsistent = service.isConsistentScoreProvider(resultDetails, externalResults);

                // Assert
                expect(isInconsistent).toBeTruthy();
            });

            it('should return false when provider scores are consistent', () => {
                // Arrange
                const resultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = 'M1';
                        result.homeValue = '1';
                        result.awayValue = '2';
                        return result;
                    })()
                ];
                const externalResults = [
                    new ExternalResultDetail(16, 'M1', '', '', '1', '2')
                ];

                // Act
                const isInconsistent = service.isConsistentScoreProvider(resultDetails, externalResults);

                // Assert
                expect(isInconsistent).toBeFalsy();
            });
        });
    });

    // Score Calculation Tests
    describe('Score Calculation Methods', () => {
        describe('sumTotalResultWin', () => {
            it('should clear scores when not consecutive', () => {
                // Arrange
                const resultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = '01';
                        result.homeValue = '2';
                        result.awayValue = '1';
                        return result;
                    })()
                ];
                const totalGames = new ResultDetail();
                totalGames.resourceId = '00';

                // Act
                service.sumTotalResultWin(resultDetails, '01', totalGames);

                // Assert
                expect(totalGames.homeValue).toBe('');
                expect(totalGames.awayValue).toBe('');
            });

            it('should clear scores when empty array', () => {
                // Arrange
                const resultDetails: ResultDetail[] = [];
                const totalGames = new ResultDetail();
                totalGames.resourceId = '00';

                // Act
                service.sumTotalResultWin(resultDetails, '01', totalGames);

                // Assert
                expect(totalGames.homeValue).toBe('');
                expect(totalGames.awayValue).toBe('');
            });
        });

        describe('sumTotalScores', () => {

            it('should calculate total scores without checking consecutive', () => {
                // Arrange
                const resultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = '01';
                        result.homeValue = '2';
                        result.awayValue = '1';
                        return result;
                    })()
                ];
                const totalPoints = new ResultDetail();
                totalPoints.resourceId = '00';

                // Act
                service.sumTotalScores(resultDetails, '01', totalPoints, false);

                // Assert
                expect(totalPoints.homeValue).toBe('2');
                expect(totalPoints.awayValue).toBe('1');
            });

            it('should clear scores when not consecutive and checkConsecutive is true', () => {
                // Arrange
                const resultDetails = [
                    (() => {
                        const result = new ResultDetail();
                        result.resourceId = '01';
                        result.homeValue = '2';
                        result.awayValue = '1';
                        return result;
                    })()
                ];
                const totalPoints = new ResultDetail();
                totalPoints.resourceId = '00';

                // Act
                service.sumTotalScores(resultDetails, '01', totalPoints, true);

                // Assert
                expect(totalPoints.homeValue).toBe('');
                expect(totalPoints.awayValue).toBe('');
            });
        });
    });

    // External Score Tests
    describe('External Score Methods', () => {
        describe('getTraderScores', () => {
            it('should return trader scores for checked results', () => {
                // Arrange
                const result1 = new ResultDetail();
                result1.checked = true;
                result1.resourceId = 'M1';
                result1.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.trader, 'M1', '', '', '1', '2')
                ];

                const result2 = new ResultDetail();
                result2.checked = false;
                result2.resourceId = 'M2';
                result2.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.trader, 'M2', '', '', '3', '4')
                ];

                // Act
                const traderScores = service.getTraderScores([result1, result2]);

                // Assert
                expect(traderScores.length).toBe(1);
                expect(traderScores[0].resourceId).toBe('M1');
            });

            it('should return empty array when no checked results', () => {
                // Arrange
                const result1 = new ResultDetail();
                result1.checked = false;
                result1.resourceId = 'M1';

                // Act
                const traderScores = service.getTraderScores([result1]);

                // Assert
                expect(traderScores.length).toBe(0);
            });
        });

        describe('getChangedTraderScores', () => {
            it('should return changed trader scores', () => {
                // Arrange
                const result1 = new ResultDetail();
                result1.checked = true;
                result1.resourceId = 'M1';
                result1.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.trader, 'M1', '', '', '1', '2')
                ];

                const originalResult1 = new ResultDetail();
                originalResult1.resourceId = 'M1';
                originalResult1.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.trader, 'M1', '', '', '3', '4')
                ];

                // Act
                const changedScores = service.getChangedTraderScores([result1], [originalResult1]);

                // Assert
                expect(changedScores.length).toBe(1);
                expect(changedScores[0].resourceId).toBe('M1');
            });

            it('should return empty array when no changes', () => {
                // Arrange
                const result1 = new ResultDetail();
                result1.checked = true;
                result1.resourceId = 'M1';
                result1.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.trader, 'M1', '', '', '1', '2')
                ];

                const originalResult1 = new ResultDetail();
                originalResult1.resourceId = 'M1';
                originalResult1.externalScores = [
                    new ExternalResultDetail(ScoreSourceType.trader, 'M1', '', '', '1', '2')
                ];

                // Act
                const changedScores = service.getChangedTraderScores([result1], [originalResult1]);

                // Assert
                expect(changedScores.length).toBe(0);
            });
        });
    });

    // Additional Edge Cases
    describe('Additional Edge Cases', () => {

        describe('enableUncalculateButton', () => {
            it('should return true when any result is not running', () => {
                // Arrange
                const result1 = new ResultDetail();
                result1.settlementStatusId = SettlementStatusId.Calculated;

                const result2 = new ResultDetail();
                result2.settlementStatusId = 0; // Running status

                // Act
                const canUncalculate = service.enableUncalculateButton([result1, result2]);

                // Assert
                expect(canUncalculate).toBeTruthy();
            });

            it('should return false when all results are running', () => {
                // Arrange
                const result1 = new ResultDetail();
                result1.settlementStatusId = 0; // Running status

                const result2 = new ResultDetail();
                result2.settlementStatusId = 0; // Running status

                // Act
                const canUncalculate = service.enableUncalculateButton([result1, result2]);

                // Assert
                expect(canUncalculate).toBeFalsy();
            });
        });

        describe('acceptCaseZero', () => {
            it('should return true when result is 0-0 and original is empty', () => {
                // Arrange
                const originalResult = new ResultDetail();
                originalResult.homeValue = '';
                originalResult.awayValue = '';

                const result = new ResultDetail();
                result.homeValue = '0';
                result.awayValue = '0';

                // Act
                const acceptZero = service.acceptCaseZero(originalResult, result);

                // Assert
                expect(acceptZero).toBeTruthy();
            });

            it('should return false when result is not 0-0', () => {
                // Arrange
                const originalResult = new ResultDetail();
                originalResult.homeValue = '';
                originalResult.awayValue = '';

                const result = new ResultDetail();
                result.homeValue = '1';
                result.awayValue = '0';

                // Act
                const acceptZero = service.acceptCaseZero(originalResult, result);

                // Assert
                expect(acceptZero).toBeFalsy();
            });

            it('should return false when original is not empty', () => {
                // Arrange
                const originalResult = new ResultDetail();
                originalResult.homeValue = '1';
                originalResult.awayValue = '2';

                const result = new ResultDetail();
                result.homeValue = '0';
                result.awayValue = '0';

                // Act
                const acceptZero = service.acceptCaseZero(originalResult, result);

                // Assert
                expect(acceptZero).toBeFalsy();
            });
        });
    });
});