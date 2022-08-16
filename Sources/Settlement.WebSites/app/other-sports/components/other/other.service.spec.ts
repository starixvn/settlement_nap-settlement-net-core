import { HttpClient, HttpClientModule, HttpHandler } from "@angular/common/http";
import { fakeAsync, inject, TestBed, tick } from "@angular/core/testing";
import { MatchDetail, Permission, RequestSettle } from "../../models";
import { RequestService } from "../../services/request.service";
import { BlockUIService, HttpRequestService, MessageBoxService } from "../../../shared/services";
import { OtherService } from "./other.service";
import { Language } from "../../../shared/language";
import { HedgeMatchDetail } from "../../../shared/models/sportsbook-sop";
import { Result } from "../../../shared/models";
import { of } from "rxjs";

describe('OtherService', () => {
    let service: OtherService = null;
    let httpRequestService: HttpRequestService;
    let messageBoxService: MessageBoxService;
    let requestService: RequestService;

    const matchDetail = {} as MatchDetail;
    matchDetail.sportType = 60;
    matchDetail.matchId = 123;
    matchDetail.sportName = 'test';
    matchDetail.matchCode = 'abc';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                OtherService,
                BlockUIService,
                MessageBoxService,
                RequestService,
                HttpRequestService,
                HttpClient,
                HttpHandler,
            ],
            imports: [
                HttpClientModule,
            ],
        });

        service = TestBed.inject(OtherService);
        httpRequestService = TestBed.inject(HttpRequestService);
        messageBoxService = TestBed.inject(MessageBoxService);
        requestService = TestBed.inject(RequestService);
    });

    beforeEach(inject([OtherService], (verificationService: OtherService) => {
        service = verificationService;
    }));

    it('should create a service', () => {
        expect(service).toBeTruthy();
    });

    it('getMessageConfirmRefund - return correct message', () => {
        const messageParlayAll = service.getMessageConfirmRefund(true, "REFUND");
        const messageParlayFT = service.getMessageConfirmRefund(true, "REFUND-FT");
        const messageFT = service.getMessageConfirmRefund(false, "REFUND-FT");
        const messageAll = service.getMessageConfirmRefund(false, "REFUND");

        expect(messageParlayAll).toEqual(Language.RefundParlayConfirmMessage);
        expect(messageParlayFT).toEqual(Language.RefundParlayFullTime);
        expect(messageFT).toEqual(Language.RefundFullMessage);
        expect(messageAll).toEqual(Language.RefundConfirmMessage);
    });

    describe('sendRequest', () => {
        matchDetail.matchId = 123;
        const hedgeMatchDetail = new HedgeMatchDetail();
        hedgeMatchDetail.matchId = 456;
        matchDetail.betStatus = "";
        it('should call refund parlay when action is parlay', fakeAsync(() => {
            const param = {
                matchId: matchDetail.matchId,
                action: "MP-REFUND",
                hedgeMatchId: hedgeMatchDetail.matchId,
                betStatus: ""
            }
            spyOn(requestService, 'refundParlay').and.returnValue(of(new Result()));
            tick();
            service.sendRequest(matchDetail, hedgeMatchDetail, "MP-REFUND", true);

            expect(requestService.refundParlay).toHaveBeenCalledWith(param);
        }));

        it('should call refund when action is not parlay', fakeAsync(() => {
            const param = {
                matchId: matchDetail.matchId,
                action: "REFUND",
                hedgeMatchId: hedgeMatchDetail.matchId,
                betStatus: ""
            }
            spyOn(requestService, 'refund').and.returnValue(of(new Result()));
            tick();
            service.sendRequest(matchDetail, hedgeMatchDetail, "REFUND", false);

            expect(requestService.refund).toHaveBeenCalledWith(param);
        }));
    });

    describe('isReadyMatch', () => {
        it('should return true when match is confirmed', () => {
            const match = { confirmHT: 1 } as MatchDetail;

            expect(service.isReadyMatch(match)).toBe(true);
        });

        it('should return true when match is completed', () => {
            const match = { eventStatus: "completed" } as MatchDetail;

            expect(service.isReadyMatch(match)).toBe(true);
        });

        it('should return true when kabbadi match is ready', () => {
            const match = { sportType: 47, playTime: 20 } as MatchDetail;

            expect(service.isReadyMatch(match)).toBe(true);
        });

        it('should return true when other sport match is ready', () => {
            const match = { sportType: 24, playTime: 30 } as MatchDetail;

            expect(service.isReadyMatch(match)).toBe(true);
        });

        it('should return false when match is not ready', () => {
            const match = { sportType: 47, playTime: 10 } as MatchDetail;

            expect(service.isReadyMatch(match)).toBe(false);
        });
    });

    describe('initScoreByPermission', () => {
        it('should show score when match is not refunded and there is leader', () => {
            const match = { finalHomeScore: 2, halfTimeHomeScore: 1, finalAwayScore: 4, halfTimeAwayScore: 3 } as MatchDetail;
            const permission = { isLeader: true } as Permission;

            service.initScoreByPermission(match, permission);

            expect(match.finalHomeScore).toEqual(2);
            expect(match.finalAwayScore).toEqual(4);
            expect(match.halfTimeHomeScore).toEqual(1);
            expect(match.halfTimeAwayScore).toEqual(3);
        });

        it('should show score when match is calculated', () => {
            const match = {
                finalHomeScore: 2,
                halfTimeHomeScore: 1,
                finalAwayScore: 4,
                halfTimeAwayScore: 3,
                isHalfTimeCal: true,
                isCalculated: true } as MatchDetail;
            const permission = {} as Permission;

            service.initScoreByPermission(match, permission);

            expect(match.finalHomeScore).toEqual(2);
            expect(match.finalAwayScore).toEqual(4);
            expect(match.halfTimeHomeScore).toEqual(1);
            expect(match.halfTimeAwayScore).toEqual(3);
        });

        it('should hide score when match is not refunded', () => {
            const match = {
                finalHomeScore: 2,
                halfTimeHomeScore: 1,
                finalAwayScore: 4,
                halfTimeAwayScore: 3,
                isCalRefund: true } as MatchDetail;
            const permission = { isLeader: true } as Permission;

            service.initScoreByPermission(match, permission);

            expect(match.finalHomeScore).toEqual(null);
            expect(match.finalAwayScore).toEqual(null);
            expect(match.halfTimeHomeScore).toEqual(null);
            expect(match.halfTimeAwayScore).toEqual(null);
        });

        it('should hide score when match is running and there is member', () => {
            const match = {
                finalHomeScore: 2,
                halfTimeHomeScore: 1,
                finalAwayScore: 4,
                halfTimeAwayScore: 3
            } as MatchDetail;
            const permission = {} as Permission;

            service.initScoreByPermission(match, permission);

            expect(match.finalHomeScore).toEqual(null);
            expect(match.finalAwayScore).toEqual(null);
            expect(match.halfTimeHomeScore).toEqual(null);
            expect(match.halfTimeAwayScore).toEqual(null);
        });
    });

    describe('isSupportCalculateHtFt', () => {
        it('should return true for 3 specific sports', () => {
            expect(service.showButtonBySportType(47)).toBe(true);
            expect(service.showButtonBySportType(49)).toBe(true);
            expect(service.showButtonBySportType(56)).toBe(true);
        });

        it('should return false for other sports', () => {
            expect(service.showButtonBySportType(24)).toBe(false);
        });
    });

    it('getFirstConfirmMessage - should get corresponding message with action type', () => {
        expect(service.getFirstConfirmMessage("CAL-HT")).toEqual("WARNING! Please double check the score!\nYou will not be able to cancel the FIRST HALF CALCULATION of this match!");
        expect(service.getFirstConfirmMessage("CAL-FT")).toEqual("Please double check the score!\nYou will not be able to cancel the FULL TIME CALCULATION of this match!");
        expect(service.getFirstConfirmMessage("CAL")).toEqual("Please double check the score and confirm this match is OVER!\nYou will not be able to cancel the CALCULATION and REUSE this match!");
    });

    it('getFirstConfirmMessage - should get corresponding message with action type', () => {
        expect(service.getSecondConfirmMessage("CAL-HT")).toEqual("Check again!\nAre you sure you want to CALCULATE FIRST HALF for this match?");
        expect(service.getSecondConfirmMessage("CAL-FT")).toEqual("Check again!\nAre you sure you want to CALCULATE only FULL TIME for this match?");
        expect(service.getSecondConfirmMessage("CAL")).toEqual("Check again!\nAre you sure you want to CALCULATE this match and it is OVER?");
    });

    it('settle - should execute with correct param', () => {
        const match = { matchId: 12345, betStatus: '',
            finalHomeScore: 4,
            finalAwayScore: 3,
            halfTimeHomeScore: 2,
            halfTimeAwayScore: 1,
        } as MatchDetail;

        const query = {
            matchId: 12345,
            action: 'CAL',
            isReSettledTickets: true,
            betStatus: '',
            halfTimeHomeScore: 2,
            halfTimeAwayScore: 1,
            finalHomeScore: 4,
            finalAwayScore: 3,
            refResultStatus: null,
            hedgeMatchId: 0,
            isApplyHedging: false
        } as RequestSettle;

        spyOn(requestService, 'calculate').and.returnValue(of({}));

        service.settle('CAL', true, match);

        expect(requestService.calculate).toHaveBeenCalledWith(query);
    });

    it('copyScores - should copy HT and Final scores', () => {
        const match = {
            exHTHomeScore: 1,
            exHTAwayScore: 2,
            exFTHomeScore: 3,
            exFTAwayScore: 4,
        } as MatchDetail;

        service.copyScores(match);

        expect(match.finalHomeScore).toEqual(3);
        expect(match.finalAwayScore).toEqual(4);
        expect(match.halfTimeHomeScore).toEqual(1);
        expect(match.halfTimeAwayScore).toEqual(2);
    });
});