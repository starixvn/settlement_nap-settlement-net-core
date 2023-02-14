import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, tick, fakeAsync, flush } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { CalculateService, OutrightService } from '../../services';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { LeagueSettle, Permission, ResultOutright, Team } from '../../models';
import { UncalculatePopupComponent } from './uncalculate-popup.component';
import * as _ from "lodash";

describe('UncalculatePopupComponent', () => {
  let component: UncalculatePopupComponent;
  let fixture: ComponentFixture<UncalculatePopupComponent>;
  let outrightService: OutrightService;
  let toastrService: ToastrService;

  const team: Team = {
    isDeadheat: false,
    disableDeadheat: false,
    isSettled: false,
    selected: false,
    eventDate: '',
    dateTime: undefined,
    oddsStatus: '',
    orId: '1',
    matchCode: '',
    kickOffTime: undefined,
    sportType: 0,
    status: '',
    leagueId: 0,
    leagueName: '',
    teamId: 100,
    teamName: '',
    betCount: 0
  }
  const leagueSettle: LeagueSettle = {
    leagueName: '',
    sportName: '',
    teams: [team],
    permission: new Permission(),
    moveBetsDay: '',
    today: ''
  };

  const dialogMock = {
    close: (value?: any) => { }
  };

  const buttonName = "btn-danger";

  const ResultSuccessful: ResultOutright = {
    errCode: 0,
    errMsg: '',
    teamFailedIds: '',
    resultCommand: [],
    isSuccessful: true,
    childMatchIds: ''
  };

  const ResultFailed: ResultOutright = {
    errCode: 1,
    errMsg: 'mock error',
    teamFailedIds: '',
    resultCommand: [],
    isSuccessful: false,
    childMatchIds: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        UncalculatePopupComponent,
        CommonModule,
        FormsModule,
        MatDialogModule,
        DragDropModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot(),
        HttpClientModule
      ],
      providers: [
        OutrightService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        CalculateService,
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ToastrService, useClass: ToastrService },
        ToastContainerDirective
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UncalculatePopupComponent);
    component = fixture.componentInstance;
    outrightService = fixture.debugElement.injector.get(OutrightService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    fixture.detectChanges();
    component.leagueSettle = leagueSettle;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - should GetMatches', () => {
    leagueSettle.teams = [team];
    jest.spyOn(outrightService, 'getMatches').mockReturnValue(Promise.resolve(leagueSettle));

    component.ngOnInit();

    expect(outrightService.getMatches).toHaveBeenCalled();
    expect(component.teams).toEqual([team]);
  });

  it('clearError - should call clear toast message', () => {
    jest.spyOn(toastrService, 'clear');

    component.clearError();

    expect(toastrService.clear).toBeCalled();
  });

  describe("close", () => {
    it('return value settled When have match settled', () => {
      component.teamJustSettled = "1";
      jest.spyOn(component.dialogRef, 'close');

      component.close();

      expect(component.dialogRef.close).toHaveBeenCalledWith("1");
    });

    it('should call without param when not settle any match', () => {
      component.teamJustSettled = '';
      jest.spyOn(component.dialogRef, 'close');

      component.close();

      expect(component.dialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe("disableCalculate", () => {
    it('should disable when no match selected', () => {
      team.selected = false;
      component.teams = [team];

      const actual = component.disableUncalculate();

      expect(actual).toBeTruthy();
    });
    it('should disable when not exist permission', () => {
      team.selected = true;
      leagueSettle.permission.canUncalculateOutright = false;
      component.teams = [team];

      const actual = component.disableUncalculate();

      expect(actual).toBeTruthy();
    });
    it('should enable when exist permission and match selected', () => {
      team.selected = true;
      leagueSettle.permission.canUncalculateOutright = true;
      component.teams = [team];

      const actual = component.disableUncalculate();

      expect(actual).toBeFalsy();
    });
  });

  describe('Uncalculate', () => {
    it('should show confirm box and settle after confirm', fakeAsync(() => {
      team.selected = true;
      component.teams = [team];
      jest.spyOn(outrightService, 'uncalculate').mockReturnValue(Promise.resolve(ResultSuccessful));
      jest.spyOn(component.dialogRef, 'close');

      component.uncalculate();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(outrightService.uncalculate).toBeCalledWith('1', '100');
      expect(component.dialogRef.close).toBeCalledWith('1');
    }));

    it('should show error when settle failed', fakeAsync(() => {
      team.selected = true;
      const teamSecond = _.cloneDeep(team);
      teamSecond.orId = '2';
      teamSecond.teamId = 200;
      leagueSettle.teams = [team, teamSecond];
      component.teams = [team, teamSecond];
      ResultFailed.teamFailedIds = '1';
      jest.spyOn(outrightService, 'uncalculate').mockReturnValue(Promise.resolve(ResultFailed));
      jest.spyOn(toastrService, 'error');

      component.uncalculate();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      flush();

      expect(outrightService.uncalculate).toBeCalledWith('1,2', '100,200');
      expect(toastrService.error).toBeCalledWith(ResultFailed.errMsg);
      expect(component.teamJustSettled).toEqual('2');
    }));
  });
});
