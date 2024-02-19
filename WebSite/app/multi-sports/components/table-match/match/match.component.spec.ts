import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync, flush } from '@angular/core/testing';
import {
  MatchComponent,
} from '../..';
import {
  MultiSport,
  SportMatch,
  LeagueMatch,
  Match,
  MatchRequest
} from '../../../models';
import { RefreshMatchService, MultiSportService, PopupService, HandleActionsService, DetectChangesService, BackGroundService, SportMatchService } from '../../../services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { HttpRequestService, BlockUIService, MessageBoxService, DialogBoxService } from '../../../../shared/services';
import { MaterialModule } from '../../../../shared/material-module';
import { IntervalScorePipe } from '../../../../shared/pipes/interval-score.pipe';
import {
  Score,
  AutoSetting
} from '../../../../shared/models';
import { CalculationStatus, SportType } from '../../../../shared/constants';
import { Permission } from '../../../../shared/models/sportsbook-sop/permission.model';
import { ModalDialogComponent } from '../../../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../../../shared/components/modal-dialog/modal-content-dialog.component';
import { MultiSportsStore } from '../../../services/multi-sports.store';
import { MatchStateService } from '../../../services/match-state.service';

describe('matchComponent', () => {
  let component: MatchComponent;
  let fixture: ComponentFixture<MatchComponent>;
  let popupService: PopupService;
  let multiSportService: MultiSportService;
  let store: MultiSportsStore;
  let refreshMatchService: RefreshMatchService;
  let messageBoxService: MessageBoxService;
  let match = new Match();
  match.sportType = SportType.eSports;
  match.autoCalcSetting = new AutoSetting();
  const league: LeagueMatch = {
    leagueId: 7000000,
    matches: [match],
    name: 'mock league',
    collapse: false,
    autoWaitingTime: 0,
    autoCalcSetting: new AutoSetting(),
    sportType: 0,
    autoRetryTime: 0
  };

  const sport: SportMatch = {
    id: 100000,
    name: 'mock sport',
    leagues: [league],
    collapse: false,
  };

  let permission = new Permission();
  const multiSport: MultiSport = {
    permission,
    sports: [sport],
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
        NgbModal,
        HttpRequestService,
        BlockUIService,
        DialogBoxService,
        PopupService,
        DetectChangesService,
        SportMatchService,
        SportMatchService,
        MessageBoxService,
        HandleActionsService,
        MultiSportService,
        MatchStateService,
        IntervalScorePipe,
        RefreshMatchService,
        BackGroundService
      ],
      imports: [
        HttpClientModule,
        MaterialModule,
        MatchComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
        IntervalScorePipe,
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatchComponent);
    component = fixture.componentInstance;
    popupService = fixture.debugElement.injector.get(PopupService);
    store = fixture.debugElement.injector.get(MultiSportsStore);
    multiSportService = fixture.debugElement.injector.get(MultiSportService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    refreshMatchService = fixture.debugElement.injector.get(RefreshMatchService);
    store.setState(multiSport);
    match = new Match();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getLog - should call popupService when called', () => {
    store.request = new MatchRequest('', '', '', '', '', '')
    popupService.popupLog = jest.fn();
    component.match = match;

    component.getLog();

    expect(popupService.popupLog).toHaveBeenCalled();
  });


  it('popupCalc - should call popupService when called', () => {
    popupService.popupCalc = jest.fn();
    component.match = match;

    component.popupCalc();

    expect(popupService.popupCalc).toHaveBeenCalled();
  });

  it('popupRefund - should call popupService', () => {
    popupService.popupRefund = jest.fn();
    component.match = match;

    component.popupRefund();

    expect(popupService.popupRefund).toHaveBeenCalled();
  });

  it('popupEarly - should call popupService', () => {
    popupService.popupEarly = jest.fn();
    component.match = match;

    component.popupEarly();

    expect(popupService.popupEarly).toHaveBeenCalled();
  });
  describe('isChangeSetting', () => {
    it('should return true when having permission and match is not calculating', () => {
      match.isCalculatingSingle = null;
      match.isCalculatingMP = null;
      component.match = match;

      const result = component.isChangeSetting();

      expect(result).toBe(true);
    });

    describe('should return false', () => {
      beforeEach(() => {
        match.isCalculatingSingle = null;
      });

      it('when match is calculating single', () => {
        match.isCalculatingSingle = 1;
        component.match = match;

        const result = component.isChangeSetting();

        expect(result).toBe(false);
      });

      it('when match is waiting for single calculation', () => {
        match.isCalculatingSingle = 0;
        component.match = match;

        const result = component.isChangeSetting();

        expect(result).toBe(false);
      });

      it('when match is calculating MP', () => {
        match.isCalculatingMP = 1;
        component.match = match;

        const result = component.isChangeSetting();

        expect(result).toBe(false);
      });

      it('when match is waiting for MP calculation', () => {
        match.isCalculatingMP = 0;
        component.match = match;

        const result = component.isChangeSetting();

        expect(result).toBe(false);
      });
    });
  });

  describe('popupChangeRemarkSetting', () => {
    it('should call popupService when match is not locked', () => {
      match.isCalculatingSingle = 3;
      match.isCalculatingMP = 3;
      popupService.popupChangeRemark = jest.fn();
      component.match = match;

      component.popupChangeRemarkSetting();

      expect(popupService.popupChangeRemark).toHaveBeenCalled();
    });

    it('should not call popup service when match is locked', () => {
      match.isCalculatingSingle = 0;
      popupService.popupChangeRemark = jest.fn();
      component.match = match;

      component.popupChangeRemarkSetting();

      expect(popupService.popupChangeRemark).toHaveBeenCalledTimes(0);
    });
  });

  describe('changeAutoSetting', () => {
    it('should do nothing when not having permission', () => {
      permission.canAutoPayout = false;
      store.state.permission = permission;
      popupService.openUpdatePayoutForMatch = jest.fn();

      component.changeAutoSetting();

      expect(popupService.openUpdatePayoutForMatch).not.toHaveBeenCalled();
    });

    it('should update popup change setting when has permission', () => {
      permission.canAutoPayout = true;
      store.state.permission = permission;
      popupService.openUpdatePayoutForMatch = jest.fn();

      component.changeAutoSetting();

      expect(popupService.openUpdatePayoutForMatch).toHaveBeenCalled();
    });
  });

  describe('getInterval', () => {
    it('return all interval when match not bom 30', () => {
      match.bestOfMap = 5;
      match.intervalScore = [new Score('1', '1', '')];
      component.match = match;

      const result = component.getInterval();

      expect(result.length).toEqual(1);
    });

    it('return nine result when match is bom 30', () => {
      match.bestOfMap = 11;
      match.sportType = SportType.eSports;
      const score = new Score('1', '1', '');
      match.intervalScore = []
      for (let i = 0; i < 11; i++) {
        match.intervalScore.push(score);
      }
      component.match = match;

      const result = component.getInterval();

      expect(result.length).toEqual(9);
    });
  });

  describe('updateInstant', () => {
    it('should call update instant when match pass validation', fakeAsync(() => {
      store.state.permission.canAutoPayout = true;
      match.isCalculatingSingle = CalculationStatus.success;
      match.autoCalcSetting = new AutoSetting();
      match.autoCalcSetting.isInstantForMatch = false;
      component.match = match
      multiSportService.updateSettingMatch = jest.fn().mockReturnValue(Promise.resolve(mockResultSuccess));
      refreshMatchService.refreshMatch = jest.fn();

      component.updateInstant();
      tick();
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.match.autoCalcSetting.isInstantForMatch).toBeTruthy();
      expect(refreshMatchService.refreshMatch).toHaveBeenCalled();
      expect(multiSportService.updateSettingMatch).toHaveBeenCalled();
    }));

    it('should alert when update failed', fakeAsync(() => {
      store.state.permission.canAutoPayout = true;
      match.isCalculatingSingle = CalculationStatus.success;
      match.autoCalcSetting = new AutoSetting();
      match.autoCalcSetting.isInstantForMatch = false;
      jest.spyOn(multiSportService, 'updateSettingMatch').mockReturnValue(Promise.resolve(mockResultFailed));
      jest.spyOn(messageBoxService, 'alert');

      component.updateInstant();
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.match.autoCalcSetting.isInstantForMatch).toBeFalsy();
      expect(messageBoxService.alert).toHaveBeenCalled();
    }));
  });
});
