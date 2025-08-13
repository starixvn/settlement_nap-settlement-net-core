import { RequestService } from './request.service';
import { TestBed } from '@angular/core/testing';
import { RequestBaseService } from '../../../services/request-base.service';
import { Result } from '../../../../shared/models';
import { RefundQuery } from '../models/query.model';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService } from '../../../../shared/services';

describe('Soccer - RequestService', () => {
    let service: RequestService;
    let httpRequestService: HttpRequestService;
    const ApiUrl = '/api/soccer';

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RequestService,
                RequestBaseService
            ],
            imports: [
                HttpClientModule
            ]
        });

        service = TestBed.inject(RequestService);
        httpRequestService = TestBed.inject(HttpRequestService);
        jest.spyOn(httpRequestService, 'postJson').mockReturnValue(of({}));
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('checkNewStatus', () => {
        it('should return a Promise<Result>', async () => {
            const url = `${ApiUrl}/check-status`;

            // Act
            await service.checkNewStatus(123, 'test', false);

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith({ matchId: 123, actionName: 'test', isSettleAbandonedMatchIBC: false }, url);
        });
    });

    describe('refundMatch', () => {
        it('should return a Promise<Result>', async () => {
            // Arrange
            const refundQuery = { matchId: 123, actionName: 'refund' } as any;

            // Act
            await service.refundMatch(refundQuery);

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith(refundQuery, `${ApiUrl}/refund`);
        });
    });

    describe('getSpecificBetType', () => {
        it('should return an Observable', () => {
            // Arrange
            const type = 'testType';
            const action = 'testAction';

            // Act
            const result = service.getSpecificBetType(type, action);

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith({ type: 'testType', action: 'testAction' }, `${ApiUrl}/specific-bet-type`);
        });
    });

    describe('refundRunningThirdPartyTickets', () => {
        it('should return a Promise<Result>', async () => {  
            // Act
            const result = await service.refundRunningThirdPartyTickets(123, 'test');

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith({ matchId: 123, actionName: 'test' }, `${ApiUrl}/refund-running-third-party-ticket`);
        });
    });

    describe('getMatchDetailThirdPartyBetTickets', () => {
        it('should return an Observable', () => {
            // Arrange
            const matchId = 123;

            // Act
            const result = service.getMatchDetailThirdPartyBetTickets(matchId);

            // Assert
            expect(result).toBeDefined();
        });
    });

    describe('moveBetType', () => {
        it('should return a Promise<Result>', async () => {
            // Act
            const result = await service.moveBetType(123, 456, 'NEW123', 'moveBet');

            // Assert
            expect(httpRequestService.postJson).toHaveBeenCalledWith({ matchId: 123, newMatchId: 456, newMatchCode: 'NEW123', actionName: 'moveBet' }, `${ApiUrl}/move-third-party-bet-ticket`);
        });
    });
}); 