import { TestBed } from '@angular/core/testing';
import { RefundHandler } from './refund.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RequestService } from '../../../components/sop-refund/services/request.service';
import { LogicService } from '../../../components/sop-refund/services/logic.service';
import { CalculateAction } from '../../../../shared/constants';
import { Match, MatchDetail } from '../../../components/sop-refund/models/match.model';
import { RefundQuery } from '../../../components/sop-refund/models/query.model';

describe('RefundHandler', () => {
  let handler: RefundHandler;
  let storage: RefundBaseStorage;
  let requestService: RequestService;
  let logicService: LogicService;

  const createMatchDetail = (): MatchDetail => ({
    matchId: 123,
    applyHedgeMatch: false
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
        RefundHandler,
        RefundStorage,
        RequestService,
        LogicService,
        ToastrService
      ]
    });

    handler = TestBed.inject(RefundHandler);
    storage = TestBed.inject(RefundStorage);
    requestService = TestBed.inject(RequestService);
    logicService = TestBed.inject(LogicService);

    // Reset match to default state
    match.matchDetail = createMatchDetail();

    // Mock storage methods
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getIsDeterminedHedgeMatch = jest.fn().mockReturnValue(false);
    storage.error = jest.fn();

    // Mock services
    requestService.refundMatch = jest.fn();
    requestService.alertMessageToLetstalkForFastMarket = jest.fn();
    logicService.getActionName = jest.fn().mockReturnValue(CalculateAction.refund);
    logicService.closePopup = jest.fn();
  });

  describe('handle method', () => {
    it('should close popup on successful refund', async () => {
      // Arrange
      requestService.refundMatch = jest.fn().mockResolvedValue({ isSuccessful: true });
      requestService.alertMessageToLetstalkForFastMarket = jest.fn().mockResolvedValue({});

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.refundMatch).toHaveBeenCalledWith(expect.any(RefundQuery));
      expect(logicService.closePopup).toHaveBeenCalled();
      expect(storage.error).not.toHaveBeenCalled();
    });

    it('should show error message on failed refund', async () => {
      // Arrange
      const errorMessage = 'Refund failed';
      requestService.refundMatch = jest.fn().mockResolvedValue({ isSuccessful: false, errMsg: errorMessage });

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.refundMatch).toHaveBeenCalledWith(expect.any(RefundQuery));
      expect(storage.error).toHaveBeenCalledWith(errorMessage);
      expect(logicService.closePopup).not.toHaveBeenCalled();
    });

    it('should set isApplyHedging to true when applyHedgeMatch is true', async () => {
      // Arrange
      match.matchDetail.applyHedgeMatch = true;
      match.hedgeMatchDetail = { id: 456 } as any;
      requestService.refundMatch = jest.fn().mockResolvedValue({ isSuccessful: true });

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.refundMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          isApplyHedging: true
        })
      );
    });

    it('should set isApplyHedging to false when applyHedgeMatch is false', async () => {
      // Arrange
      match.matchDetail.applyHedgeMatch = false;
      match.hedgeMatchDetail = { id: 456 } as any;
      requestService.refundMatch = jest.fn().mockResolvedValue({ isSuccessful: true });

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.refundMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          isApplyHedging: false
        })
      );
    });
  });

  describe('alertMessageToLetsTalkForFastMarket', () => {
    it('should call alertMessageToLetstalkForFastMarket for refund action', async () => {
      // Arrange
      logicService.getActionName = jest.fn().mockReturnValue(CalculateAction.refund);
      requestService.refundMatch = jest.fn().mockResolvedValue({ isSuccessful: true });

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.alertMessageToLetstalkForFastMarket).toHaveBeenCalledWith(
        match.matchDetail.matchId,
        CalculateAction.refund
      );
    });

    it('should call alertMessageToLetstalkForFastMarket for refundFullTime action', async () => {
      // Arrange
      logicService.getActionName = jest.fn().mockReturnValue(CalculateAction.refundFullTime);
      requestService.refundMatch = jest.fn().mockResolvedValue({ isSuccessful: true });

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.alertMessageToLetstalkForFastMarket).toHaveBeenCalledWith(
        match.matchDetail.matchId,
        CalculateAction.refundFullTime
      );
    });

    it('should not call alertMessageToLetstalkForFastMarket for other actions', async () => {
      // Arrange
      logicService.getActionName = jest.fn().mockReturnValue(CalculateAction.refundHalfTime);
      requestService.refundMatch = jest.fn().mockResolvedValue({ isSuccessful: true });

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.alertMessageToLetstalkForFastMarket).not.toHaveBeenCalled();
    });

    it('should not call alertMessageToLetstalkForFastMarket on refund failure', async () => {
      // Arrange
      logicService.getActionName = jest.fn().mockReturnValue(CalculateAction.refund);
      requestService.refundMatch = jest.fn().mockResolvedValue({ isSuccessful: false, errMsg: 'Failed' });

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.alertMessageToLetstalkForFastMarket).not.toHaveBeenCalled();
    });
  });

  describe('query construction', () => {
    it('should construct RefundQuery with correct parameters', async () => {
      // Arrange
      match.matchDetail.applyHedgeMatch = true;
      match.hedgeMatchDetail = { id: 456 } as any;
      match.betDaq = { id: 789 } as any;
      match.betFair = { id: 101 } as any;
      storage.getIsDeterminedHedgeMatch = jest.fn().mockReturnValue(true);
      logicService.getActionName = jest.fn().mockReturnValue(CalculateAction.refund);
      requestService.refundMatch = jest.fn().mockResolvedValue({ isSuccessful: true });

      // Act
      await handler.handle(storage);

      // Assert
      expect(requestService.refundMatch).toHaveBeenCalledWith(
        expect.objectContaining({
          actionName: CalculateAction.refund,
          isApplyHedging: true,
          isDeterminedHedgeMatch: true,
          matchId: 123
        })
      );
    });
  });
});
