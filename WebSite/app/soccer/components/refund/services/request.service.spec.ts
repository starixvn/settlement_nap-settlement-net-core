
import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../../shared/services';
import { RefundQuery } from '../model/query.model';
import { RequestService } from './request.service';
describe('Soccer refund - request service', () => {
    let service: RequestService;
    let httpRequestService: HttpRequestService;
    const url = '/api/soccer';
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
            () => {
                // Arrange
                const matchId = 7000000;
                const apiUrl = `${url}/get-match`;
                const query = {
                    matchId,
                    isRefundPage: true,
                };

                // Act
                jest.spyOn(httpRequestService, 'postJson');
                service.getMatch(7000000);

                // Assert
                expect(httpRequestService.postJson).toHaveBeenCalledWith(query, apiUrl);
            });

    it('checkNewStatus - Call exact Url and param',
            () => {
                // Arrange
                const matchId = 7000000;
                const apiUrl = `${url}/check-status`;
                const query = {
                    matchId,
                    actionName: "calc",
                    isSettleAbandonedMatchIBC: true
                };

                // Act
                jest.spyOn(httpRequestService, 'postJson');
                service.checkNewStatus(7000000, "calc", true);

                // Assert
                expect(httpRequestService.postJson).toHaveBeenCalledWith(query, apiUrl);
            });

    it('getSpecificBetType - Call exact Url and param',
            () => {
                // Arrange
                const apiUrl = `${url}/specific-bet-type`;
                const query = {
                    type: "BetDaq",
                    action: "ALL"

                };

                // Act
                jest.spyOn(httpRequestService, 'postJson');
                service.getSpecificBetType("BetDaq", "ALL");

                // Assert
                expect(httpRequestService.postJson).toHaveBeenCalledWith(query, apiUrl);
            });

    it('checkingMarkedTicket - Call exact Url and param', 
        () => {
            // Arrange
            const apiUrl = `${url}/checking-marked-tickets`;
            const query = {
                matchId: 10000,
                actionName: "Refund FT"

            };

            // Act
            jest.spyOn(httpRequestService, 'postJson');
            service.checkingMarkedTicket("Refund FT", 10000);

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, apiUrl, false);
        });

    it('refundMatch - Call exact Url and param', 
        () => {
            // Arrange
            const apiUrl = `${url}/refund`;
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
            jest.spyOn(httpRequestService, 'postJson');
            service.refundMatch(query);

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, apiUrl);
        });
    it('refundRunningThirdPartyTickets - Call exact Url and param',
        () => {
            // Arrange
            const apiUrl = `${url}/refund-running-third-party-ticket`;
            const query = {
                matchId: 10000,
                actionName: "Refund FT"

            };

            // Act
            jest.spyOn(httpRequestService, 'postJson');
            service.refundRunningThirdPartyTickets(10000, "Refund FT");

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, apiUrl);
        });


    it('getMatchDetailThirdPartyBetTickets - Call exact Url and param',
        () => {
            // Arrange
            const apiUrl = `${url}/third-party-bet-tickets-checking`;
            const query = {
                matchId: 10000,

            };

            // Act
            jest.spyOn(httpRequestService, 'postJson');
            service.getMatchDetailThirdPartyBetTickets(10000);

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, apiUrl);
        });

    it('moveBetType - Call exact Url and param', 
        () => {
            // Arrange
            const apiUrl = `${url}/move-third-party-bet-ticket`;
            const query = {
                matchId: 10000,
                newMatchId: 20000,
                newMatchCode: "abc1234",
                actionName: "Refund FT"
            };

            // Act
            jest.spyOn(httpRequestService, 'postJson');
            service.moveBetType(10000, 20000, "abc1234", "Refund FT");

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(query, apiUrl);
        });
});