import { TestBed } from '@angular/core/testing';
import { ConfirmBoxHandler } from './confirm-box.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { LogicService } from '../../../components/sop-refund/services/logic.service';
import { CalculateAction } from '../../../../shared/constants';
import { Language } from '../../../../shared/language.native';
import { Match } from '../../../components/sop-refund/models/match.model';
import { AbstractHandler } from '../../abstract.handler.native';


describe('ConfirmBoxHandler', () => {
  let handler: ConfirmBoxHandler;
  let storage: RefundBaseStorage;
  let logicService: LogicService;

  const createMatch = (overrides: Partial<Match> = {}): Match => ({
    matchDetail: {
      isSettleAbandonedMatchIBC: false,
      finalAwayScore: undefined,
      finalHomeScore: undefined,
      halfTimeAwayScore: undefined,
      halfTimeHomeScore: undefined,
      isCalRefund: false,
      isSettleDetermined: false,
      isMarkedRefundAll: false,
      applyHedgeMatch: false,
      ...overrides.matchDetail
    } as any,
    betDaq: { settleDeterminedBetDaq: false } as any,
    betFair: { settleDeterminedBetFair: false } as any,
    hedgeMatchDetail: null as any,
    externalResults: [],
    resultDetails: [],
    permission: {} as any,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        ConfirmBoxHandler,
        RefundStorage,
        LogicService,
        ToastrService
      ]
    });

    handler = TestBed.inject(ConfirmBoxHandler);
    storage = TestBed.inject(RefundStorage);
    logicService = TestBed.inject(LogicService);

    // Arrange
    const match = createMatch();
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.setConfirmMessage = jest.fn();
    storage.getHalfTimeResult = jest.fn();
    storage.getFullTimeResult = jest.fn();

    // Default: showConfirmMessage executes the provided callback immediately
    jest.spyOn(logicService, 'showConfirmMessage').mockImplementation((fn: () => void) => fn());
    jest.spyOn(logicService, 'getActionName').mockReturnValue(CalculateAction.refund);
  });

  it('should set confirm message for refund (normal) and nullify scores when not abandoned', () => {
    // Arrange
    const match = storage.getMatch() as Match;
    match.matchDetail.isSettleAbandonedMatchIBC = false;
    jest.spyOn(logicService, 'getActionName').mockReturnValue(CalculateAction.refund);

    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.soccer.refundAllNormal);
    expect(logicService.showConfirmMessage).toHaveBeenCalled();
    expect(match.matchDetail.halfTimeHomeScore).toBeNull();
    expect(match.matchDetail.halfTimeAwayScore).toBeNull();
    expect(match.matchDetail.finalHomeScore).toBeNull();
    expect(match.matchDetail.finalAwayScore).toBeNull();
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should set confirm message for refund (abandoned) and map HT scores when abandoned and action refund', () => {
    // Arrange
    const match = storage.getMatch() as Match;
    match.matchDetail.isSettleAbandonedMatchIBC = true;
    jest.spyOn(logicService, 'getActionName').mockReturnValue(CalculateAction.refund);
    (storage.getHalfTimeResult as jest.Mock).mockReturnValue({ homeValue: '1', awayValue: '2' });

    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.soccer.refundAllAbandoned);
    expect(match.matchDetail.halfTimeHomeScore).toBe('1');
    expect(match.matchDetail.halfTimeAwayScore).toBe('2');
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should set confirm message for refundFullTime (abandoned source) and map FT scores', () => {
    // Arrange
    const match = storage.getMatch() as Match;
    match.matchDetail.isSettleAbandonedMatchIBC = true;
    jest.spyOn(logicService, 'getActionName').mockReturnValue(CalculateAction.refundFullTime);
    storage.getFullTimeResult = jest.fn().mockReturnValue({ homeValue: '3', awayValue: '4' });

    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.soccer.refundFullTimeAbandoned);
    expect(match.matchDetail.finalHomeScore).toBe('3');
    expect(match.matchDetail.finalAwayScore).toBe('4');
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should set confirm message for refundFullTime (normal) and nullify scores when not abandoned', () => {
    // Arrange
    const match = storage.getMatch() as Match;
    match.matchDetail.isSettleAbandonedMatchIBC = false;
    jest.spyOn(logicService, 'getActionName').mockReturnValue(CalculateAction.refundFullTime);

    const superHandleSpy = jest.spyOn(AbstractHandler.prototype, 'handle');

    // Act
    handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.soccer.refundFullTimeNormalNotSdt);
    expect(match.matchDetail.halfTimeHomeScore).toBeNull();
    expect(match.matchDetail.halfTimeAwayScore).toBeNull();
    expect(match.matchDetail.finalHomeScore).toBeNull();
    expect(match.matchDetail.finalAwayScore).toBeNull();
    expect(superHandleSpy).toHaveBeenCalledWith(storage);
  });

  it('should set confirm message for refundHalfTime and force isSettleAbandonedMatchIBC = false', () => {
    // Arrange
    const match = storage.getMatch() as Match;
    match.matchDetail.isSettleAbandonedMatchIBC = true; // will be reset in getMessageConfirm default branch
    jest.spyOn(logicService, 'getActionName').mockReturnValue(CalculateAction.refundHalfTime);

    // Act
    handler.handle(storage);

    // Assert
    expect(storage.setConfirmMessage).toHaveBeenCalledWith(Language.soccer.refundHalfTime);
    expect(match.matchDetail.isSettleAbandonedMatchIBC).toBe(false);
  });
});
