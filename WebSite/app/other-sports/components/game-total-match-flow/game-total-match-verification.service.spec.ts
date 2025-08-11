import { HttpClient, HttpClientModule, HttpHandler } from "@angular/common/http";
import { inject, TestBed } from "@angular/core/testing";
import { RequestService } from "../../services/request.service";
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { GameTotalMatchVerificationService } from "./game-total-match-verification.service";
import { GameTotalMatchService } from "./game-total-match.service";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { ResourcesIds } from "../../constants";
import { Match, MatchDetail } from "../../models";
import * as _ from "lodash";
import { of } from "rxjs";

describe('GameTotalMatchVerificationService', () => {
    let service: GameTotalMatchVerificationService = null;
    let gameTotalMatchService: GameTotalMatchService;
    let requestService: RequestService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GameTotalMatchVerificationService,
                GameTotalMatchService,
                RequestService,
                BlockUIService,
                MessageBoxService,
                ClosePopupService,
                HttpRequestService,
                HttpClient,
                HttpHandler,
            ],
            imports: [
                HttpClientModule,
            ],
        });

        service = TestBed.inject(GameTotalMatchVerificationService);
        gameTotalMatchService = TestBed.inject(GameTotalMatchService);
        requestService = TestBed.inject(RequestService);
    });

    beforeEach(inject([GameTotalMatchVerificationService], (verificationService: GameTotalMatchVerificationService) => {
        service = verificationService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('isScoreMismatched', () => {
        it('should set false when score empty', () => {
            const set = new ResultDetail();
            const matchDetail = new MatchDetail();

            service.isScoreMismatched(set, matchDetail, set);

            expect(set.isScoreMismatched).toBeFalsy();
        });

        it('should set true when score mismatched', () => {
            const set = {
                homeValue: '3',
                awayValue: '2',
            } as ResultDetail;
            const matchDetail = {
                exFTHomeScore: 1,
                exFTAwayScore: 0
            } as MatchDetail;

            service.isScoreMismatched(set, matchDetail, set);

            expect(set.isScoreMismatched).toBe(true);
        });

        it('should set false when external score empty', () => {
            const set = {
                homeValue: '3',
                awayValue: '2',
            } as ResultDetail;
            const matchDetail = {
                exFTHomeScore: 1,
            } as MatchDetail;

            service.isScoreMismatched(set, matchDetail, set);

            expect(set.isScoreMismatched).toBe(false);
        });

        it('should set false when score matched', () => {
            const set = {
                homeValue: '3',
                awayValue: '2',
            } as ResultDetail;
            const matchDetail = {
                exFTHomeScore: 3,
                exFTAwayScore: 2
            } as MatchDetail;

            service.isScoreMismatched(set, matchDetail, set);

            expect(set.isScoreMismatched).toBe(false);
        });

        it('should set false when trader score mismatched with result', () => {
            const set = {
                homeValue: '3',
                awayValue: '2',
            } as ResultDetail;
            const matchDetail = {
                confirmFT: 1,
            } as MatchDetail;
            const trader = {
                homeValue: '3',
                awayValue: '3'
            } as ResultDetail;

            service.isScoreMismatched(set, matchDetail, trader);

            expect(set.isScoreMismatched).toBe(true);
        });

        it('should set false when trader score mismatched with external result', () => {
            const set = {
                homeValue: '',
                awayValue: '',
            } as ResultDetail;
            const matchDetail = {
                exFTHomeScore: 3,
                exFTAwayScore: 2
            } as MatchDetail;
            const trader = {
                homeValue: '3',
                awayValue: '3'
            } as ResultDetail;
            matchDetail.confirmFT = 1;

            service.isScoreMismatched(set, matchDetail, trader);

            expect(set.isScoreMismatched).toBe(true);
        });
    });

    describe('verifyCopyScore', () => {
        it("return error message when total set is settled", () => {
            const matchDetail = {
                isFullTimeSettled: true
            } as MatchDetail;

            expect(service.verifyCopyScore(matchDetail)).toEqual("WARNING! Cannot proceed due to settled match.");
        });

        it("return error message when value is empty", () => {
            const matchDetail = {} as MatchDetail;

            expect(service.verifyCopyScore(matchDetail)).toEqual("WARNING! Cannot proceed due to missing score from SBO.");
        });

        it("return empty when pass all condition", () => {
            const matchDetail = {
                exFTHomeScore: 1,
                exFTAwayScore: 2
            } as MatchDetail;

            expect(service.verifyCopyScore(matchDetail)).toEqual("");
        });
    });

    describe('getResultDetailInAction', () => {
        const resultDetail = {
            resourceId: '1'
        } as ResultDetail;

        it('show return only total set when input directly is true', () => {
            const totalSet = _.cloneDeep(resultDetail);
            totalSet.resourceId = ResourcesIds.totalSets;

            const result = service.getResultDetailInAction([resultDetail, totalSet], true);

            expect(result).toEqual([totalSet]);
        });

        it('show return all result when input directly is false', () => {
            const totalSet = _.cloneDeep(resultDetail);
            totalSet.resourceId = ResourcesIds.totalSets;

            const result = service.getResultDetailInAction([resultDetail, totalSet], false);

            expect(result).toEqual([resultDetail, totalSet]);
        });
    });

    describe('isScoreInvalid', () => {
        it('should return error when there is empty score', () => {
            const set = {
                homeValue: '1'
            } as ResultDetail;

            expect(service.isScoreInvalid([set], false)).toEqual("Please input score accordingly.");
        });

        it('should return error when total sets not consistent', () => {
            const set = {
                homeValue: '1',
                awayValue: '2',
            } as ResultDetail;
            const totalSets = {
                homeValue: '1',
                awayValue: '0',
                resourceId: '00'
            } as ResultDetail;

            expect(service.isScoreInvalid([set, set, totalSets], false)).toEqual("WARNING! Cannot continue due to scores inconsistency. Please recheck and try again.");
        });

        it('should return empty when score is valid', () => {
            const set = {
                homeValue: '1',
                awayValue: '2',
            } as ResultDetail;
            const totalSets = {
                homeValue: '0',
                awayValue: '2',
                resourceId: '00'
            } as ResultDetail;

            expect(service.isScoreInvalid([set, set, totalSets], false)).toEqual('');
        });
    });

    describe('isNotConsistentTotalSet', () => {
        const resultDetail = {} as ResultDetail;
        const totalSet = {} as ResultDetail;
        beforeEach(() => {
            resultDetail.resourceId = '1';
            totalSet.resourceId = '00';
        });

        it('should return false when not exist totalSet' , () => {
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

    describe('verifyChangedSettledTickets', () => {
        const match = new Match();
        const resultDetail = {
            homeValue: '1',
            awayValue: '0'
        } as ResultDetail;
        const lastestResultDetail = {
            homeValue: '1',
            awayValue: '1'
        } as ResultDetail;
        const matchDetail = new MatchDetail();
        matchDetail.betStatus = '';
        const lastMatchDetail = new MatchDetail();
        lastMatchDetail.ftStatus = 'Complete';
        match.matchDetail = lastMatchDetail;
        match.resultDetails = [lastestResultDetail];

        it('should return false when no need to check for recalc tickets', async () => {
            let actualResult: boolean;
            jest.spyOn(requestService, 'getLastestResult').mockReturnValue(of(match));

            actualResult = await service.verifyChangedSettledTickets(123, [resultDetail], true);

            expect(actualResult).toBe(false);
        });

        it('should return true when need to check for recalc tickets', async () => {
            lastMatchDetail.ftStatus = 'Calculated';
            match.matchDetail = lastMatchDetail;
            const totalSet = {
                resourceId: '00',
                homeValue: '2',
                awayValue: '0'
            } as ResultDetail;
            match.resultDetails = [lastestResultDetail, totalSet];
            let actualResult: boolean;
            jest.spyOn(requestService, 'getLastestResult').mockReturnValue(of(match));

            actualResult = await service.verifyChangedSettledTickets(123, [resultDetail, totalSet], false);

            expect(actualResult).toBe(true);
        });
    });

    describe('isScoreConfirmed', () => {
        it('should return true when score confirmed', () => {
            const matchDetail = {
                confirmFT: 1
            } as MatchDetail;
            const resultDetail = {
                homeValue: '2',
                awayValue: '1'
            } as ResultDetail;

            expect(service.isScoreConfirmed(matchDetail, resultDetail)).toBe(true);
        });

        it('should return false when score not confirmed', () => {
            const matchDetail = {} as MatchDetail;
            const resultDetail = {
                homeValue: '2',
                awayValue: '1'
            } as ResultDetail;

            expect(service.isScoreConfirmed(matchDetail, resultDetail)).toBe(false);
        });
    });
});