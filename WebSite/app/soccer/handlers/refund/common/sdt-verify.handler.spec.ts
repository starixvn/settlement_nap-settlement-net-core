import { TestBed } from '@angular/core/testing';
import { SdtVerifyHandler } from './sdt-verify.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { ResultStatusId, SettlementStatusId, TicketStatusText } from '../../../../shared/constants';
import { ResultDetail } from '../../../models';
import { Language } from '../../../../shared/language.native';
import { ToastrModule, ToastrService } from 'ngx-toastr';

describe('SdtVerifyHandler', () => {
  let handler: SdtVerifyHandler;
  let storage: RefundBaseStorage;
  let nextHandler: any;

  const createMatchDetail = () => ({
    isSettleDetermined: false
  } as any);

  const createHalfTimeResult = (): ResultDetail => ({
    checked: false,
    ticketStatus: TicketStatusText.noTicket,
    settlementStatusId: SettlementStatusId.Running,
    resultStatusId: ResultStatusId.AutoCompleted
  } as any);

  const createFullTimeResult = (): ResultDetail => ({
    checked: false
  } as any);

  const match = {
    matchDetail: createMatchDetail()
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot()],
      providers: [
        SdtVerifyHandler,
        RefundStorage,
        ToastrService
      ]
    });

    handler = TestBed.inject(SdtVerifyHandler);
    storage = TestBed.inject(RefundStorage);

    // Mock storage methods
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getHalfTimeResult = jest.fn().mockReturnValue(createHalfTimeResult());
    storage.getFullTimeResult = jest.fn().mockReturnValue(createFullTimeResult());
    storage.error = jest.fn();

    // Mock next handler and chain
    nextHandler = { handle: jest.fn() };
    handler.setNextHandler(nextHandler);
  });

  describe('handle method', () => {
    it('should call next handler when isSettleDetermined is false', async () => {
      // Arrange
      match.matchDetail.isSettleDetermined = false;

      // Act
      await handler.handle(storage);

      // Assert
      expect(nextHandler.handle).toHaveBeenCalledWith(storage);
      expect(storage.error).not.toHaveBeenCalled();
    });

    it('should show SDT half-time error when HT checked but FT not checked', async () => {
      // Arrange
      match.matchDetail.isSettleDetermined = true;
      const halfTime = createHalfTimeResult();
      const fullTime = createFullTimeResult();
      halfTime.checked = true;
      fullTime.checked = false;
      storage.getHalfTimeResult = jest.fn().mockReturnValue(halfTime);
      storage.getFullTimeResult = jest.fn().mockReturnValue(fullTime);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.sdtHalfTimeErrorMessage);
      expect(nextHandler.handle).not.toHaveBeenCalled();
    });

    it('should show SDT full-time error when HT has tickets, is running, not checked, but FT is checked', async () => {
      // Arrange
      match.matchDetail.isSettleDetermined = true;
      const halfTime = createHalfTimeResult();
      const fullTime = createFullTimeResult();
      halfTime.ticketStatus = TicketStatusText.running;
      halfTime.resultStatusId = ResultStatusId.RunningOne;
      halfTime.checked = false;
      fullTime.checked = true;
      storage.getHalfTimeResult = jest.fn().mockReturnValue(halfTime);
      storage.getFullTimeResult = jest.fn().mockReturnValue(fullTime);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.sdtFullTimeErrorMessage);
      expect(nextHandler.handle).not.toHaveBeenCalled();
    });

    it('should show SDT half-time abandoned error when HT is abandoned and not checked', async () => {
      // Arrange
      match.matchDetail.isSettleDetermined = true;
      const halfTime = createHalfTimeResult();
      halfTime.settlementStatusId = SettlementStatusId.Abandoned1H;
      halfTime.checked = false;
      storage.getHalfTimeResult = jest.fn().mockReturnValue(halfTime);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.sdtHalfTimeAbandonedErrorMessage);
      expect(nextHandler.handle).not.toHaveBeenCalled();
    });

    it('should call next handler when all validations pass', async () => {
      // Arrange
      match.matchDetail.isSettleDetermined = true;
      const halfTime = createHalfTimeResult();
      const fullTime = createFullTimeResult();
      halfTime.checked = true;
      fullTime.checked = true;
      storage.getHalfTimeResult = jest.fn().mockReturnValue(halfTime);
      storage.getFullTimeResult = jest.fn().mockReturnValue(fullTime);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalled();
      expect(nextHandler.handle).toHaveBeenCalledWith(storage);
    });

    it('should not show SDT full-time error when HT has no tickets', async () => {
      // Arrange
      match.matchDetail.isSettleDetermined = true;
      const halfTime = createHalfTimeResult();
      const fullTime = createFullTimeResult();
      halfTime.ticketStatus = TicketStatusText.noTicket;
      halfTime.resultStatusId = ResultStatusId.RunningOne;
      halfTime.checked = false;
      fullTime.checked = true;
      storage.getHalfTimeResult = jest.fn().mockReturnValue(halfTime);
      storage.getFullTimeResult = jest.fn().mockReturnValue(fullTime);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalled();
      expect(nextHandler.handle).toHaveBeenCalledWith(storage);
    });

    it('should not show SDT full-time error when HT is not running', async () => {
      // Arrange
      match.matchDetail.isSettleDetermined = true;
      const halfTime = createHalfTimeResult();
      const fullTime = createFullTimeResult();
      halfTime.ticketStatus = TicketStatusText.running;
      halfTime.resultStatusId = ResultStatusId.AutoCompleted;
      halfTime.checked = false;
      fullTime.checked = true;
      storage.getHalfTimeResult = jest.fn().mockReturnValue(halfTime);
      storage.getFullTimeResult = jest.fn().mockReturnValue(fullTime);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalled();
      expect(nextHandler.handle).toHaveBeenCalledWith(storage);
    });

    it('should not show SDT full-time error when HT is checked', async () => {
      // Arrange
      match.matchDetail.isSettleDetermined = true;
      const halfTime = createHalfTimeResult();
      const fullTime = createFullTimeResult();
      halfTime.ticketStatus = TicketStatusText.running;
      halfTime.resultStatusId = ResultStatusId.RunningOne;
      halfTime.checked = true;
      fullTime.checked = true;
      storage.getHalfTimeResult = jest.fn().mockReturnValue(halfTime);
      storage.getFullTimeResult = jest.fn().mockReturnValue(fullTime);

      // Act
      await handler.handle(storage);

      // Assert
      expect(storage.error).not.toHaveBeenCalled();
      expect(nextHandler.handle).toHaveBeenCalledWith(storage);
    });
  });
});
