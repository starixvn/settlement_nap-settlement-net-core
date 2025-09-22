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
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { ItemsSelect } from '../../../shared/models';
import { TicketStatusFilterPipe } from '../../pipes/ticket-status-filter-pipe';

describe('CalculatePopupComponent', () => {
  let component: CalculatePopupComponent;
  let fixture: ComponentFixture<CalculatePopupComponent>;
  let outrightService: OutrightService;
  let toastrService: ToastrService;
  let dialogRef: MatDialogRef<CalculatePopupComponent>;
  let calculateService: CalculateService;
  let statusPipe: StatusPipe;
  let ticketStatusFilterPipe: TicketStatusFilterPipe;
  let messageBoxService: MessageBoxService;

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
    originalStatus: '',
    originalScreenshot: '',
    screenShot: '',
    confirmedBy: 0,
    mismatchClass: '',
    traderConfirmClass: '',
    traderScore: '',
    originalTraderScore: '',
    resultStatusId: 1
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
        StatusPipe,
        TicketStatusFilterPipe,
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
    statusPipe = fixture.debugElement.injector.get(StatusPipe);
    ticketStatusFilterPipe = fixture.debugElement.injector.get(TicketStatusFilterPipe);
    dialogRef = fixture.debugElement.injector.get(MatDialogRef<CalculatePopupComponent>);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    fixture.detectChanges();
    component.leagueSettle = leagueSettle;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('NgOnInit', () => {
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

  describe("clearError", () => {
    it('should clear toastr messages', () => {
      toastrService.clear = jest.fn();

      component.clearError();

      expect(toastrService.clear).toHaveBeenCalled();
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

  describe("viewRecalculate", () => {
    it('should return true when user is leader', () => {
      leagueSettle.permission.isLeader = true;

      const actual = component.viewRecalculate;

      expect(actual).toBeTruthy();
    });

    it('should return false when user is not leader', () => {
      leagueSettle.permission.isLeader = false;

      const actual = component.viewRecalculate;

      expect(actual).toBeFalsy();
    });
  });

  describe("disableRecalculate", () => {
    it('should return true when no teams selected', () => {
      team.selected = false;
      component.teams = [team];

      const actual = component.disableRecalculate;

      expect(actual).toBeTruthy();
    });

    it('should return false when teams are selected', () => {
      team.selected = true;
      component.teams = [team];

      const actual = component.disableRecalculate;

      expect(actual).toBeFalsy();
    });
  });

  describe("teamSelected", () => {
    it('should return only selected teams', () => {
      const team1 = { ...team, selected: true };
      const team2 = { ...team, selected: false };
      component.teams = [team1, team2];

      const actual = component.teamSelected;

      expect(actual).toEqual([team1]);
    });
  });

  it('selectStatus - should unselect all match', () => {
    team.selected = true;
    component.teams = [team];

    component.selectStatus();

    expect(team.selected).toBeFalsy();
  });

  describe("onSelectTicketsStatus", () => {
    it('should set ticketStatusSelected and call selectStatus', () => {
      const items: ItemsSelect[] = [new ItemsSelect(1, 'running', 'Running', false, false, true, [])];
      component.selectStatus = jest.fn();

      component.onSelectTicketsStatus(items);

      expect(component.ticketStatusSelected).toBe('running');
      expect(component.selectStatus).toHaveBeenCalled();
    });

    it('should set empty string when no items selected', () => {
      const items: ItemsSelect[] = [];
      component.selectStatus = jest.fn();

      component.onSelectTicketsStatus(items);

      expect(component.ticketStatusSelected).toBe('');
      expect(component.selectStatus).toHaveBeenCalled();
    });
  });

  describe("onSelectScreenShot", () => {
    it('should set screenshotSelected and call selectStatus', () => {
      const items: ItemsSelect[] = [new ItemsSelect(1, 'WON', 'Won', false, false, true, [])];
      component.selectStatus = jest.fn();

      component.onSelectScreenShot(items);

      expect(component.screenshotSelected).toBe('WON');
      expect(component.selectStatus).toHaveBeenCalled();
    });

    it('should set empty string when no items selected', () => {
      const items: ItemsSelect[] = [];
      component.selectStatus = jest.fn();

      component.onSelectScreenShot(items);

      expect(component.screenshotSelected).toBe('');
      expect(component.selectStatus).toHaveBeenCalled();
    });
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

  describe("makeBackgroundByStatus", () => {
    it('should return calculated when team is not running status', () => {
      team.originalStatus = 'COMPLETED';

      const actual = component.makeBackgroundByStatus(team);

      expect(actual).toBe('calculated');
    });

    it('should return status-mismatched when status and screenshot do not match', () => {
      team.originalStatus = 'RUNNING';
      team.status = 'HIDE';
      team.screenShot = 'LOSE';

      const actual = component.makeBackgroundByStatus(team);

      expect(actual).toBe('status-mismatched');
    });

    it('should return empty string when status and screenshot match', () => {
      team.originalStatus = 'RUNNING';
      team.status = 'WON';
      team.screenShot = 'WON';

      const actual = component.makeBackgroundByStatus(team);

      expect(actual).toBe('');
    });
  });

  describe("changeScreenshot", () => {
    it('should clear error and update status class', () => {
      toastrService.clear = jest.fn();
      component.makeBackgroundByStatus = jest.fn().mockReturnValue('status-mismatched');

      component.changeScreenshot(team);

      expect(toastrService.clear).toHaveBeenCalled();
      expect(component.makeBackgroundByStatus).toHaveBeenCalledWith(team);
      expect(team.statusClass).toBe('status-mismatched');
    });
  });

  describe("onSelectDate", () => {
    it('should update team event date', () => {
      const date: NgbDateStruct = { year: 2023, month: 10, day: 15 };
      const verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
      verifyDateService.format = jest.fn().mockReturnValue('2023-10-15');

      component.onSelectDate(date, team);

      expect(verifyDateService.format).toHaveBeenCalledWith(date);
      expect(team.eventDate).toBe('2023-10-15');
    });
  });

  describe("onSelectAllTeam", () => {
    it('should select all filtered teams when true', () => {
      const team1 = { ...team, orId: '1', selected: false };
      const team2 = { ...team, orId: '2', selected: false };
      component.teams = [team1, team2];
      component.filteredTeam = jest.fn().mockReturnValue([team1]);

      component.onSelectAllTeam(true);

      expect(team1.selected).toBeTruthy();
      expect(team2.selected).toBeFalsy();
    });

    it('should unselect all teams when false', () => {
      const team1 = { ...team, orId: '1', selected: true };
      const team2 = { ...team, orId: '2', selected: true };
      component.teams = [team1, team2];
      component.filteredTeam = jest.fn().mockReturnValue([team1]);

      component.onSelectAllTeam(false);

      expect(team1.selected).toBeFalsy();
      expect(team2.selected).toBeFalsy();
    });
  });

  describe("filteredTeam", () => {
    it('should return filtered teams using pipes', () => {
      const teams = [team];
      const filteredByStatus = [team];
      const filteredByTicketStatus = [team];
      component.teams = teams;
      statusPipe.transform = jest.fn().mockReturnValue(filteredByStatus);
      ticketStatusFilterPipe.transform = jest.fn().mockReturnValue(filteredByTicketStatus);

      const actual = component.filteredTeam();

      expect(statusPipe.transform).toHaveBeenCalledWith(teams, component.statusSelected, component.screenshotSelected);
      expect(ticketStatusFilterPipe.transform).toHaveBeenCalledWith(filteredByStatus, component.ticketStatusSelected);
      expect(actual).toEqual(filteredByTicketStatus);
    });
  });

  describe("onSelectTeam", () => {
    it('should set selectAllTeam to true when all filtered teams are selected', () => {
      const team1 = { ...team, selected: true };
      const team2 = { ...team, selected: true };
      component.filteredTeam = jest.fn().mockReturnValue([team1, team2]);

      component.onSelectTeam();

      expect(component.selectAllTeam).toBeTruthy();
    });

    it('should set selectAllTeam to false when not all filtered teams are selected', () => {
      const team1 = { ...team, selected: true };
      const team2 = { ...team, selected: false };
      component.filteredTeam = jest.fn().mockReturnValue([team1, team2]);

      component.onSelectTeam();

      expect(component.selectAllTeam).toBeFalsy();
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
        expect(toastrService.error).toHaveBeenCalledWith(Language.eSports.leader.blankScore);
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
      outrightService.saveScore = jest.fn().mockReturnValue(Promise.resolve());
      outrightService.calculate = jest.fn().mockReturnValue(Promise.resolve(ResultSuccessful));
      dialogRef.close = jest.fn();

      component.calculate().then(() => {
        let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        expect(toastrService.clear).toHaveBeenCalled();
        expect(outrightService.saveScore).toHaveBeenCalledWith(component.teamSelected);
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
      outrightService.saveScore = jest.fn().mockReturnValue(Promise.resolve());
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
        expect(outrightService.saveScore).toHaveBeenCalledWith(component.teamSelected);
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
      outrightService.saveScore = jest.fn().mockReturnValue(Promise.resolve());
      outrightService.calculate = jest.fn().mockReturnValue(Promise.resolve(ResultFailed));
      dialogRef.close = jest.fn();


      component.calculate().then(() => {
        let buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();
        flush();

        expect(toastrService.clear).toHaveBeenCalled();
        expect(outrightService.saveScore).toHaveBeenCalledWith(component.teamSelected);
        expect(outrightService.calculate).toHaveBeenCalled();
        expect(toastrService.error).toHaveBeenCalledWith(ResultFailed.errMsg);
        expect(component.teamJustSettled.length).toEqual(1);
      });
    });
  });

  describe("saveScore", () => {
    it('should show confirmation and save score when confirmed', () => {
      const mockConfirm = jest.fn();
      messageBoxService.confirm = mockConfirm;
      outrightService.saveScore = jest.fn().mockReturnValue(Promise.resolve());
      dialogRef.close = jest.fn();
      toastrService.clear = jest.fn();

      component.saveScore();

      expect(toastrService.clear).toHaveBeenCalled();
      expect(messageBoxService.confirm).toHaveBeenCalled();

      const confirmCallback = mockConfirm.mock.calls[0][1];
      confirmCallback();

      expect(outrightService.saveScore).toHaveBeenCalledWith(component.teamSelected);
    });
  });
});




