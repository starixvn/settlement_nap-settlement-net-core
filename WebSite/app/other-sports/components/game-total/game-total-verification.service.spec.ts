import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpClientModule, HttpHandler } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService, ClosePopupService, AioService } from '../../../shared/services';
import { GameTotalVerificationService } from './game-total-verification.service';
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
import { GameTotalService } from './game-total.service';
import { ResourceNameByIdPipe } from '../../pipes/resource-name-by-id.pipe';
import { ExternalResultDetail, MatchDetail, ResultDetail } from '../../../shared/models/sportsbook-sop';
import * as _ from 'lodash';
import { ResourcesIds } from '../../constants';
import { MatchAio } from '../../models';
import { ResultStatusId, SettlementStatusId } from '../../../shared/constants';
import { ChildMatch } from '../../models/child-match.model';

describe('GameTotalVerificationService', () => {
    let service: GameTotalVerificationService = null;
    let httpRequestService: HttpRequestService;
    let messageBoxService: MessageBoxService;
    let intervalBackgroundPipe: IntervalBackgroundPipe;

    const resultDetail = new ResultDetail();
    resultDetail.resourceId = "0101";
    resultDetail.homeValue = '1';
    resultDetail.awayValue = '1';
    const totalSet = new ResultDetail();
    totalSet.resourceId = "00";
    const matchDetail = new MatchDetail();
    const match = new MatchAio(matchDetail);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GameTotalVerificationService,
                GameTotalService,
                ClosePopupService,
                AioService,
                BlockUIService,
                MessageBoxService,
                IntervalBackgroundPipe,
                ResourceNameByIdPipe,
                HttpRequestService,
                HttpClient,
                HttpHandler,
            ],
            imports: [
                HttpClientModule,
            ],
        });

        service = TestBed.inject(GameTotalVerificationService);
        httpRequestService = TestBed.inject(HttpRequestService);
        messageBoxService = TestBed.inject(MessageBoxService);
        intervalBackgroundPipe = TestBed.inject(IntervalBackgroundPipe);
    });

    beforeEach(inject([GameTotalVerificationService], (verificationService: GameTotalVerificationService) => {
        service = verificationService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('isEmptyScore', () => {
        it('should return true when result empty', () => {
            resultDetail.homeValue = '';
            resultDetail.awayValue = '1';

            const result = service.isEmptyScore([resultDetail]);

            expect(result).toBeTruthy();
        });

        it('should return false when all result have score', () => {
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '1';

            const result = service.isEmptyScore([resultDetail]);

            expect(result).toBeFalsy();
        });
    });

    describe('getResultDetailToAction', () => {
        it('show return only total set when input directly is true', () => {
            const totalSet = _.cloneDeep(resultDetail);
            totalSet.resourceId = ResourcesIds.totalSets;

            const result = service.getResultDetailToAction([resultDetail, totalSet], true);

            expect(result).toEqual([totalSet]);
        });

        it('show return all result when input directly is false', () => {
            const totalSet = _.cloneDeep(resultDetail);
            totalSet.resourceId = ResourcesIds.totalSets;

            const result = service.getResultDetailToAction([resultDetail, totalSet], false);

            expect(result).toEqual([resultDetail, totalSet]);
        });
    });

    describe('getClassWithScore', () => {
        it('should return class name by settlement status pipe when result is set', () => {
            match.isScoreDirect = false;
            resultDetail.settlementStatusId = SettlementStatusId.Calculated
            resultDetail.resourceId = '0101';
            spyOn(intervalBackgroundPipe, 'transform').and.returnValue('calculated')

            service.getClassWithScore([resultDetail], match);

            expect(resultDetail.className).toEqual('calculated');
        });

        it('should return not-consistent when result is total set and it inconsistent', () => {
            match.isScoreDirect = false;
            resultDetail.homeValue = '2';
            resultDetail.awayValue = '2';
            const totalSet = _.cloneDeep(resultDetail);
            totalSet.resourceId = ResourcesIds.totalSets;
            totalSet.homeValue = '1';
            totalSet.awayValue = '2';
            match.resultDetails = [resultDetail, totalSet]

            service.getClassWithScore([resultDetail, totalSet], match);

            expect(totalSet.className).toEqual('not-consistent');
        });
    });

    describe('isNotConsistentTotalSet' , () => {
        it('should return false when not exist totalSet' , () => {
            resultDetail.resourceId = '0101';

            const result = service.isNotConsistentTotalSet([resultDetail]);

            expect(result).toBeFalsy();
        });

        it('should return false when exist totalSet but have empty score' , () => {
            resultDetail.resourceId = '00';
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '';

            const result = service.isNotConsistentTotalSet([resultDetail]);

            expect(result).toBeFalsy();
        });

        it('should return false when not exist Set have empty score' , () => {
            resultDetail.resourceId = '0101';
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '';

            const result = service.isNotConsistentTotalSet([resultDetail]);

            expect(result).toBeFalsy();
        });

        it('should return false when totalSet is consistent' , () => {
            resultDetail.homeValue = '2';
            resultDetail.awayValue = '2';
            totalSet.homeValue = '0';
            totalSet.awayValue = '0';

            const result = service.isNotConsistentTotalSet([resultDetail, totalSet]);

            expect(result).toBeFalsy();
        });

        it('should return true when totalSet is not consistent' , () => {
            resultDetail.homeValue = '2';
            resultDetail.awayValue = '2';
            totalSet.homeValue = '1';
            totalSet.awayValue = '2';

            const result = service.isNotConsistentTotalSet([resultDetail, totalSet]);

            expect(result).toBeTruthy();
        });
    });

    describe("verifyCopyScore", () => {
        it("return error message when total set is manual completed", () => {
            const external = new ExternalResultDetail(1, '', '');
            totalSet.resultStatusId = ResultStatusId.ManualCompleted;

            expect(service.verifyCopyScore(external, totalSet)).toEqual("WARNING! Cannot proceed due to settled match.");
        });

        it("return error message when total set is Auto Completed", () => {
            const external = new ExternalResultDetail(1, '', '');
            totalSet.resultStatusId = ResultStatusId.AutoCompleted;

            expect(service.verifyCopyScore(external, totalSet)).toEqual("WARNING! Cannot proceed due to settled match.");
        });

        it("return error message when value is empty", () => {
            const external = new ExternalResultDetail(1, '', '');
            totalSet.resultStatusId = ResultStatusId.RunningOne;

            expect(service.verifyCopyScore(external, totalSet)).toEqual("WARNING! Cannot proceed due to missing score from SBO.");
        });

        it("return empty when pass all condition", () => {
            const external = new ExternalResultDetail(1, '1', '');
            external.homeValue = '1';
            external.awayValue = '2';
            totalSet.resultStatusId = ResultStatusId.RunningOne;

            expect(service.verifyCopyScore(external, totalSet)).toEqual("");
        });
    });

    describe('verifyConsistentChildMatch - isConsistent', () => {
        it('should return true when scores are not consistent', () => {
            resultDetail.resourceId = '0101';
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '2';
            const childMatch = new ChildMatch();
            childMatch.homeValue = '1';
            childMatch.awayValue = '1';
            childMatch.relatedResourceId = "0101";

            const actual = service.verifyConsistentChildMatch([resultDetail], [childMatch]);
            const actualTwo = service.isNotConsistent([resultDetail], childMatch);

            expect(actual).toBeTruthy();
            expect(actualTwo).toBeTruthy();
        });

        it('should return true when scores are consistent', () => {
            resultDetail.homeValue = '1';
            resultDetail.awayValue = '2';
            const childMatch = new ChildMatch();
            childMatch.homeValue = '1';
            childMatch.awayValue = '2';
            childMatch.relatedResourceId = "0101";

            const actual = service.verifyConsistentChildMatch([resultDetail], [childMatch]);
            const actualTwo = service.isNotConsistent([resultDetail], childMatch);

            expect(actual).toBeFalsy();
            expect(actualTwo).toBeFalsy();
        });
    });

    describe('isScoreMismatched', () => {
        it('should set false when score empty', () => {
            const set = new ResultDetail();
            const external = {} as ExternalResultDetail;

            service.isScoreMismatched(set, external, set, matchDetail);

            expect(set.isScoreMismatched).toBeFalsy();
        });

        it('should set true when score mismatched', () => {
            const set = {
                homeValue: '3',
                awayValue: '2',
            } as ResultDetail;
            const external = {
                homeValue: '1',
                awayValue: '0'
            } as ExternalResultDetail;

            service.isScoreMismatched(set, external, set, matchDetail);

            expect(set.isScoreMismatched).toBe(true);
        });

        it('should set false when external score empty', () => {
            const set = {
                homeValue: '3',
                awayValue: '2',
            } as ResultDetail;
            const external = {
                homeValue: '1',
            } as ExternalResultDetail;

            service.isScoreMismatched(set, external, set, matchDetail);

            expect(set.isScoreMismatched).toBe(false);
        });

        it('should set false when score matched', () => {
            const set = {
                homeValue: '3',
                awayValue: '2',
            } as ResultDetail;
            const external = {
                homeValue: '3',
                awayValue: '2',
            } as ExternalResultDetail;

            service.isScoreMismatched(set, external, set, matchDetail);

            expect(set.isScoreMismatched).toBe(false);
        });

        it('should set false when trader score mismatched with result', () => {
            const set = {
                homeValue: '3',
                awayValue: '2',
            } as ResultDetail;
            const external = {
                homeValue: '3',
                awayValue: '2',
            } as ExternalResultDetail;
            const trader = {
                homeValue: '3',
                awayValue: '3'
            } as ResultDetail;
            matchDetail.confirmFT = 1;

            service.isScoreMismatched(set, external, trader, matchDetail);

            expect(set.isScoreMismatched).toBe(true);
        });

        it('should set false when trader score mismatched with external result', () => {
            const set = {
                homeValue: '',
                awayValue: '',
            } as ResultDetail;
            const external = {
                homeValue: '3',
                awayValue: '2',
            } as ExternalResultDetail;
            const trader = {
                homeValue: '3',
                awayValue: '3'
            } as ResultDetail;
            matchDetail.confirmFT = 1;

            service.isScoreMismatched(set, external, trader, matchDetail);

            expect(set.isScoreMismatched).toBe(true);
        });
    });
});