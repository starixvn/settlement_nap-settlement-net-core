import { RefundService } from './refund.service';
import { TestBed } from '@angular/core/testing';
import { RefundStorage } from '../../../storage/refund.storage';
import { CalculateAction } from '../../../../shared/constants';
import { AbstractHandler } from '../../../handlers/abstract.handler.native';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';

describe('Soccer - RefundService', () => {
    let service: RefundService;
    let refundStorage: RefundStorage;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                RefundService,
                RefundStorage
            ],
            imports: [
                ToastrModule.forRoot(),
                HttpClientModule,

            ]
        });

        service = TestBed.inject(RefundService);
        refundStorage = TestBed.inject(RefundStorage);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have refundHandler initialized', () => {
        expect(service.refundHandler).toBeDefined();
        expect(service.refundHandler instanceof AbstractHandler).toBe(true);
    });

    it('should have undoConfirmChain initialized', () => {
        expect(service.undoConfirmChain).toBeDefined();
        expect(service.undoConfirmChain instanceof AbstractHandler).toBe(true);
    });

    it('should have verifyRefundHalfTimeChain initialized', () => {
        expect(service.verifyRefundHalfTimeChain).toBeDefined();
        expect(service.verifyRefundHalfTimeChain instanceof AbstractHandler).toBe(true);
    });

    it('should have verifyRefundFullTimeChain initialized', () => {
        expect(service.verifyRefundFullTimeChain).toBeDefined();
        expect(service.verifyRefundFullTimeChain instanceof AbstractHandler).toBe(true);
    });

    it('should have verifyRefundAllChain initialized', () => {
        expect(service.verifyRefundAllChain).toBeDefined();
        expect(service.verifyRefundAllChain instanceof AbstractHandler).toBe(true);
    });

    it('should have verifyRefundNotSdtChain initialized', () => {
        expect(service.verifyRefundNotSdtChain).toBeDefined();
        expect(service.verifyRefundNotSdtChain instanceof AbstractHandler).toBe(true);
    });

   
    describe('refund', () => {
        it('should set isSettleAbandonedMatchIBC and call refundHandler', () => {
            // Arrange
            const mockMatch = {
                matchDetail: { isSettleAbandonedMatchIBC: false },
                betDaq: { settleDeterminedBetDaq: false },
                betFair: { settleDeterminedBetFair: false }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);
            jest.spyOn(service.refundHandler, 'handle');

            // Act
            service.refund(true);

            // Assert
            expect(mockMatch.matchDetail.isSettleAbandonedMatchIBC).toBe(true);
            expect(service.refundHandler.handle).toHaveBeenCalledWith(refundStorage);
        });

        it('should set isSettleAbandonedMatchIBC to true when betDaq is settle determined', () => {
            // Arrange
            const mockMatch = {
                matchDetail: { isSettleAbandonedMatchIBC: false },
                betDaq: { settleDeterminedBetDaq: true },
                betFair: { settleDeterminedBetFair: false }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);
            jest.spyOn(service.refundHandler, 'handle');

            // Act
            service.refund(false);

            // Assert
            expect(mockMatch.matchDetail.isSettleAbandonedMatchIBC).toBe(true);
        });

        it('should set isSettleAbandonedMatchIBC to true when betFair is settle determined', () => {
            // Arrange
            const mockMatch = {
                matchDetail: { isSettleAbandonedMatchIBC: false },
                betDaq: { settleDeterminedBetDaq: false },
                betFair: { settleDeterminedBetFair: true }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);
            jest.spyOn(service.refundHandler, 'handle');

            // Act
            service.refund(false);

            // Assert
            expect(mockMatch.matchDetail.isSettleAbandonedMatchIBC).toBe(true);
        });
    });

    describe('verifyRefund (private method)', () => {
        it('should return verifyRefundHalfTimeChain for refundHalfTime action', () => {
            // Arrange
            const mockMatch = {
                betDaq: { settleDeterminedBetDaq: false },
                betFair: { settleDeterminedBetFair: false },
                matchDetail: { isSettleAbandonedMatchIBC: false }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);

            // Act
            const result = (service as any).verifyRefund(CalculateAction.refundHalfTime, true);

            // Assert
            expect(result).toBe(service.verifyRefundHalfTimeChain);
        });

        it('should return verifyRefundFullTimeChain for refundFullTime action when settleDeterminableTickets is true', () => {
            // Arrange
            const mockMatch = {
                betDaq: { settleDeterminedBetDaq: false },
                betFair: { settleDeterminedBetFair: false },
                matchDetail: { isSettleAbandonedMatchIBC: false }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);

            // Act
            const result = (service as any).verifyRefund(CalculateAction.refundFullTime, true);

            // Assert
            expect(result).toBe(service.verifyRefundFullTimeChain);
        });

        it('should return verifyRefundNotSdtChain for refundFullTime action when settleDeterminableTickets is false', () => {
            // Arrange
            const mockMatch = {
                betDaq: { settleDeterminedBetDaq: false },
                betFair: { settleDeterminedBetFair: false },
                matchDetail: { isSettleAbandonedMatchIBC: false }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);

            // Act
            const result = (service as any).verifyRefund(CalculateAction.refundFullTime, false);

            // Assert
            expect(result).toBe(service.verifyRefundNotSdtChain);
        });

        it('should return verifyRefundAllChain for refund action when settleDeterminableTickets is true', () => {
            // Arrange
            const mockMatch = {
                betDaq: { settleDeterminedBetDaq: false },
                betFair: { settleDeterminedBetFair: false },
                matchDetail: { isSettleAbandonedMatchIBC: false }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);

            // Act
            const result = (service as any).verifyRefund(CalculateAction.refund, true);

            // Assert
            expect(result).toBe(service.verifyRefundAllChain);
        });

        it('should return verifyRefundNotSdtChain for refund action when settleDeterminableTickets is false', () => {
            // Arrange
            const mockMatch = {
                betDaq: { settleDeterminedBetDaq: false },
                betFair: { settleDeterminedBetFair: false },
                matchDetail: { isSettleAbandonedMatchIBC: false }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);

            // Act
            const result = (service as any).verifyRefund(CalculateAction.refund, false);

            // Assert
            expect(result).toBe(service.verifyRefundNotSdtChain);
        });
    });

    describe('confirmRefund', () => {
        it('should call undoConfirmChain when result is already confirmed', () => {
            // Arrange
            const mockMatch = {
                resultDetails: [
                    {
                        resultSettingData: {
                            isConfirmedRefund: true
                        }
                    }
                ]
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);
            jest.spyOn(service.undoConfirmChain, 'handle').mockImplementation(() => { });

            // Act
            service.confirmRefund(true, CalculateAction.refund);

            // Assert
            expect(service.undoConfirmChain.handle).toHaveBeenCalledWith(refundStorage);
        });

        it('should call verifyRefundHalfTimeChain for refundHalfTime action when no result is confirmed', () => {
            // Arrange
            const mockMatch = {
                resultDetails: [
                    {
                        resultSettingData: {
                            isConfirmedRefund: false,
                            isConfirmedRefundSdt: false
                        }
                    }
                ],
                betDaq: { settleDeterminedBetDaq: false },
                betFair: { settleDeterminedBetFair: false },
                matchDetail: { isSettleAbandonedMatchIBC: false }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);
            jest.spyOn(service.verifyRefundHalfTimeChain, 'handle');

            // Act
            service.confirmRefund(true, CalculateAction.refundHalfTime);

            // Assert
            expect(service.verifyRefundHalfTimeChain.handle).toHaveBeenCalledWith(refundStorage);
        });

        it('should call verifyRefundFullTimeChain for refundFullTime action with settleDeterminableTickets true', () => {
            // Arrange
            const mockMatch = {
                resultDetails: [
                    {
                        resultSettingData: {
                            isConfirmedRefund: false,
                            isConfirmedRefundSdt: false
                        }
                    }
                ],
                betDaq: { settleDeterminedBetDaq: false },
                betFair: { settleDeterminedBetFair: false },
                matchDetail: { isSettleAbandonedMatchIBC: false }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);
            jest.spyOn(service.verifyRefundFullTimeChain, 'handle');

            // Act
            service.confirmRefund(true, CalculateAction.refundFullTime);

            // Assert
            expect(service.verifyRefundFullTimeChain.handle).toHaveBeenCalledWith(refundStorage);
        });

        it('should call verifyRefundNotSdtChain for refund action with settleDeterminableTickets false and set isSettleAbandonedMatchIBC', () => {
            // Arrange
            const mockMatch = {
                resultDetails: [
                    {
                        resultSettingData: {
                            isConfirmedRefund: false,
                            isConfirmedRefundSdt: false
                        }
                    }
                ],
                betDaq: { settleDeterminedBetDaq: true },
                betFair: { settleDeterminedBetFair: false },
                matchDetail: { isSettleAbandonedMatchIBC: false }
            } as any;
            
            jest.spyOn(refundStorage, 'getMatch').mockReturnValue(mockMatch);
            jest.spyOn(service.verifyRefundNotSdtChain, 'handle');

            // Act
            service.confirmRefund(false, CalculateAction.refund);

            // Assert
            expect(mockMatch.matchDetail.isSettleAbandonedMatchIBC).toBe(true);
            expect(service.verifyRefundNotSdtChain.handle).toHaveBeenCalledWith(refundStorage);
        });
    });

    describe('buildChain (private method)', () => {
        it('should build a chain of handlers correctly', () => {
            // Arrange
            const handler1 = { setNextHandler: jest.fn() };
            const handler2 = { setNextHandler: jest.fn() };
            const handler3 = { setNextHandler: jest.fn() };

            // Act
            const result = (service as any).buildChain(handler1, handler2, handler3);

            // Assert
            expect(result).toBe(handler1);
            expect(handler1.setNextHandler).toHaveBeenCalledWith(handler2);
            expect(handler2.setNextHandler).toHaveBeenCalledWith(handler3);
        });

        it('should return single handler when only one is provided', () => {
            // Arrange
            const handler = { setNextHandler: jest.fn() };

            // Act
            const result = (service as any).buildChain(handler);

            // Assert
            expect(result).toBe(handler);
            expect(handler.setNextHandler).not.toHaveBeenCalled();
        });
    });
}); 