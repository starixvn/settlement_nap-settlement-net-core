import { TestBed } from '@angular/core/testing';
import { MarkedRefundAllHandler } from './marked-refund-all.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AbstractHandler } from '../../abstract.handler.native';
import { Match, MatchDetail } from '../../../components/sop-refund/models/match.model';
import { Language } from '../../../../shared/language.native';
import { EventStatus } from '../../../../shared/constants';

describe('MarkedRefundAllHandler', () => {
  let handler: MarkedRefundAllHandler;
  let storage: RefundBaseStorage;

  const createMatchDetail = (): MatchDetail => ({
    eventStatus: '',
    isMarkedRefundAll: false,
    isSettleDetermined: false
  } as any);

  const match: Match = {
    matchDetail: createMatchDetail(),
    betDaq: {} as any,
    betFair: {} as any,
    hedgeMatchDetail: null as any,
    externalResults: [],
    resultDetails: [],
    permission: {} as any
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        MarkedRefundAllHandler,
        RefundStorage,
        ToastrService
      ]
    });

    handler = TestBed.inject(MarkedRefundAllHandler);
    storage = TestBed.inject(RefundStorage);

    // Reset match to default state
    match.matchDetail = createMatchDetail();

    // Mock storage methods
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getHalfTimeResult = jest.fn();
    storage.getFullTimeResult = jest.fn();
    storage.error = jest.fn();
  });

  describe('handle method', () => {
    it('should call super.handle when eventStatus is not postponed and isMarkedRefundAll is false', async () => {
      // Arrange
      match.matchDetail.eventStatus = 'active';
      match.matchDetail.isMarkedRefundAll = false;
      
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should call super.handle when mustRefundAll is true but both HT and FT are checked and not SDT', async () => {
      // Arrange
      match.matchDetail.isMarkedRefundAll = true;
      match.matchDetail.isSettleDetermined = false;
      
      storage.getHalfTimeResult = jest.fn().mockReturnValue({ checked: true });
      storage.getFullTimeResult = jest.fn().mockReturnValue({ checked: true });
      
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should show SDT error when mustRefundAll is true and isSettleDetermined is true', async () => {
      // Arrange
      match.matchDetail.eventStatus = EventStatus.postponed;
      match.matchDetail.isSettleDetermined = true;
      
      storage.getHalfTimeResult = jest.fn().mockReturnValue({ checked: true });
      storage.getFullTimeResult = jest.fn().mockReturnValue({ checked: true });
      
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.markedRefundAllSDTErrorMessage);
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should show selection error when mustRefundAll is true and HT is not checked', async () => {
      // Arrange
      match.matchDetail.isMarkedRefundAll = true;
      match.matchDetail.isSettleDetermined = false;
      
      storage.getHalfTimeResult = jest.fn().mockReturnValue({ checked: false });
      storage.getFullTimeResult = jest.fn().mockReturnValue({ checked: true });
      
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.markedRefundAllErrorMessage);
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should show selection error when mustRefundAll is true and FT is not checked', async () => {
      // Arrange
      match.matchDetail.eventStatus = EventStatus.postponed;
      match.matchDetail.isSettleDetermined = false;
      
      storage.getHalfTimeResult = jest.fn().mockReturnValue({ checked: true });
      storage.getFullTimeResult = jest.fn().mockReturnValue({ checked: false });
      
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.markedRefundAllErrorMessage);
      expect(superHandleSpy).not.toHaveBeenCalled();
    });

    it('should show selection error when mustRefundAll is true and both HT and FT are not checked', async () => {
      // Arrange
      match.matchDetail.isMarkedRefundAll = true;
      match.matchDetail.isSettleDetermined = false;
      
      storage.getHalfTimeResult = jest.fn().mockReturnValue({ checked: false });
      storage.getFullTimeResult = jest.fn().mockReturnValue({ checked: false });
      
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.markedRefundAllErrorMessage);
      expect(superHandleSpy).not.toHaveBeenCalled();
    });
  });

  describe('mustRefundAll logic', () => {
    it('should return true when eventStatus is postponed (case-insensitive)', async () => {
      // Arrange
      match.matchDetail.eventStatus = 'PoStPoNeD';
      match.matchDetail.isMarkedRefundAll = false;
      match.matchDetail.isSettleDetermined = false;
      
      storage.getHalfTimeResult = jest.fn().mockReturnValue({ checked: false });
      storage.getFullTimeResult = jest.fn().mockReturnValue({ checked: true });

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.markedRefundAllErrorMessage);
    });

    it('should return true when isMarkedRefundAll is true', async () => {
      // Arrange
      match.matchDetail.eventStatus = 'active';
      match.matchDetail.isMarkedRefundAll = true;
      match.matchDetail.isSettleDetermined = false;
      
      storage.getHalfTimeResult = jest.fn().mockReturnValue({ checked: false });
      storage.getFullTimeResult = jest.fn().mockReturnValue({ checked: true });

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.markedRefundAllErrorMessage);
    });

    it('should return false when eventStatus is not postponed and isMarkedRefundAll is false', async () => {
      // Arrange
      match.matchDetail.eventStatus = 'active';
      match.matchDetail.isMarkedRefundAll = false;
      
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });
  });

  describe('edge cases', () => {
    it('should handle empty eventStatus', async () => {
      // Arrange
      match.matchDetail.eventStatus = '';
      match.matchDetail.isMarkedRefundAll = false;
      
      const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalled();
      expect(superHandleSpy).toHaveBeenCalledWith(storage);
    });

    it('should handle undefined checked values', async () => {
      // Arrange
      match.matchDetail.isMarkedRefundAll = true;
      match.matchDetail.isSettleDetermined = false;
      
      storage.getHalfTimeResult = jest.fn().mockReturnValue({ checked: undefined });
      storage.getFullTimeResult = jest.fn().mockReturnValue({ checked: undefined });

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.markedRefundAllErrorMessage);
    });
  });
});
