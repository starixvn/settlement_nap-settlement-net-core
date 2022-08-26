import { HttpClient, HttpClientModule, HttpHandler } from "@angular/common/http";
import { inject, TestBed } from "@angular/core/testing";
import { RequestService } from "../../services/request.service";
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { GameTotalMatchService } from "./game-total-match.service";
import { MatchDetail } from "../../models";
import { ResultDetail } from "../../../shared/models/sportsbook-sop";
import { Result } from "../../../shared/models";
import { of } from "rxjs";

describe('GameTotalMatchService', () => {
    let service: GameTotalMatchService = null;
    let closePopupService: ClosePopupService;
    let requestService: RequestService;
    const errorMessage = "error";
    const successfulResult = {
        isSuccessful: true
    } as Result;
    const unsuccessfulResult = {
        isSuccessful: false,
        errMsg: errorMessage
    } as Result;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
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

        service = TestBed.inject(GameTotalMatchService);
        closePopupService = TestBed.inject(ClosePopupService);
        requestService = TestBed.inject(RequestService);
    });

    beforeEach(inject([GameTotalMatchService], (gameTotalMatchService: GameTotalMatchService) => {
        service = gameTotalMatchService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    describe('isReadyMatch', () => {
        let matchDetail: MatchDetail;
        beforeEach(() => {
            matchDetail = {} as MatchDetail;
        });

        it('should return true when match is confirmed half time', () => {
            matchDetail.confirmHT = 1;

            expect(service.isReadyMatch(matchDetail)).toBe(true);
        });

        it('should return true when match is confirmed full time', () => {
            matchDetail.confirmFT = 1;

            expect(service.isReadyMatch(matchDetail)).toBe(true);
        });

        it('should return true when match is completed', () => {
            matchDetail.eventStatus = "completed";

            expect(service.isReadyMatch(matchDetail)).toBe(true);
        });

        it('should return true when there is valid play time', () => {
            matchDetail.playTime = 45;

            expect(service.isReadyMatch(matchDetail)).toBe(true);
        });

        it('should return false when match not ready', () => {
            matchDetail.playTime = 10;

            expect(service.isReadyMatch(matchDetail)).toBe(false);
        });
    });

    describe('resetHomeAway', () => {
        let set: ResultDetail;
        let matchDetail: MatchDetail;
        beforeEach(() => {
            set = {
                homeValue: '2',
                awayValue: '3'
            } as ResultDetail;
            matchDetail = {} as MatchDetail;
        });

        it('should show score when there is leader permission', () => {
            service.resetHomeAway(matchDetail, [set], true);

            expect(set.homeValue).toEqual('2');
        });

        it('should show score when match calculated', () => {
            matchDetail.isCalculated = true;
            service.resetHomeAway(matchDetail, [set], false);

            expect(set.homeValue).toEqual('2');
        });

        it('should hide score when match is refunded', () => {
            matchDetail.isCalRefund = true;
            service.resetHomeAway(matchDetail, [set], false);

            expect(set.homeValue).toEqual('');
        });

        it('should hide score when there is member and match is running', () => {
            service.resetHomeAway(matchDetail, [set], false);

            expect(set.homeValue).toEqual('');
        });
    });

    it('getResultDetail - should sum and push total points', () => {
        const set = {
            resourceId: '1',
            homeValue: '2',
            awayValue: '3'
        } as ResultDetail;

        const totalSet = {
            resourceId: '00',
            homeValue: '0',
            awayValue: '2'
        } as ResultDetail;

        const matchDetail = new MatchDetail();

        expect(service.getResultDetail(matchDetail, [set, set, totalSet]).length).toEqual(4);
    });

    describe('sumTotalPoints', () => {
        const set = {
            resourceId: '1',
            homeValue: '2',
            awayValue: '3'
        } as ResultDetail;

        const totalPoints = {
            resourceId: '01',
            homeValue: '0',
            awayValue: '0'
        } as ResultDetail;

        it('should sum total points when there is sets score', () => {
            service.sumTotalPoints([set, set, totalPoints], totalPoints);

            expect(totalPoints.homeValue).toEqual('4');
            expect(totalPoints.awayValue).toEqual('6');
        });

        it('should not sum total points when there is no sets score', () => {
            service.sumTotalPoints([], totalPoints);

            expect(totalPoints.homeValue).toEqual('');
            expect(totalPoints.awayValue).toEqual('');
        });
    });

    describe('computeTotalSets', () => {
        const set = {
            resourceId: '1',
            homeValue: '2',
            awayValue: '3'
        } as ResultDetail;

        const totalSets = {
            resourceId: '00',
            homeValue: '0',
            awayValue: '0'
        } as ResultDetail;

        it('should compute total sets when there is sets score', () => {
            service.computeTotalSets([set, set, totalSets], totalSets);

            expect(totalSets.homeValue).toEqual('0');
            expect(totalSets.awayValue).toEqual('2');
        });

        it('should not compute total sets when there is no sets score', () => {
            service.computeTotalSets([], totalSets);

            expect(totalSets.homeValue).toEqual('');
            expect(totalSets.awayValue).toEqual('');
        });
    });

    describe('refund', () => {
        const totalSets = {
            homeValue: '2',
            awayValue: '1',
        } as ResultDetail;

        it('should return empty and call close popup when refund successfully',async () => {
            spyOn(closePopupService, 'closePopup');
            spyOn(requestService, 'refund').and.returnValue(of(successfulResult));

            expect(await service.refund(123, 456, totalSets)).toEqual('');
        });

        it('should return error message when refund fail', async () => {
            spyOn(requestService, 'refund').and.returnValue(of(unsuccessfulResult));

            expect(await service.refund(123, 456, totalSets)).toEqual(errorMessage);
        });
    });

    describe('refundParlay', () => {
        it('should return empty and call close popup when refund successfully',async () => {
            spyOn(closePopupService, 'closePopup');
            spyOn(requestService, 'refundParlay').and.returnValue(of(successfulResult));

            expect(await service.refundParlay(123, 456)).toEqual('');
        });

        it('should return error message when refund fail', async () => {
            spyOn(requestService, 'refundParlay').and.returnValue(of(unsuccessfulResult));

            expect(await service.refundParlay(123, 456)).toEqual(errorMessage);
        });
    });
});