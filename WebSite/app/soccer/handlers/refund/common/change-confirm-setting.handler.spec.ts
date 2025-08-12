import { TestBed } from '@angular/core/testing';
import { ChangeConfirmSettingHandler } from './change-confirm-setting.handler';
import { RefundStorage } from '../../../storage/refund.storage';
import { RefundBaseStorage } from '../../../storage/storage.service.native';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AioService } from '../../../../shared/services/aio.service';
import { LogicService } from '../../../components/sop-refund/services/logic.service';
import { Match, MatchDetailSoccer as MatchDetail } from '../../../components/calc/models/match.model';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { ResourceIds } from '../../../../shared/constants/resource-id.native';
import { ResultSettingType } from '../../../../shared/constants/result-setting.native';
import { ResourceItem, ResultSettingQuery } from '../../../../shared/models';


describe('ChangeConfirmSettingHandler', () => {
  let handler: ChangeConfirmSettingHandler;
  let storage: RefundBaseStorage;
  let aioService: AioService;
  let logicService: LogicService;

  const createMatchDetail = (overrides: Partial<MatchDetail> = {}): MatchDetail => ({
    matchId: 1001,
    sportType: 1,
    childMatchType: 0,
    applyGoalRecord: false,
    goalRecord: '',
    isSettleDetermined: false,
    ...overrides
  } as any);

  const match: Match = {
    matchDetail: createMatchDetail(),
    permission: new Permission(),
    ticketCounts: [],
    resultDetails: [],
    hedgeMatchDetail: null,
    fantasyMatch: undefined,
    childMatches: [],
    externalResults: [],
    originalResultDetail: [],
    oldMatchDetail: null,
    isClickOnCalculate: false,
    isScoreDirect: false
  };

  const createResult = (id: string, name: string, home: string, away: string, flags?: Partial<any>) => ({
    resourceId: id,
    resourceName: name,
    homeValue: home,
    awayValue: away,
    resultSettingData: {
      isHoldResult: false,
      isConfirmedRefund: false,
      isConfirmedRefundSdt: false,
      isConfirmedRefundMercy: false,
      iconHoldResult: '',
      ...flags
    }
  }) as any;

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      imports: [HttpClientModule, ToastrModule.forRoot()],
      providers: [
        ChangeConfirmSettingHandler,
        RefundStorage,
        ToastrService,
        AioService,
        LogicService
      ]
    });

    handler = TestBed.inject(ChangeConfirmSettingHandler);
    storage = TestBed.inject(RefundStorage);
    aioService = TestBed.inject(AioService);
    logicService = TestBed.inject(LogicService);

    // Arrange
    match.matchDetail = createMatchDetail();
    storage.getMatch = jest.fn().mockReturnValue(match);
    storage.getSelectedResource = jest.fn();
    (logicService.closePopupNotChanged as any) = jest.fn();
    (aioService.changeResultSetting as any) = jest.fn().mockResolvedValue(true);
  });

  it('should call confirmRefund when not settled and no SDT flags, and close popup', async () => {
    // Arrange
    const selected = [
      createResult('00', 'FT', '1', '0'),
      createResult('01', 'HT', '1', '0')
    ];
    (storage.getSelectedResource as jest.Mock).mockReturnValue(selected);

    // Act
    await handler.handle(storage);

    // Assert
    expect(aioService.changeResultSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        matchId: 1001,
        type: ResultSettingType.confirmRefund,
        isEnabled: true,
        resourceIds: '00,01',
        selectedResources: [
          expect.any(ResourceItem),
          expect.any(ResourceItem)
        ],
        sportType: 1,
        childMatchType: 0
      })
    );
    expect(logicService.closePopupNotChanged).toHaveBeenCalled();
  });

  it('should call confirmRefundSDT when match is settle determined', async () => {
    // Arrange
    match.matchDetail = createMatchDetail({ isSettleDetermined: true });
    (storage.getMatch as jest.Mock).mockReturnValue(match);
    const selected = [createResult('00', 'FT', '1', '0')];
    (storage.getSelectedResource as jest.Mock).mockReturnValue(selected);

    // Act
    await handler.handle(storage);

    // Assert
    expect(aioService.changeResultSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        type: ResultSettingType.confirmRefundSDT,
        isEnabled: true
      })
    );
    expect(logicService.closePopupNotChanged).toHaveBeenCalled();
  });

  it('should call confirmRefundSDT when any selected has isConfirmedRefundSdt flag', async () => {
    // Arrange
    const selected = [
      createResult('00', 'FT', '1', '0', { isConfirmedRefundSdt: true }),
      createResult('01', 'HT', '1', '0')
    ];
    (storage.getSelectedResource as jest.Mock).mockReturnValue(selected);

    // Act
    await handler.handle(storage);

    // Assert
    expect(aioService.changeResultSetting).toHaveBeenCalledWith(
      expect.objectContaining({ type: ResultSettingType.confirmRefundSDT, isEnabled: false })
    );
    expect(logicService.closePopupNotChanged).toHaveBeenCalled();
  });

  it('should include Goal Record when applyGoalRecord is true', async () => {
    // Arrange
    match.matchDetail = createMatchDetail({ applyGoalRecord: true, goalRecord: 'HAH' });
    (storage.getMatch as jest.Mock).mockReturnValue(match);
    const selected = [createResult('00', 'FT', '1', '0')];
    (storage.getSelectedResource as jest.Mock).mockReturnValue(selected);

    // Act
    await handler.handle(storage);

    // Assert
    const query = (aioService.changeResultSetting as jest.Mock).mock.calls[0][0] as ResultSettingQuery;
    expect(query.resourceIds).toBe('00,' + ResourceIds.goalRecord);
    expect(query.selectedResources).toEqual(
      expect.arrayContaining([
        expect.any(ResourceItem),
        expect.objectContaining({ resourceId: ResourceIds.goalRecord, homeValue: 'HAH' })
      ])
    );
  });

  it('should pass sportType and childMatchType into ResultSettingQuery', async () => {
    // Arrange
    match.matchDetail = createMatchDetail({ sportType: 99, childMatchType: 7 });
    (storage.getMatch as jest.Mock).mockReturnValue(match);
    const selected = [createResult('01', 'HT', '1', '0')];
    (storage.getSelectedResource as jest.Mock).mockReturnValue(selected);

    // Act
    await handler.handle(storage);

    // Assert
    const query = (aioService.changeResultSetting as jest.Mock).mock.calls[0][0] as ResultSettingQuery;
    expect(query.sportType).toBe(99);
    expect(query.childMatchType).toBe(7);
  });

  it('should not call aioService when no selected resources', async () => {
    // Arrange
    (storage.getSelectedResource as jest.Mock).mockReturnValue([]);

    // Act
    await handler.handle(storage);

    // Assert
    expect(aioService.changeResultSetting).not.toHaveBeenCalled();
    expect(logicService.closePopupNotChanged).toHaveBeenCalled();
  });
});
