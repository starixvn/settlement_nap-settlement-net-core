
import { HttpClientModule } from '@angular/common/http';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../../shared/services';
import { RefundQuery } from '../model/query.model';
import { RequestService } from './request.service';
describe('Soccer refund - request service', () => {
    let service: RequestService;
    let httpRequestService: HttpRequestService;
    beforeEach(() => TestBed.configureTestingModule({
        providers: [
            RequestService,
            HttpRequestService,
            BlockUIService,
            MessageBoxService
        ], imports: [
            HttpClientModule,
            NgbModule
        ],
    }));

    beforeEach(() => {
        service = TestBed.inject(RequestService);
        httpRequestService = TestBed.inject(HttpRequestService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('getMatch - Call exact Url and param',
        fakeAsync(
            () => {
                // Arrange
                const matchId = 7000000;
                const url = 'Local/api/soccer/get-match';
                const query = {
                    matchId,
                    isRefundPage: true,
                };

                // Act
                spyOn(httpRequestService, 'postJson');
                service.getMatch(7000000);
                tick();

                // Assert
                expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
            }));

    it('checkNewStatus - Call exact Url and param',
        fakeAsync(
            () => {
                // Arrange
                const matchId = 7000000;
                const url = 'Local/api/soccer/check-status';
                const query = {
                    matchId,
                    actionName: "calc",
                    isSettleAbandonedMatchIBC: true
                };

                // Act
                spyOn(httpRequestService, 'postJson');
                service.checkNewStatus(7000000, "calc", true);
                tick();

                // Assert
                expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
            }));

    it('getSpecificBetType - Call exact Url and param',
        fakeAsync(
            () => {
                // Arrange
                const url = 'Local/api/soccer/specific-bet-type';
                const query = {
                    type: "BetDaq",
                    action: "ALL"

                };

                // Act
                spyOn(httpRequestService, 'postJson');
                service.getSpecificBetType("BetDaq", "ALL");
                tick();

                // Assert
                expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
            }));

    it('checkingMarkedTicket - Call exact Url and param', fakeAsync(
        () => {
            // Arrange
            const url = 'Local/api/soccer/checking-marked-tickets';
            const query = {
                matchId: 10000,
                actionName: "Refund FT"

            };

            // Act
            spyOn(httpRequestService, 'postJson');
            service.checkingMarkedTicket("Refund FT", 10000);
            tick();

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url, false);
        }));

    it('refundMatch - Call exact Url and param', fakeAsync(
        () => {
            // Arrange
            const url = 'Local/api/soccer/refund';
            const query: RefundQuery = {
                matchId: 10000,
                actionName: "Refund FT",
                hedgeMatchId: 0,
                isApplyHedging: false,
                goalRecord: '',
                halfTimeHomeScore: 0,
                halfTimeAwayScore: 0,
                finalHomeScore: 0,
                finalAwayScore: 0,
                isSettleAbandonedMatchBetDaq: false,
                isSettleAbandonedMatchBetFair: false,
                isSettleAbandonedMatchIBC: false,
                excludeTicketBetDaqInRefund: false,
                excludeTicketBetFairInRefund: false,
                isExistFgLg: false,
                isExistHtFgLg: false,
                isDeterminedHedgeMatch: false,
                isEnabledGoalRecordFt: false,
                isEnabledGoalRecordHt: false
            };

            // Act
            spyOn(httpRequestService, 'postJson');
            service.refundMatch(query);
            tick();

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
        }));
    it('refundRunningThirdPartyTickets - Call exact Url and param', fakeAsync(
        () => {
            // Arrange
            const url = 'Local/api/soccer/refund-running-third-party-ticket';
            const query = {
                matchId: 10000,
                actionName: "Refund FT"

            };

            // Act
            spyOn(httpRequestService, 'postJson');
            service.refundRunningThirdPartyTickets(10000, "Refund FT");
            tick();

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
        }));


    it('getMatchDetailThirdPartyBetTickets - Call exact Url and param', fakeAsync(
        () => {
            // Arrange
            const url = 'Local/api/soccer/third-party-bet-tickets-checking';
            const query = {
                matchId: 10000,

            };

            // Act
            spyOn(httpRequestService, 'postJson');
            service.getMatchDetailThirdPartyBetTickets(10000);
            tick();

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
        }));

    it('moveBetType - Call exact Url and param', fakeAsync(
        () => {
            // Arrange
            const url = 'Local/api/soccer/move-third-party-bet-ticket';
            const query = {
                matchId: 10000,
                newMatchId: 20000,
                newMatchCode: "abc1234",
                actionName: "Refund FT"
            };

            // Act
            spyOn(httpRequestService, 'postJson');
            service.moveBetType(10000, 20000, "abc1234", "Refund FT");
            tick();

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, url);
        }));

});