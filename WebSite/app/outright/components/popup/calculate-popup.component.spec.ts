import { TeamSettle } from './../../models/team.model';
import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, tick, flush } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastContainerDirective, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { StatusPipe } from '../../pipes/status-pipe';
import { CalculateService, OutrightService } from '../../services';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { CalculatePopupComponent } from './calculate-popup.component';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LeagueSettle, Permission, Team } from '../../models';
import { Language } from '../../../shared/language.native';
import { ResultOutright } from '../../models/result-outright.model';
import * as _ from "lodash";
import { DeadHeatSettings } from '../../constants/deadheat-setting';

describe('CalculatePopupComponent', () => {
  let component: CalculatePopupComponent;
  let fixture: ComponentFixture<CalculatePopupComponent>;
  let outrightService: OutrightService;
  let toastrService: ToastrService;
  let dialogRef: MatDialogRef<CalculatePopupComponent>;
  let calculateService: CalculateService;

  const team: Team = {
    isDeadheat: false,
    disableDeadheat: false,
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
    betCount: 0,
    statusClass: '',
    totalCal: 0,
    totalRunning: 0,
    totalHide: 0,
    originalStatus: ''
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
    isSuccessful: true,
    childMatchIds: '',
    settledSessionId: '',
    hasResultAmendment: false,
    isOrg: true
  };

  const ResultFailed: ResultOutright = {
    errCode: 1,
    errMsg: 'mock error',
    teamFailedIds: '',
    isSuccessful: false,
    childMatchIds: '',
    settledSessionId: '',
    hasResultAmendment: false,
    isOrg: false
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
      ],
      teardown: { destroyAfterEach: false }
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatePopupComponent);
    component = fixture.componentInstance;
    outrightService = fixture.debugElement.injector.get(OutrightService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    calculateService = fixture.debugElement.injector.get(CalculateService);
    dialogRef = fixture.debugElement.injector.get(MatDialogRef<CalculatePopupComponent>);
    fixture.detectChanges();
    component.leagueSettle = leagueSettle;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });



  describe('NgOnInit',
    () => {
      it('should GetMatches', () => {
        outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));

        component.ngOnInit();

        expect(outrightService.getMatches).toHaveBeenCalled();
      });


      test.each([
        ["Running", "Running", "2023-10-3", true],
        ["Completed", "Won", "2023-10-2", false]])('Adjust value When Match exist - OddsStatus: %p', async (oddStatus: string, status: string, eventDate: string, disableDeadHeat: boolean) => {
          team.status = status;
          team.oddsStatus = oddStatus;
          team.eventDate = "2023-10-2";
          leagueSettle.today = "2023-10-3";
          leagueSettle.teams = [team];
          outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
          calculateService.renderTicketStatus = jest.fn();

          component.ngOnInit().then(() => {
            const actualTeam = component.teams[0];
            expect(actualTeam.status).toEqual(status.toUpperCase());
            expect(actualTeam.eventDate).toEqual(eventDate);
            expect(actualTeam.disableDeadheat).toEqual(disableDeadHeat);
          });
        });
    });

  describe("close", () => {
    it('return value settled When have match settled', () => {
      const teamSettled = new TeamSettle('1', '1', false, '', '');
      component.teamJustSettled = [teamSettled];
      dialogRef.close = jest.fn();

      component.close();

      expect(dialogRef.close).toHaveBeenCalledWith([teamSettled]);
    });

    it('should call without param when not settle any match', () => {
      component.teamJustSettled = [];
      dialogRef.close = jest.fn();

      component.close();

      expect(dialogRef.close).toHaveBeenCalledWith();
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
      team.status = "WON";
      team.disableDeadheat = true;

      component.changeStatus(team);

      expect(team.disableDeadheat).toBeFalsy();
    });
  });


  describe("Calculate", () => {
    it('should get Lastest data to check', () => {
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(1));
      CalculateService.teamWonSettled = jest.fn();

      component.calculate().then(() => {
        expect(component.originalTeam).toEqual(leagueSettle.teams);
        expect(CalculateService.teamWonSettled).toHaveBeenCalled();
      });
    });

    it('should error when exist match running', () => {
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(1));
      CalculateService.ExistRunningStatus = jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();
      toastrService.clear = jest.fn();

      component.calculate().then(() => {
        expect(toastrService.clear).toHaveBeenCalled();
        expect(toastrService.error).toHaveBeenCalledWith(Language.Outright.existRunning);
      });
    });

    it('should error when matches selected inconsistent Dead heat value', () => {
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(DeadHeatSettings.No));
      CalculateService.ExistRunningStatus = jest.fn().mockReturnValue(false);
      CalculateService.VerifyOnlyOneTeamWon = jest.fn().mockReturnValue(false);
      CalculateService.VerifyDeadHeatNoSetting = jest.fn().mockReturnValue("Mock Test");
      toastrService.error = jest.fn();
      toastrService.clear = jest.fn();

      component.calculate().then(() => {
        expect(toastrService.clear).toHaveBeenCalled();
        expect(toastrService.error).toHaveBeenCalledWith("Mock Test");
      });
    });

    it('should error when exist only one match death heat', () => {
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(1));
      CalculateService.ExistRunningStatus = jest.fn().mockReturnValue(false);
      CalculateService.VerifyOnlyOneTeamWon = jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();
      toastrService.clear = jest.fn();

      component.calculate().then(() => {
        expect(toastrService.clear).toHaveBeenCalled();
        expect(toastrService.error).toHaveBeenCalledWith(Language.Outright.atLeastTwoDeadHeat);
      });
    });

    it('should confirm one time when pass all validate', () => {
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(1));
      CalculateService.ExistRunningStatus = jest.fn().mockReturnValue(false);
      CalculateService.VerifyOnlyOneTeamWon = jest.fn().mockReturnValue(false);
      CalculateService.VerifySettledSelected = jest.fn().mockReturnValue(false);
      toastrService.clear = jest.fn();
      outrightService.calculate = jest.fn().mockReturnValue(Promise.resolve(ResultSuccessful));
      dialogRef.close = jest.fn();

      component.calculate().then(() => {
        let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        expect(toastrService.clear).toHaveBeenCalled();
        expect(outrightService.calculate).toHaveBeenCalled();
        expect(dialogRef.close).toHaveBeenCalled();

      });
    });

    it('should confirm twice when exist team dead heat with setting no deadhead', () => {
      team.orId = '1';
      team.selected = true;
      team.status = "WON";
      team.isDeadheat = true;
      team.isDeadheat = true;
      const teamSecond = _.cloneDeep(team);
      teamSecond.orId = '2';
      leagueSettle.teams = [team, teamSecond];
      component.teams = [team, teamSecond];
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(DeadHeatSettings.No));
      CalculateService.ExistRunningStatus = jest.fn().mockReturnValue(false);
      CalculateService.VerifyOnlyOneTeamWon = jest.fn().mockReturnValue(false);
      CalculateService.VerifySettledSelected = jest.fn().mockReturnValue(false);
      CalculateService.VerifyDeadHeatNoSetting = jest.fn().mockReturnValue("");
      CalculateService.ConfirmDeadHeatNoSetting = jest.fn().mockReturnValue(true);
      toastrService.clear = jest.fn();
      outrightService.calculate = jest.fn().mockReturnValue(Promise.resolve(ResultSuccessful));
      dialogRef.close = jest.fn();

      component.calculate().then(() => {
        let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();
        buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();
        flush();

        expect(toastrService.clear).toHaveBeenCalled();
        expect(outrightService.calculate).toHaveBeenCalled();
        expect(dialogRef.close).toHaveBeenCalled();
      });
    });

    it('should show error when exist error settle', () => {
      team.orId = '1';
      team.selected = true;
      const teamSecond = _.cloneDeep(team);
      teamSecond.orId = '2';
      leagueSettle.teams = [team, teamSecond];
      component.teams = [team, teamSecond];
      ResultFailed.teamFailedIds = '1';
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(DeadHeatSettings.No));
      CalculateService.ExistRunningStatus = jest.fn().mockReturnValue(false);
      CalculateService.VerifyOnlyOneTeamWon = jest.fn().mockReturnValue(false);
      CalculateService.VerifySettledSelected = jest.fn().mockReturnValue(false);
      CalculateService.VerifyDeadHeatNoSetting = jest.fn().mockReturnValue("");
      CalculateService.ConfirmDeadHeatNoSetting = jest.fn().mockReturnValue(false);
      toastrService.clear = jest.fn();
      toastrService.error = jest.fn();
      outrightService.calculate = jest.fn().mockReturnValue(Promise.resolve(ResultFailed));
      dialogRef.close = jest.fn();


      component.calculate().then(() => {
        let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();
        flush();

        expect(toastrService.clear).toHaveBeenCalled();
        expect(outrightService.calculate).toHaveBeenCalled();
        expect(toastrService.error).toHaveBeenCalledWith(ResultFailed.errMsg);
        expect(component.teamJustSettled.length).toEqual(1);
      });
    });
  });
});




