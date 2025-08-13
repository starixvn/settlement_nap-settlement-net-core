import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from "@angular/core/testing";
import { LeagueComponent } from "./league.component";
import { MultiSportsStore } from "../../../services/multi-sports.store";
import { BackGroundService, DetectChangesService, HandleActionsService, MultiSportService, PopupService, RefreshMatchService } from "../../../services";
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService } from "../../../../shared/services";
import { HttpClientModule } from "@angular/common/http";
import { Permission } from "../../../models/permission.model";
import { AutoSetting } from "../../../../shared/models";
import { AutoCalcSetting, LeagueMatch, MultiSport } from "../../../models";
import { MatDialogModule } from "@angular/material/dialog";
import { MatchStateService } from "../../../services/match-state.service";
import { IntervalScorePipe } from "../../../../shared/pipes/interval-score.pipe";
import * as exp from "constants";
import { SportNewAutoPayout } from "../../../constants/sport-instant";

describe('LeagueComponent', () => {
  let component: LeagueComponent;
  let fixture: ComponentFixture<LeagueComponent>;
  let store: MultiSportsStore;
  let popupService: PopupService;
  let multiSportService: MultiSportService;
  let handleActionsService: HandleActionsService;
  let messageBoxService: MessageBoxService;
  let permission = new Permission();

  const autoSetting = new AutoSetting();
  const league: LeagueMatch = {
    leagueId: 7000000,
    matches: [],
    name: 'mock league',
    collapse: false,
    autoCalcSetting: autoSetting,
    sportType: 0,
    autoWaitingTime: 0,
    autoRetryTime: 0,
    autoMainWaitingTime: 0,
    autoEarlyWaitingTime: 0,
    refundWaitingTime: 0,
    apGroup: null
  };

  const mockResultSuccess = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
    childMatchIds: ""
  };

  const mockResultFailed = {
    errCode: 1,
    errMsg: "error",
    isSuccessful: true,
    childMatchIds: ""
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        MultiSportService,
        HandleActionsService,
        MessageBoxService,
        PopupService,
        HttpRequestService,
        BlockUIService,
        DialogBoxService,
        RefreshMatchService,
        DetectChangesService,
        MatchStateService,
        IntervalScorePipe,
        BackGroundService
      ],
      imports: [
        LeagueComponent,
        HttpClientModule,
        MatDialogModule
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeagueComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(MultiSportsStore);
    popupService = fixture.debugElement.injector.get(PopupService);
    multiSportService = fixture.debugElement.injector.get(MultiSportService);
    handleActionsService = fixture.debugElement.injector.get(HandleActionsService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    component.ngOnInit();
    component.league = league;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('onInit - should take value from observable', () => {
    store.setState(new MultiSport());

    component.ngOnInit();

    permission.canCalculate = true;
    store.setState({ ...store.state, permission: permission });

    expect(component.permission.canCalculate).toBeTruthy();
  });

  describe('changeAutoLeague', () => {
    it('should do nothing when not having permission', () => {
      permission.canAutoPayout = false;
      component.permission = permission;
      popupService.openUpdatePayoutForLeague = jest.fn();

      component.changeAutoLeague();

      expect(popupService.openUpdatePayoutForLeague).not.toHaveBeenCalled();
    });

    it('should update popup change setting when has permission', () => {
      permission.canAutoPayout = true;
      component.permission = permission;
      popupService.openUpdatePayoutForLeague = jest.fn();

      component.changeAutoLeague();

      expect(popupService.openUpdatePayoutForLeague).toHaveBeenCalled();
    });
  });

  describe('updateInstantForLeague', () => {
    it('should apply status for all match when select confirm yes', async () => {
      const setting = new AutoSetting();
      component.league.autoCalcSetting = setting;
      multiSportService.updateSettingLeague = jest.fn().mockReturnValue(Promise.resolve(mockResultSuccess));
      handleActionsService.handleAutoInstantForMatch = jest.fn();

      component.updateInstantForLeague();
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(setting.isInstantForLeague).toBeTruthy();
      expect(handleActionsService.handleAutoInstantForMatch).toHaveBeenCalled();

    });

    it('should not apply status for all match when select confirm no', async () => {
      const setting = new AutoSetting();
      setting.isInstantForLeague = true;
      component.league.autoCalcSetting = setting;
      multiSportService.updateSettingLeague = jest.fn().mockReturnValue(Promise.resolve(mockResultSuccess));
      handleActionsService.handleAutoInstantForMatch = jest.fn();

      await component.updateInstantForLeague();
      const buttonNo = document.getElementsByClassName('btn-light')[0] as HTMLElement;
      buttonNo.click();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(setting.isInstantForLeague).toBeFalsy();
      expect(handleActionsService.handleAutoInstantForMatch).not.toHaveBeenCalled();

    });

    it('should alert when update failed', async () => {
      const setting = new AutoSetting();
      setting.isInstantForLeague = true;
      component.league.autoCalcSetting = setting;
      multiSportService.updateSettingLeague = jest.fn().mockReturnValue(Promise.resolve(mockResultFailed));
      messageBoxService.alert = jest.fn();

      component.updateInstantForLeague();

      const buttonNo = document.getElementsByClassName('btn-light')[0] as HTMLElement;
      buttonNo.click();
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(setting.isInstantForLeague).toBeTruthy();
      expect(messageBoxService.alert).toHaveBeenCalled();

    });
  });

  it('collapseLeague - should change state of league', () => {
    component.league.collapse = false;

    component.collapseLeague();

    expect(component.league.collapse).toBeTruthy();
  });

  describe('openUpdateTime', () => {
    it('Do not do anything when not exist permission', () => {
      component.permission = new Permission();
      popupService.openUpdateTime = jest.fn();

      component.openUpdateTime();

      expect(popupService.openUpdateTime).not.toHaveBeenCalled()
    });

    it('Open popup when exist permission', () => {
      component.permission = new Permission();
      component.permission.canAutoPayout = true;
      popupService.openUpdateTime = jest.fn();

      component.openUpdateTime();

      expect(popupService.openUpdateTime).toHaveBeenCalled()
    });
  });


  describe('changeAutoLeague', () => {
    it('Do not do anything when not exist permission', () => {
      component.permission = new Permission();
      popupService.openUpdateNewPayoutForLeague = jest.fn();
      popupService.openUpdatePayoutForLeague = jest.fn();

      component.changeAutoLeague();

      expect(popupService.openUpdateNewPayoutForLeague).not.toHaveBeenCalled()
      expect(popupService.openUpdatePayoutForLeague).not.toHaveBeenCalled()
    });

    it('Open new popup when exist permission and sport supported', () => {
      component.permission = new Permission();
      component.permission.canAutoPayout = true;
      component.league = { ...league, apGroup: 1 };
      popupService.openAutoSettleSetting = jest.fn();
      popupService.openUpdatePayoutForLeague = jest.fn();

      component.changeAutoLeague();

      expect(popupService.openAutoSettleSetting).toHaveBeenCalled()
      expect(popupService.openUpdatePayoutForLeague).not.toHaveBeenCalled()
    });

    it('Open old popup when exist permission and sport not supported', () => {
      component.permission = new Permission();
      component.permission.canAutoPayout = true;
      component.league = { ...league, sportType: -1 };
      popupService.openUpdateNewPayoutForLeague = jest.fn();
      popupService.openUpdatePayoutForLeague = jest.fn();

      component.changeAutoLeague();

      expect(popupService.openUpdateNewPayoutForLeague).not.toHaveBeenCalled()
      expect(popupService.openUpdatePayoutForLeague).toHaveBeenCalled()
    });
  });

  it.each([
    [true, true, "BOTH"],
    [true, false, "AUTO"],
    [false, true, "DIRECT"],
    [false, false, "OFF"],
  ])('Return correct status with Auto is %p and Direct is %s', (auto: boolean, direct: boolean, expected: string) => {
     component.league.autoCalcSetting.isAutoPayoutForLeague = auto;
     component.league.autoCalcSetting.isDirectPayoutForLeague = direct;

     const actual = component.getAutoSettingLeague();

     expect(actual).toEqual(expected)
  })
});