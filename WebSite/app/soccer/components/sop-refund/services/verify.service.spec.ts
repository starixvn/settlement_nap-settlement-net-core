import { VerifyService } from './verify.service';
import { TestBed } from '@angular/core/testing';
import { RefundStorage } from '../../../storage/refund.storage';
import { VerificationBaseService } from '../../../services/verification-base.service';
import { MatchDetail } from '../../refund/model/match.model';
import { EventStatus } from '../../../../shared/constants';
import { ToastrModule } from 'ngx-toastr';

describe('Soccer - VerifyService', () => {
    let service: VerifyService;
    let refundStorage: RefundStorage;
    let verificationBaseService: VerificationBaseService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                VerifyService,
                RefundStorage,
                VerificationBaseService
            ],
            imports: [
                ToastrModule.forRoot()
            ]
        });

        service = TestBed.inject(VerifyService);
        refundStorage = TestBed.inject(RefundStorage);
        verificationBaseService = TestBed.inject(VerificationBaseService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('verifyScore', () => {
        it('should set isScoreInconsistent to true when HT and FT scores exist and are inconsistent', () => {
            // Arrange
            const mockMatchDetail = { isScoreInconsistent: false } as any;
            const mockHalfTimeResult = { homeValue: '2', awayValue: '1' } as any;
            const mockFullTimeResult = { homeValue: '1', awayValue: '0' } as any;

            jest.spyOn(refundStorage, 'getHalfTimeResult').mockReturnValue(mockHalfTimeResult);
            jest.spyOn(refundStorage, 'getFullTimeResult').mockReturnValue(mockFullTimeResult);
            jest.spyOn(refundStorage, 'getMatchDetail').mockReturnValue(mockMatchDetail);
            jest.spyOn(verificationBaseService, 'isEmptyScore').mockReturnValue(false);

            // Act
            service.verifyScore();

            // Assert
            expect(mockMatchDetail.isScoreInconsistent).toBe(true);
        });

        it('should set isScoreInconsistent to false when HT scores are empty', () => {
            // Arrange
            const mockMatchDetail = { isScoreInconsistent: false } as any;
            const mockHalfTimeResult = { homeValue: '', awayValue: '' } as any;
            const mockFullTimeResult = { homeValue: '1', awayValue: '0' } as any;

            jest.spyOn(refundStorage, 'getHalfTimeResult').mockReturnValue(mockHalfTimeResult);
            jest.spyOn(refundStorage, 'getFullTimeResult').mockReturnValue(mockFullTimeResult);
            jest.spyOn(refundStorage, 'getMatchDetail').mockReturnValue(mockMatchDetail);
            jest.spyOn(verificationBaseService, 'isEmptyScore').mockImplementation((value) => value === '');

            // Act
            service.verifyScore();

            // Assert
            expect(mockMatchDetail.isScoreInconsistent).toBe(false);
        });

        it('should set isScoreInconsistent to false when scores are consistent', () => {
            // Arrange
            const mockMatchDetail = { isScoreInconsistent: false } as any;
            const mockHalfTimeResult = { homeValue: '1', awayValue: '0' } as any;
            const mockFullTimeResult = { homeValue: '2', awayValue: '1' } as any;

            jest.spyOn(refundStorage, 'getHalfTimeResult').mockReturnValue(mockHalfTimeResult);
            jest.spyOn(refundStorage, 'getFullTimeResult').mockReturnValue(mockFullTimeResult);
            jest.spyOn(refundStorage, 'getMatchDetail').mockReturnValue(mockMatchDetail);
            jest.spyOn(verificationBaseService, 'isEmptyScore').mockReturnValue(false);

            // Act
            service.verifyScore();

            // Assert
            expect(mockMatchDetail.isScoreInconsistent).toBe(false);
        });
    });

    describe('isRefundHalfTimeBetStatus', () => {
        it('should return true when betStatus contains refundHalftime', () => {
            // Arrange
            const matchDetail = { betStatus: `${EventStatus.refundHalftime};someOtherStatus` } as MatchDetail;

            // Act
            const result = service.isRefundHalfTimeBetStatus(matchDetail);

            // Assert
            expect(result).toBe(true);
        });

        it('should return true when betStatus contains refund', () => {
            // Arrange
            const matchDetail = { betStatus: `${EventStatus.refund};someOtherStatus` } as MatchDetail;

            // Act
            const result = service.isRefundHalfTimeBetStatus(matchDetail);

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when betStatus is null', () => {
            // Arrange
            const matchDetail = { betStatus: null } as MatchDetail;

            // Act
            const result = service.isRefundHalfTimeBetStatus(matchDetail);

            // Assert
            expect(result).toBe(false);
        });

        it('should return false when betStatus does not contain refund keywords', () => {
            // Arrange
            const matchDetail = { betStatus: 'someOtherStatus;anotherStatus' } as MatchDetail;

            // Act
            const result = service.isRefundHalfTimeBetStatus(matchDetail);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe('isEmptyScore', () => {
        it('should return false when value is a number', () => {
            // Act
            const result = service.isEmptyScore(5);

            // Assert
            expect(result).toBe(false);
        });

        it('should return true when value is null', () => {
            // Act
            const result = service.isEmptyScore(null);

            // Assert
            expect(result).toBe(true);
        });

        it('should return true when value is empty string', () => {
            // Act
            const result = service.isEmptyScore('');

            // Assert
            expect(result).toBe(true);
        });

        it('should return false when value is a non-empty string', () => {
            // Act
            const result = service.isEmptyScore('1');

            // Assert
            expect(result).toBe(false);
        });
    });
}); 