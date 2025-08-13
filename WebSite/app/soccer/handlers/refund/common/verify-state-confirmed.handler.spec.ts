import { TestBed } from '@angular/core/testing';
import { VerifyStateConfirmedHandler } from './verify-state-confirmed.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Language } from '../../../../shared/language.native';
import { EventStatus, ResourceIds } from '../../../../shared/constants';

describe('VerifyStateConfirmedHandler', () => {
  let handler: VerifyStateConfirmedHandler;
  let storage: RefundBaseStorage;
  let nextHandler: { handle: jest.Mock };

  const createMatch = (overrides: any = {}) => ({
    matchDetail: {
      matchId: 1001,
      isMarkedRefundAll: false,
      isSettleDetermined: false,
      eventStatus: '',
      applyGoalRecord: false,
      goalRecord: '',
      ...overrides
    },
    externalResults: [] as any[]
  }) as any;

  const createSelected = (items: Array<{
    resourceId: string;
    homeValue: string;
    awayValue: string;
    isConfirmedRefund?: boolean;
    isConfirmedRefundSdt?: boolean;
  }>) => items.map(i => ({
    resourceId: i.resourceId,
    homeValue: i.homeValue,
    awayValue: i.awayValue,
    resultSettingData: {
      isConfirmedRefund: !!i.isConfirmedRefund,
      isConfirmedRefundSdt: !!i.isConfirmedRefundSdt
    }
  })) as any[];

  const createConfirmedExternal = (pairs: Array<{ resourceId: string; homeValue: string; awayValue: string }>) => ([{
    sourceId: 99,
    resultDetails: pairs.map(p => ({ resourceId: p.resourceId, homeValue: p.homeValue, awayValue: p.awayValue }))
  }]);

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [ToastrModule.forRoot()],
      providers: [
        VerifyStateConfirmedHandler,
        RefundStorage,
        ToastrService
      ]
    });

    handler = TestBed.inject(VerifyStateConfirmedHandler);
    storage = TestBed.inject(RefundStorage);

    // Default storage mocks
    (storage.getMatch as any) = jest.fn();
    (storage.getSelectedResource as any) = jest.fn();
    (storage.error as any) = jest.fn();

    // Chain next handler
    nextHandler = { handle: jest.fn() };
    handler.setNextHandler(nextHandler as any);
  });

  it('should bypass and call next when isMarkedRefundAll', async () => {
    // Arrange
    const match = createMatch({ isMarkedRefundAll: true });
    (storage.getMatch as jest.Mock).mockReturnValue(match);
    (storage.getSelectedResource as jest.Mock).mockReturnValue([]);

    // Act
    await handler.handle(storage);

    // Assert
    expect(nextHandler.handle).toHaveBeenCalledWith(storage);
    expect(storage.error).not.toHaveBeenCalled();
  });

  it('should bypass and call next when eventStatus is postponed', async () => {
    // Arrange
    const match = createMatch({ eventStatus: EventStatus.postponed });
    (storage.getMatch as jest.Mock).mockReturnValue(match);
    (storage.getSelectedResource as jest.Mock).mockReturnValue([]);

    // Act
    await handler.handle(storage);

    // Assert
    expect(nextHandler.handle).toHaveBeenCalledWith(storage);
    expect(storage.error).not.toHaveBeenCalled();
  });

  it('should show not confirmed error when any selected is not confirmed (both flags false)', async () => {
    // Arrange
    const match = createMatch();
    const selected = createSelected([
      { resourceId: '00', homeValue: '1', awayValue: '0', isConfirmedRefund: false, isConfirmedRefundSdt: false }
    ]);
    (storage.getMatch as jest.Mock).mockReturnValue(match);
    (storage.getSelectedResource as jest.Mock).mockReturnValue(selected);

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.refundResultNotConfirmed);
    expect(nextHandler.handle).not.toHaveBeenCalled();
  });

  it('should proceed when SDT confirmed, goal record valid, and scores match (isSettleDetermined=true)', async () => {
    // Arrange
    const match = createMatch({ isSettleDetermined: true, applyGoalRecord: true, goalRecord: 'HAH' });
    match.externalResults = createConfirmedExternal([
      { resourceId: '00', homeValue: '1', awayValue: '0' },
      { resourceId: ResourceIds.goalRecord, homeValue: 'HAH', awayValue: '' }
    ]);
    const selected = createSelected([
      { resourceId: '00', homeValue: '1', awayValue: '0', isConfirmedRefundSdt: true }
    ]);
    (storage.getMatch as jest.Mock).mockReturnValue(match);
    (storage.getSelectedResource as jest.Mock).mockReturnValue(selected);

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.error).not.toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalledWith(storage);
  });

  it('should alert SDT error when SDT confirmed but scores mismatch (isSettleDetermined=true)', async () => {
    // Arrange
    const match = createMatch({ isSettleDetermined: true, applyGoalRecord: true, goalRecord: 'HAH' });
    match.externalResults = createConfirmedExternal([
      { resourceId: '00', homeValue: '2', awayValue: '0' },
      { resourceId: ResourceIds.goalRecord, homeValue: 'HAH', awayValue: '' }
    ]);
    const selected = createSelected([
      { resourceId: '00', homeValue: '1', awayValue: '0', isConfirmedRefundSdt: true }
    ]);
    (storage.getMatch as jest.Mock).mockReturnValue(match);
    (storage.getSelectedResource as jest.Mock).mockReturnValue(selected);

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.sdtErrorMessage);
    expect(nextHandler.handle).not.toHaveBeenCalled();
  });

  it('should alert not confirmed when confirmed but goal record invalid (isSettleDetermined=false)', async () => {
    // Arrange
    const match = createMatch({ isSettleDetermined: false, applyGoalRecord: true, goalRecord: 'ABC' });
    match.externalResults = createConfirmedExternal([
      { resourceId: '00', homeValue: '1', awayValue: '0' },
      { resourceId: ResourceIds.goalRecord, homeValue: 'HAH', awayValue: '' }
    ]);
    const selected = createSelected([
      { resourceId: '00', homeValue: '1', awayValue: '0', isConfirmedRefund: true }
    ]);
    (storage.getMatch as jest.Mock).mockReturnValue(match);
    (storage.getSelectedResource as jest.Mock).mockReturnValue(selected);

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.error).toHaveBeenCalledWith(Language.confirmRefund.refundResultNotConfirmed);
    expect(nextHandler.handle).not.toHaveBeenCalled();
  });

  it('should proceed when confirmed and goal record passes (isSettleDetermined=false)', async () => {
    // Arrange
    const match = createMatch({ isSettleDetermined: false, applyGoalRecord: false });
    match.externalResults = createConfirmedExternal([
      { resourceId: '00', homeValue: '1', awayValue: '0' }
    ]);
    const selected = createSelected([
      { resourceId: '00', homeValue: '1', awayValue: '0', isConfirmedRefund: true }
    ]);
    (storage.getMatch as jest.Mock).mockReturnValue(match);
    (storage.getSelectedResource as jest.Mock).mockReturnValue(selected);

    // Act
    await handler.handle(storage);

    // Assert
    expect(storage.error).not.toHaveBeenCalled();
    expect(nextHandler.handle).toHaveBeenCalledWith(storage);
  });
});
