import { VerificationService } from "./verification.service";
import { TestBed } from "@angular/core/testing";
import { MessageBoxService } from "../../shared/services";
import { ModalDialogComponent, ModalContentDialogComponent } from "../../shared/components";
import { NgbModal, NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { BrowserDynamicTestingModule } from "@angular/platform-browser-dynamic/testing";
import { ExternalResultDetail, ResultDetail } from "../../shared/models/sportsbook-sop";
import { ItemsSelect, MultipleSelect } from "../../shared/models";
import { ResultStatusId } from "../../shared/constants";
import { ResultControlGroup } from "../constants";

describe('E-Sports - VerificationService', () => {
    let service: VerificationService;
    let messageBoxService: MessageBoxService;
    const resultDetail = new ResultDetail();
    let resultDetails = [];
    let final: ResultDetail;
    final = new ResultDetail();
    final.resourceId = '00';

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [
                ModalDialogComponent,
                ModalContentDialogComponent,
            ],
            providers: [
                VerificationService,
                MessageBoxService,
                NgbModal,
            ],
            imports: [
                NgbModule
            ]
        });
        service = TestBed.inject(VerificationService);
        messageBoxService = TestBed.inject(MessageBoxService);
    });

    describe('invalidInputScore', () => {
        beforeEach(() => {
            resultDetails = [resultDetail];
        })
        it('Should return true when have not input score and user is leader', () => {
            resultDetail.checked = true;

            const result = service.invalidInputScore(resultDetails);

            expect(result).toBe(true);
        });

        it('should return false when inning is checked and having score', () => {
            resultDetail.checked = true;
            resultDetail.homeValue = '2';

            const result = service.invalidInputScore(resultDetails);

            expect(result).toBe(false);
        });
    });

    describe('autoFillScore', () => {
        const externalResultDetail = new ExternalResultDetail(1, '1', '', '', '2', '1');

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
            service.autoFillScore(resultDetail, true);

            expect(resultDetail.homeValue).toEqual('2');
            expect(resultDetail.awayValue).toEqual('1');
        });

        it('should fill blank for home and away when not exist score source', () => {
            resultDetail.externalScores = [];
            service.autoFillScore(resultDetail, true);

            expect(resultDetail.homeValue).toEqual('');
            expect(resultDetail.awayValue).toEqual('');
        });

        it('should not change  home and away when match not manual conpleted', () => {
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '2';
            resultDetail.resultStatusId = ResultStatusId.ManualCompleted;
            service.autoFillScore(resultDetail, true);

            expect(resultDetail.homeValue).toEqual('1');
            expect(resultDetail.awayValue).toEqual('2');
        });
    });

    describe('autoFillItemSelect', () => {
        it('should fill item select by external score', () => {
            resultDetail.inputType = 6;
            const externalResult = new ExternalResultDetail(100, '12345', '');
            externalResult.multipleResultSelect = new MultipleSelect();
            externalResult.multipleResultSelect.disableCheckAll = true;

            service.autoFillItemSelect(resultDetail, externalResult);

            expect(resultDetail.multipleResultSelect.disableCheckAll).toBe(true);
        });

        it('should uncheck all items', () => {
            resultDetail.multipleResultSelect = new MultipleSelect();
            resultDetail.multipleResultSelect.items = [new ItemsSelect(1, '', '', true, true, true, [])];

            service.autoFillItemSelect(resultDetail);

            expect(resultDetail.multipleResultSelect.items[0].checked).toBe(false);
        })
    });

    describe('isSingleScoreMatched', () => {
        it('should return true when home value not exist and all external result is equal', () => {
            resultDetail.homeValue = '';
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '2')];
            const scoreToCompare = new ExternalResultDetail(2, '2', '', '', '2');

            const result = service.isSingleScoreMatched(resultDetail, scoreToCompare, false);

            expect(result).toBeTruthy();
        });

        it('should return false when home value not exist and external result not equal', () => {
            resultDetail.homeValue = '';
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '2')];
            const scoreToCompare = new ExternalResultDetail(2, '2', '', '', '1');

            const result = service.isSingleScoreMatched(resultDetail, scoreToCompare, false);

            expect(result).toBeFalsy();
        });

        it('should return false when home value  exist and home value not equal', () => {
            resultDetail.homeValue = 'A';
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', 'H')];
            const scoreToCompare = new ExternalResultDetail(2, '2', '', '', 'H');

            const result = service.isSingleScoreMatched(resultDetail, scoreToCompare, true);

            expect(result).toBeFalsy();
        });

        it('should return true when external value is empty', () => {
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '')];
            const scoreToCompare = new ExternalResultDetail(2, '2', '', '', '2');

            const result = service.isSingleScoreMatched(resultDetail, scoreToCompare, false);

            expect(result).toBeTruthy();
        });
    });

    describe('isScoreMatched', () => {
        it('should return true when home away value not exist and all external result is equal', () => {
            resultDetail.homeValue = '';
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '2', '2')];
            const scoreToCompare = new ExternalResultDetail(2, '2', '', '', '2', '2');

            const result = service.isScoreMatched(resultDetail, scoreToCompare);

            expect(result).toBeTruthy();
        });

        it('should return false when home value not exist and external result not equal', () => {
            resultDetail.homeValue = '';
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '2', '1')];
            const scoreToCompare = new ExternalResultDetail(2, '2', '', '', '1', '1');

            const result = service.isScoreMatched(resultDetail, scoreToCompare);

            expect(result).toBeFalsy();
        });

        it('should return false when home value  exist and home value not equal', () => {
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '1';
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '2', '1')];
            const scoreToCompare = new ExternalResultDetail(2, '2', '', '', '2', '1');

            const result = service.isScoreMatched(resultDetail, scoreToCompare);

            expect(result).toBeFalsy();
        });

        it('should return true when external value is empty', () => {
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '')];
            const scoreToCompare = new ExternalResultDetail(2, '2', '', '', '', '2');

            const result = service.isScoreMatched(resultDetail, scoreToCompare);

            expect(result).toBeTruthy();
        });
    });

    describe('isMismatchedWarning', () => {
        it('return false when not exist external score', () => {
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '')];

            const result = service.isMismatchedWarning(resultDetail, false);

            expect(result).toBeFalsy();
        });

        it('return true when score mismatched', () => {
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '2';
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '2', '2')];

            const result = service.isMismatchedWarning(resultDetail, false);

            expect(result).toBeTruthy();
        });
    });

    describe('allMapHaveScoreSources', () => {
        it('should return true when all outside sources have score', () => {
            resultDetail.checked = true;
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '2'),
            new ExternalResultDetail(1001, '1', '', '', '2')];

            const result = service.allMapHaveScoreSources([resultDetail]);

            expect(result).toBeTruthy();
        });

        it('should return true when exist outside sources not have score', () => {
            resultDetail.checked = true;
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '2'),
            new ExternalResultDetail(1001, '1', '', '', '')];

            const result = service.allMapHaveScoreSources([resultDetail]);

            expect(result).toBeFalsy();
        });
    });

    describe('isExistInhouseResult', () => {
        it('should return true when exist external result in house', () => {
            resultDetail.checked = true;
            resultDetail.inputType = ResultControlGroup.SingleScore;
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '2'),
            new ExternalResultDetail(1001, '1', '', '', '2')];

            const result = service.isExistInhouseResult(resultDetail);

            expect(result).toBeTruthy();
        });

        it('should return true when not exist external result in house with value', () => {
            resultDetail.checked = true;
            resultDetail.inputType = ResultControlGroup.CoupleScores;
            resultDetail.externalScores = [new ExternalResultDetail(1001, '1', '', '', '2', '2'),
            new ExternalResultDetail(1, '1', '', '', '2', '')];

            const result = service.isExistInhouseResult(resultDetail);

            expect(result).toBeFalsy();
        });
    });

    describe('allResultsHaveScoreSources', () => {
        it('should return true when all outside sources have score', () => {
            resultDetail.checked = true;
            resultDetail.groupBetType = ResultControlGroup.SingleScore;
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '2'),
            new ExternalResultDetail(1001, '1', '', '', '2', '')];

            const result = service.allResultsHaveScoreSources([resultDetail]);

            expect(result).toBeTruthy();
        });

        it('should return true when exist outside sources not have score', () => {
            resultDetail.checked = true;
            resultDetail.groupBetType = ResultControlGroup.CoupleScores;
            resultDetail.externalScores = [new ExternalResultDetail(1, '1', '', '', '2'),
            new ExternalResultDetail(1001, '1', '', '', '2', '2')];

            const result = service.allResultsHaveScoreSources([resultDetail]);

            expect(result).toBeFalsy();
        });
    });
});