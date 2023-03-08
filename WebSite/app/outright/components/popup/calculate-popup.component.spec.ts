import { TeamSettle } from './../../models/team.model';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { StatusPipe } from '../../pipes/status-pipe';
import { CalculateService, OutrightService } from '../../services';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { CalculatePopupComponent } from './calculate-popup.component';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LeagueSettle, Permission, Team } from '../../models';
import { Language } from '../../../shared/language.native';
import { ResultOutright } from '../../models/result-outright.model';
import * as _ from "lodash";

describe('CalculatePopupComponent', () => {
  let component: CalculatePopupComponent;
  let fixture: ComponentFixture<CalculatePopupComponent>;
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
    orId: '',
    matchCode: '',
    kickOffTime: undefined,
    sportType: 0,
    status: '',
    leagueId: 0,
    leagueName: '',
    teamId: 0,
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
        CalculatePopupComponent,
        CommonModule,
        FormsModule,
        DatepickerComponent,
        StatusPipe,
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
        VerifyDateService,
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
    fixture = TestBed.createComponent(CalculatePopupComponent);
    component = fixture.componentInstance;
    outrightService = fixture.debugElement.injector.get(OutrightService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    fixture.detectChanges();
    component.leagueSettle = leagueSettle;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('NgOnInit', () => {
    it('should GetMatches', () => {
      jest.spyOn(outrightService, 'getMatches').mockReturnValue(Promise.resolve(leagueSettle));

      component.ngOnInit();

      expect(outrightService.getMatches).toHaveBeenCalled();
    });


    test.each([
      ["Running", "Running", "2023-10-3", true],
      ["Completed", "Won", "2023-10-2", false]])('Adjust value When Match exist - OddsStatus: %p', fakeAsync((oddStatus: string, status: string, eventDate: string, disableDeadHeat: boolean) => {
        team.status = status;
        team.oddsStatus = oddStatus;
        team.eventDate = "2023-10-2";
        leagueSettle.today = "2023-10-3";
        jest.spyOn(outrightService, 'getMatches').mockReturnValue(Promise.resolve(leagueSettle));

        component.ngOnInit();
        tick();
        const actualTeam = component.teams[0];

        expect(actualTeam.status).toEqual(status.toUpperCase());
        expect(actualTeam.eventDate).toEqual(eventDate);
        expect(actualTeam.disableDeadheat).toEqual(disableDeadHeat);
      }));
  });

  describe("close", () => {
    it('return value settled When have match settled', () => {
      const teamSettled = new TeamSettle('1', '1', false, '', '');
      component.teamJustSettled = [teamSettled];
      jest.spyOn(component.dialogRef, 'close');

      component.close();

      expect(component.dialogRef.close).toHaveBeenCalledWith([teamSettled]);
    });

    it('should call without param when not settle any match', () => {
      component.teamJustSettled = [];
      jest.spyOn(component.dialogRef, 'close');

      component.close();

      expect(component.dialogRef.close).toHaveBeenCalledWith();
    });
  });

  describe("disableCalculate", () => {
    it('should disable when no match selected', () => {
      team.selected = false;
      component.teams = [team];

      const actual = component.disableCalculate();

      expect(actual).toBeTruthy();
    });
    it('should disable when not exist permission', () => {
      team.selected = true;
      leagueSettle.permission.canCalculateOutright = false;
      component.teams = [team];

      const actual = component.disableCalculate();

      expect(actual).toBeTruthy();
    });
    it('should enable when exist permission and match selected', () => {
      team.selected = true;
      leagueSettle.permission.canCalculateOutright = true;
      component.teams = [team];

      const actual = component.disableCalculate();

      expect(actual).toBeFalsy();
    });
  });

  it('selectStatus - should unselect all match', () => {
    team.selected = true;
    component.teams = [team];

    component.selectStatus();

    expect(team.selected).toBeFalsy();
  });

  describe("changeStatus", () => {
    it("should disable Dead Heat when change status to not Won", () => {
      team.status = "lose";
      team.disableDeadheat = false;
      team.isDeadheat = true;

      component.changeStatus(team);

      expect(team.isDeadheat).toBeFalsy();
      expect(team.disableDeadheat).toBeTruthy();
    });

    it("should enable Dead Heat when change status to Won", () => {
      team.status = "lose";
      team.disableDeadheat = true;

      component.changeStatus(team);

      expect(team.disableDeadheat).toBeFalsy();
    });
  });


  describe("Calculate", () => {
    it('should get Lastest data to check', fakeAsync(() => {
      jest.spyOn(outrightService, 'getMatches').mockReturnValue(Promise.resolve(leagueSettle));
      jest.spyOn(CalculateService, 'teamWonSettled');

      component.calculate();
      tick();

      expect(component.originalTeam).toEqual(leagueSettle.teams);
      expect(CalculateService.teamWonSettled).toBeCalled();
    }));

    it('should error when exist match running', fakeAsync(() => {
      jest.spyOn(outrightService, 'getMatches').mockReturnValue(Promise.resolve(leagueSettle));
      jest.spyOn(CalculateService, 'ExistRunningStatus').mockReturnValue(true);
      jest.spyOn(toastrService, 'error');
      jest.spyOn(toastrService, 'clear');

      component.calculate();
      flush();

      expect(toastrService.clear).toBeCalled();
      expect(toastrService.error).toBeCalledWith(Language.Outright.existRunning);
    }));

    it('should error when exist only one match death heat', fakeAsync(() => {
      jest.spyOn(outrightService, 'getMatches').mockReturnValue(Promise.resolve(leagueSettle));
      jest.spyOn(CalculateService, 'ExistRunningStatus').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyOnlyOneTeamWon').mockReturnValue(true);
      jest.spyOn(toastrService, 'error');
      jest.spyOn(toastrService, 'clear');

      component.calculate();
      flush();

      expect(toastrService.clear).toBeCalled();
      expect(toastrService.error).toBeCalledWith(Language.Outright.atLeastTwoDeadHeat);
    }));

    it('should error when matches selected inconsistent Dead heat value', fakeAsync(() => {
      jest.spyOn(outrightService, 'getMatches').mockReturnValue(Promise.resolve(leagueSettle));
      jest.spyOn(CalculateService, 'ExistRunningStatus').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyOnlyOneTeamWon').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyDeadheat').mockReturnValue(true);
      jest.spyOn(CalculateService, 'MessageInconsistentDeadheat').mockReturnValue("Mock Test");
      jest.spyOn(toastrService, 'error');
      jest.spyOn(toastrService, 'clear');

      component.calculate();
      flush();

      expect(toastrService.clear).toBeCalled();
      expect(toastrService.error).toBeCalledWith("Mock Test");
      expect(CalculateService.MessageInconsistentDeadheat).toBeCalled();
    }));

    it('should confirm twice when exist more than one team dead heat', fakeAsync(() => {
      jest.spyOn(outrightService, 'getMatches').mockReturnValue(Promise.resolve(leagueSettle));
      jest.spyOn(CalculateService, 'ExistRunningStatus').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyOnlyOneTeamWon').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyDeadheat').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyNonDeadheat').mockReturnValue(true);
      jest.spyOn(toastrService, 'clear');
      jest.spyOn(outrightService, 'calculate').mockReturnValue(Promise.resolve(ResultSuccessful));
      jest.spyOn(component.dialogRef, 'close');

      component.calculate();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      flush();

      expect(toastrService.clear).toBeCalled();      
      expect(outrightService.calculate).toBeCalled();
      expect(component.dialogRef.close).toBeCalled();
    }));

    it('should confirm one time when pass all validate', fakeAsync(() => {
      jest.spyOn(outrightService, 'getMatches').mockReturnValue(Promise.resolve(leagueSettle));
      jest.spyOn(CalculateService, 'ExistRunningStatus').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyOnlyOneTeamWon').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyDeadheat').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyNonDeadheat').mockReturnValue(false);
      jest.spyOn(toastrService, 'clear');
      jest.spyOn(outrightService, 'calculate').mockReturnValue(Promise.resolve(ResultSuccessful));
      jest.spyOn(component.dialogRef, 'close');

      component.calculate();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      flush();

      expect(toastrService.clear).toBeCalled();      
      expect(outrightService.calculate).toBeCalled();
      expect(component.dialogRef.close).toBeCalled();
    }));

    it('should show error when exist error settle', fakeAsync(() => {
      team.orId = '1';
      team.selected = true;
      const teamSecond = _.cloneDeep(team);
      teamSecond.orId = '2';
      leagueSettle.teams = [team, teamSecond];
      component.teams = [team, teamSecond];
      ResultFailed.teamFailedIds = '1';
      jest.spyOn(outrightService, 'getMatches').mockReturnValue(Promise.resolve(leagueSettle));
      jest.spyOn(CalculateService, 'ExistRunningStatus').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyOnlyOneTeamWon').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyDeadheat').mockReturnValue(false);
      jest.spyOn(CalculateService, 'VerifyNonDeadheat').mockReturnValue(false);
      jest.spyOn(toastrService, 'clear');
      jest.spyOn(toastrService, 'error');
      jest.spyOn(outrightService, 'calculate').mockReturnValue(Promise.resolve(ResultFailed));
      jest.spyOn(component.dialogRef, 'close');
      

      component.calculate();
      tick();
      let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      flush();

      expect(toastrService.clear).toBeCalled();      
      expect(outrightService.calculate).toBeCalled();
      expect(toastrService.error).toBeCalledWith(ResultFailed.errMsg);
      expect(component.teamJustSettled.length).toEqual(1);
    }));
  });
});




