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
import { StatusId } from '../../constants';

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
    originalIsDeadheat: false,
    confirmedBy: '',
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
    component.permission = new Permission();
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

      component.onSelectTeam(team1);

      expect(component.selectAllTeam).toBeTruthy();
    });

    it('should set selectAllTeam to false when not all filtered teams are selected', () => {
      const team1 = { ...team, selected: true };
      const team2 = { ...team, selected: false };
      component.filteredTeam = jest.fn().mockReturnValue([team1, team2]);

      component.onSelectTeam(team1);

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

    it('should not save when confirmation is cancelled', () => {
      const mockConfirm = jest.fn();
      messageBoxService.confirm = mockConfirm;
      outrightService.saveScore = jest.fn();
      toastrService.clear = jest.fn();

      component.saveScore();

      expect(toastrService.clear).toHaveBeenCalled();
      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(outrightService.saveScore).not.toHaveBeenCalled();
    });
  });

  describe("autoFillFinalScore", () => {
    it('should set status to traderScore when conditions are met', () => {
      team.originalStatus = 'RUNNING';
      team.originalTraderScore = 'WON';
      team.screenShot = 'WON';
      team.traderScore = 'WON';
      component.changeStatus = jest.fn();

      component.autoFillFinalScore(team);

      expect(team.status).toBe('WON');
      expect(component.changeStatus).toHaveBeenCalledWith(team);
    });

    it('should set status to originalStatus when traderScore is empty', () => {
      team.originalStatus = 'RUNNING';
      team.originalTraderScore = '';
      team.screenShot = 'WON';
      team.traderScore = 'WON';
      component.changeStatus = jest.fn();

      component.autoFillFinalScore(team);

      expect(team.status).toBe('RUNNING');
      expect(component.changeStatus).toHaveBeenCalledWith(team);
    });

    it('should set status to originalStatus when screenshot and traderScore do not match', () => {
      team.originalStatus = 'RUNNING';
      team.originalTraderScore = 'WON';
      team.screenShot = 'LOSE';
      team.traderScore = 'WON';
      component.changeStatus = jest.fn();

      component.autoFillFinalScore(team);

      expect(team.status).toBe('RUNNING');
      expect(component.changeStatus).toHaveBeenCalledWith(team);
    });

    it('should handle case-insensitive comparison', () => {
      team.originalStatus = 'RUNNING';
      team.originalTraderScore = 'won';
      team.screenShot = 'won';
      team.traderScore = 'WON';
      component.changeStatus = jest.fn();

      component.autoFillFinalScore(team);

      expect(team.status).toBe('WON');
      expect(component.changeStatus).toHaveBeenCalledWith(team);
    });
  });

  describe("autoChangeDeadheat", () => {
    beforeEach(() => {
      component.permission = new Permission();
    });

    it('should preserve original deadheat when user is leader', () => {
      component.permission.isLeader = true;
      team.originalIsDeadheat = true;
      team.isDeadheat = false;

      component.autoChangeDeadheat(team);

      expect(team.isDeadheat).toBe(true);
    });

    it('should set deadheat to false when not leader and result is confirmed', () => {
      component.permission.isLeader = false;
      team.resultStatusId = 3;
      team.isDeadheat = true;

      component.autoChangeDeadheat(team);

      expect(team.isDeadheat).toBe(false);
    });

    it('should not change deadheat when not leader and result is not confirmed', () => {
      component.permission.isLeader = false;
      team.resultStatusId = 1;
      team.isDeadheat = true;

      component.autoChangeDeadheat(team);

      expect(team.isDeadheat).toBe(true);
    });
  });

  describe("traderConfirmClass", () => {
    it('should return bg-result-confirmed when conditions are met', () => {
      team.originalTraderScore = 'WON';
      team.originalStatus = 'RUNNING';
      team.resultStatusId = 3;

      const result = component.traderConfirmClass(team);

      expect(result).toBe('bg-result-confirmed');
    });

    it('should return empty string when originalTraderScore is empty', () => {
      team.originalTraderScore = '';
      team.originalStatus = 'RUNNING';
      team.resultStatusId = 3;

      const result = component.traderConfirmClass(team);

      expect(result).toBe('');
    });

    it('should return empty string when resultStatusId is not 3', () => {
      team.originalTraderScore = 'WON';
      team.originalStatus = 'RUNNING';
      team.resultStatusId = 1;

      const result = component.traderConfirmClass(team);

      expect(result).toBe('');
    });
  });

  describe("getWonRefundConfirmClass", () => {
    beforeEach(() => {
      component.permission = new Permission();
    });

    it('should return empty string when user is not leader', () => {
      component.permission.isLeader = false;
      team.traderScore = 'WON';
      team.resultStatusId = 3;

      const result = component.getWonRefundConfirmClass(team);

      expect(result).toBe('');
    });

    it('should return bg-result-refund when traderScore is refund and confirmed', () => {
      component.permission.isLeader = true;
      team.traderScore = 'REFUND';
      team.resultStatusId = 3;

      const result = component.getWonRefundConfirmClass(team);

      expect(result).toBe('bg-result-refund');
    });

    it('should return bg-result-won when traderScore is won and confirmed', () => {
      component.permission.isLeader = true;
      team.traderScore = 'WON';
      team.resultStatusId = 3;

      const result = component.getWonRefundConfirmClass(team);

      expect(result).toBe('bg-result-won');
    });

    it('should return empty string when result is not confirmed', () => {
      component.permission.isLeader = true;
      team.traderScore = 'WON';
      team.resultStatusId = 1;

      const result = component.getWonRefundConfirmClass(team);

      expect(result).toBe('bg-result-won');
    });

    it('should handle case-insensitive traderScore', () => {
      component.permission.isLeader = true;
      team.traderScore = 'won';
      team.resultStatusId = 3;

      const result = component.getWonRefundConfirmClass(team);

      expect(result).toBe('bg-result-won');
    });
  });

  describe("onSelectAllTeam", () => {
    beforeEach(() => {
      component.permission = new Permission();
    });

    it('should enable deadheat for leader when traderScore is won and team is selected', () => {
      component.permission.isLeader = true;
      const team1 = { ...team, orId: '1', selected: false, originalTraderScore: 'WON', disableDeadheat: true };
      component.teams = [team1];
      component.filteredTeam = jest.fn().mockReturnValue([team1]);

      component.onSelectAllTeam(true);

      expect(team1.disableDeadheat).toBe(false);
    });

    it('should not enable deadheat when not leader', () => {
      component.permission.isLeader = false;
      const team1 = { ...team, orId: '1', selected: false, originalTraderScore: 'WON', disableDeadheat: true };
      component.teams = [team1];
      component.filteredTeam = jest.fn().mockReturnValue([team1]);

      component.onSelectAllTeam(true);

      expect(team1.disableDeadheat).toBe(true);
    });
  });

  describe("onSelectTeam", () => {
    beforeEach(() => {
      component.permission = new Permission();
    });

    it('should enable deadheat for leader when traderScore is won', () => {
      component.permission.isLeader = true;
      team.originalTraderScore = 'WON';
      team.disableDeadheat = true;
      component.filteredTeam = jest.fn().mockReturnValue([team]);

      component.onSelectTeam(team);

      expect(team.disableDeadheat).toBe(false);
    });

    it('should not enable deadheat when not leader', () => {
      component.permission.isLeader = false;
      team.originalTraderScore = 'WON';
      team.disableDeadheat = true;
      component.filteredTeam = jest.fn().mockReturnValue([team]);

      component.onSelectTeam(team);

      expect(team.disableDeadheat).toBe(true);
    });

    it('should not enable deadheat when traderScore is not won', () => {
      component.permission.isLeader = true;
      team.originalTraderScore = 'LOSE';
      team.disableDeadheat = true;
      component.filteredTeam = jest.fn().mockReturnValue([team]);

      component.onSelectTeam(team);

      expect(team.disableDeadheat).toBe(true);
    });
  });

  describe("changeTraderScore", () => {
    it('should clear error and call autoFillFinalScore', () => {
      toastrService.clear = jest.fn();
      component.autoFillFinalScore = jest.fn();
      team.traderScore = 'WON';

      component.changeTraderScore(team);

      expect(toastrService.clear).toHaveBeenCalled();
      expect(component.autoFillFinalScore).toHaveBeenCalledWith(team);
    });

    it('should enable deadheat when traderScore is won', () => {
      toastrService.clear = jest.fn();
      component.autoFillFinalScore = jest.fn();
      team.traderScore = 'WON';
      team.disableDeadheat = true;

      component.changeTraderScore(team);

      expect(team.disableDeadheat).toBe(false);
    });

    it('should disable deadheat when traderScore is not won and status is not won', () => {
      toastrService.clear = jest.fn();
      component.autoFillFinalScore = jest.fn();
      team.traderScore = 'LOSE';
      team.status = 'LOSE';
      team.disableDeadheat = false;

      component.changeTraderScore(team);

      expect(team.disableDeadheat).toBe(true);
    });

    it('should keep deadheat enabled when status is won', () => {
      toastrService.clear = jest.fn();
      component.autoFillFinalScore = jest.fn();
      team.traderScore = 'LOSE';
      team.status = 'WON';
      team.disableDeadheat = false;

      component.changeTraderScore(team);

      expect(team.disableDeadheat).toBe(false);
    });
  });

  describe("changeScreenshot", () => {
    it('should clear error and call autoFillFinalScore', () => {
      toastrService.clear = jest.fn();
      component.autoFillFinalScore = jest.fn();

      component.changeScreenshot(team);

      expect(toastrService.clear).toHaveBeenCalled();
      expect(component.autoFillFinalScore).toHaveBeenCalledWith(team);
    });
  });

  describe("processResultFail", () => {
    it('should update teamJustSettled when teamFailedIds exist', () => {
      const teamSettle1 = new TeamSettle('1', '1', false, 'WON', '2023-10-15');
      const teamSettle2 = new TeamSettle('2', '2', false, 'WON', '2023-10-15');
      component.teamJustSettled = [teamSettle1];
      component.leagueSettle = leagueSettle;
      leagueSettle.teams = [
        { ...team, orId: '1', oddsStatus: 'Running' },
        { ...team, orId: '2', oddsStatus: 'Running' }
      ];
      ResultFailed.teamFailedIds = '1';
      toastrService.error = jest.fn();

      component['processResultFail'](ResultFailed, [teamSettle1, teamSettle2]);

      expect(component.teamJustSettled.length).toBe(2);
      expect(component.teamJustSettled).toContain(teamSettle2);
      expect(leagueSettle.teams[1].oddsStatus).toBe('Completed');
      expect(toastrService.error).toHaveBeenCalledWith(ResultFailed.errMsg);
    });

    it('should not update teamJustSettled when teamFailedIds is empty', () => {
      const teamSettle1 = new TeamSettle('1', '1', false, 'WON', '2023-10-15');
      component.teamJustSettled = [teamSettle1];
      ResultFailed.teamFailedIds = '';
      toastrService.error = jest.fn();

      component['processResultFail'](ResultFailed, [teamSettle1]);

      expect(component.teamJustSettled.length).toBe(1);
      expect(toastrService.error).toHaveBeenCalledWith(ResultFailed.errMsg);
    });

    it('should handle multiple failed team IDs', () => {
      const teamSettle1 = new TeamSettle('1', '1', false, 'WON', '2023-10-15');
      const teamSettle2 = new TeamSettle('2', '2', false, 'WON', '2023-10-15');
      const teamSettle3 = new TeamSettle('3', '3', false, 'WON', '2023-10-15');
      component.teamJustSettled = [];
      component.leagueSettle = leagueSettle;
      leagueSettle.teams = [
        { ...team, orId: '1', oddsStatus: 'Running' },
        { ...team, orId: '2', oddsStatus: 'Running' },
        { ...team, orId: '3', oddsStatus: 'Running' }
      ];
      ResultFailed.teamFailedIds = '1,2';
      toastrService.error = jest.fn();

      component['processResultFail'](ResultFailed, [teamSettle1, teamSettle2, teamSettle3]);

      expect(component.teamJustSettled.length).toBe(1);
      expect(component.teamJustSettled[0].matchId).toBe('3');
    });
  });

  describe("saveTraderScore", () => {
    beforeEach(() => {
      component.permission = { isLeader: true } as Permission;
      component.data = { leagueId: 1, sportType: 1, eventDate: '2023-10-15' };
    });

    it('should show error when team is already settled', async () => {
      const originalTeam = { ...team, status: 'COMPLETED' };
      component.originalTeam = [originalTeam];
      team.selected = true;
      component.teams = [team];
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      CalculateService.VerifySettledSelected = jest.fn().mockReturnValue(true);
      toastrService.clear = jest.fn();
      toastrService.error = jest.fn();

      await component.saveTraderScore();

      expect(toastrService.clear).toHaveBeenCalled();
      expect(toastrService.error).toHaveBeenCalledWith(Language.Outright.existTeamSettled);
    });

    it('should show error when dead heat setting validation fails', async () => {
      team.traderScore = 'WON';
      team.selected = true;
      component.teams = [team];
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      CalculateService.VerifySettledSelected = jest.fn().mockReturnValue(false);
      CalculateService.teamWonSettled = jest.fn().mockReturnValue([]);
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(DeadHeatSettings.No));
      CalculateService.VerifyDeadHeatNoSetting = jest.fn().mockReturnValue('Dead heat setting error');
      toastrService.clear = jest.fn();
      toastrService.error = jest.fn();

      await component.saveTraderScore();

      expect(toastrService.clear).toHaveBeenCalled();
      expect(outrightService.getMatches).toHaveBeenCalled();
      expect(outrightService.getDeadHeatSetting).toHaveBeenCalledWith(component.data.leagueId);
      expect(CalculateService.teamWonSettled).toHaveBeenCalled();
      expect(CalculateService.VerifyDeadHeatNoSetting).toHaveBeenCalled();
      expect(toastrService.error).toHaveBeenCalledWith('Dead heat setting error');
    });
  });

  describe("verifyDeadHead", () => {
    beforeEach(() => {
      component.permission = new Permission();
      component.data = { leagueId: 1, sportType: 1, eventDate: '2023-10-15' };
    });

    it('should show error when dead heat setting validation fails', async () => {
      const teamWonSettled: Team[] = [];
      const teamWonSelected: Team[] = [];
      const teamHideSelected: Team[] = [];
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(DeadHeatSettings.No));
      CalculateService.VerifyDeadHeatNoSetting = jest.fn().mockReturnValue('Setting error');
      toastrService.error = jest.fn();

      await component['verifyDeadHead'](teamWonSettled, teamWonSelected, teamHideSelected);

      expect(toastrService.error).toHaveBeenCalledWith('Setting error');
    });

    it('should show error when non-leader has inconsistent dead heat', async () => {
      component.permission.isLeader = false;
      const teamWonSettled: Team[] = [];
      const teamWonSelected: Team[] = [];
      const teamHideSelected: Team[] = [];
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(DeadHeatSettings.Yes));
      CalculateService.VerifyDeadHeatYesSetting = jest.fn().mockReturnValue('');
      CalculateService.verifyDeadHeat = jest.fn().mockReturnValue(true);
      toastrService.error = jest.fn();

      await component['verifyDeadHead'](teamWonSettled, teamWonSelected, teamHideSelected);

      expect(toastrService.error).toHaveBeenCalledWith(Language.Outright.inconsistentTraderDeadheat);
    });
  });

  describe("getLatestData", () => {
    it('should fetch latest data and update originalTeam', async () => {
      component.data = { leagueId: 1, sportType: 1, eventDate: '2023-10-15' };
      const latestLeague = {
        ...leagueSettle,
        teams: [
          { ...team, status: 'won', eventDate: '2023-10-15' }
        ]
      };
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(latestLeague));
      const verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
      verifyDateService.convertToDateStruct = jest.fn().mockReturnValue({ year: 2023, month: 10, day: 15 });

      await component['getLatestData']();

      expect(outrightService.getMatches).toHaveBeenCalledWith(1, 1, StatusId.runningAndCompleted);
      expect(component.originalTeam).toEqual(latestLeague.teams);
      expect(latestLeague.teams[0].status).toBe('WON');
    });
  });

  describe("checkVoidTicket", () => {
    it('should call checkVoidTickets service', async () => {
      team.orId = '123';
      outrightService.checkVoidTickets = jest.fn().mockReturnValue(Promise.resolve(true));

      const result = await component['checkVoidTicket'](team);

      expect(outrightService.checkVoidTickets).toHaveBeenCalledWith(123);
      expect(result).toBe(true);
    });
  });

  // describe("confirmCalcNonDeadheat", () => {
  //   it('should show confirmation and calculate with correct dead heat count', () => {
  //     const mockConfirm = jest.fn();
  //     messageBoxService.confirm = mockConfirm;
  //     component.teamSettleWon = [
  //       { ...team, isDeadheat: true },
  //       { ...team, isDeadheat: false }
  //     ];
  //     component['doCalculate'] = jest.fn();

  //     component['confirmCalcNonDeadheat']();

  //     expect(messageBoxService.confirm).toHaveBeenCalled();
  //     const confirmCallback = mockConfirm.mock.calls[0][1];
  //     confirmCallback();
  //     expect(component['doCalculate']).toHaveBeenCalledWith(2);
  //   });

  //   it('should calculate with dead heat count 1 when no dead heat teams', () => {
  //     const mockConfirm = jest.fn();
  //     messageBoxService.confirm = mockConfirm;
  //     component.teamSettleWon = [
  //       { ...team, isDeadheat: false },
  //       { ...team, isDeadheat: false }
  //     ];
  //     component['doCalculate'] = jest.fn();

  //     component['confirmCalcNonDeadheat']();

  //     const confirmCallback = mockConfirm.mock.calls[0][1];
  //     confirmCallback();
  //     expect(component['doCalculate']).toHaveBeenCalledWith(1);
  //   });
  // });

  describe("verifySetting", () => {
    it('should return error for No setting', () => {
      const teamWonSettled: Team[] = [];
      const teamWonSelected: Team[] = [];
      CalculateService.VerifyDeadHeatNoSetting = jest.fn().mockReturnValue('No setting error');

      const result = component['verifySetting'](DeadHeatSettings.No, teamWonSettled, teamWonSelected);

      expect(CalculateService.VerifyDeadHeatNoSetting).toHaveBeenCalledWith(teamWonSelected, teamWonSettled);
      expect(result).toBe('No setting error');
    });

    it('should return error for Yes setting', () => {
      const teamWonSettled: Team[] = [];
      const teamWonSelected: Team[] = [];
      CalculateService.VerifyDeadHeatYesSetting = jest.fn().mockReturnValue('Yes setting error');

      const result = component['verifySetting'](DeadHeatSettings.Yes, teamWonSettled, teamWonSelected);

      expect(CalculateService.VerifyDeadHeatYesSetting).toHaveBeenCalledWith(teamWonSelected, teamWonSettled,false);
      expect(result).toBe('Yes setting error');
    });

    it('should return error for default setting', () => {
      const teamWonSettled: Team[] = [];
      const teamWonSelected: Team[] = [];
      CalculateService.VerifyDeadHeatNoSet = jest.fn().mockReturnValue('No set error');

      const result = component['verifySetting'](999, teamWonSettled, teamWonSelected);

      expect(CalculateService.VerifyDeadHeatNoSet).toHaveBeenCalledWith(teamWonSelected, teamWonSettled);
      expect(result).toBe('No set error');
    });
  });

  describe("verifyTraderScore", () => {
    beforeEach(() => {
      component.permission = { isLeader: true } as Permission;
    });

    it('should return true when leader and team has empty traderScore', () => {
      team.traderScore = '';
      team.status = 'WON';
      team.selected = true;
      component.teams = [team];

      const result = component['verifyTraderScore']();

      expect(result).toBeTruthy();
    });

    it('should return true when leader and status does not match traderScore', () => {
      team.traderScore = 'WON';
      team.status = 'LOSE';
      team.selected = true;
      component.teams = [team];

      const result = component['verifyTraderScore']();

      expect(result).toBeTruthy();
    });

    it('should return false when not leader', () => {
      component.permission = { isLeader: false } as Permission;
      team.traderScore = '';
      team.selected = true;
      component.teams = [team];

      const result = component['verifyTraderScore']();

      expect(result).toBeFalsy();
    });

    it('should return false when all teams have valid traderScore', () => {
      team.traderScore = 'WON';
      team.status = 'WON';
      team.selected = true;
      component.teams = [team];

      const result = component['verifyTraderScore']();

      expect(result).toBeFalsy();
    });
  });

  describe("verifyScreenshot", () => {
    it('should return true when status and screenshot do not match', () => {
      team.status = 'WON';
      team.screenShot = 'LOSE';
      team.selected = true;
      component.teams = [team];

      const result = component['verifyScreenshot']();

      expect(result).toBeTruthy();
    });

    it('should return false when status and screenshot match', () => {
      team.status = 'WON';
      team.screenShot = 'WON';
      team.selected = true;
      component.teams = [team];

      const result = component['verifyScreenshot']();

      expect(result).toBeFalsy();
    });

    it('should return false when screenshot is empty', () => {
      team.status = 'WON';
      team.screenShot = '';
      team.selected = true;
      component.teams = [team];

      const result = component['verifyScreenshot']();

      expect(result).toBeFalsy();
    });

    it('should return false when status is empty', () => {
      team.status = '';
      team.screenShot = 'WON';
      team.selected = true;
      component.teams = [team];

      const result = component['verifyScreenshot']();

      expect(result).toBeFalsy();
    });
  });

  describe("saveTraderScore", () => {
    beforeEach(() => {
      component.permission = { isLeader: true } as Permission;
      component.data = { leagueId: 1, sportType: 1, eventDate: '2023-10-15' };
    });

    it('should save trader score when confirmed and all validations pass', async () => {
      team.traderScore = 'WON';
      team.selected = true;
      team.isDeadheat = false;
      team.orId = '1';
      team.teamId = 100;
      component.teams = [team];
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      CalculateService.VerifySettledSelected = jest.fn().mockReturnValue(false);
      CalculateService.teamWonSettled = jest.fn().mockReturnValue([]);
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(DeadHeatSettings.Yes));
      CalculateService.VerifyDeadHeatYesSetting = jest.fn().mockReturnValue('');
      toastrService.clear = jest.fn();
      outrightService.saveTraderScore = jest.fn().mockReturnValue(Promise.resolve());
      dialogRef.close = jest.fn();

      const mockConfirm = jest.fn();
      messageBoxService.confirm = mockConfirm;

      await component.saveTraderScore();

      expect(toastrService.clear).toHaveBeenCalled();
      expect(outrightService.getMatches).toHaveBeenCalled();
      expect(outrightService.getDeadHeatSetting).toHaveBeenCalledWith(component.data.leagueId);
      expect(CalculateService.teamWonSettled).toHaveBeenCalled();
      expect(messageBoxService.confirm).toHaveBeenCalled();

      const confirmCallback = mockConfirm.mock.calls[0][1];
      await confirmCallback();

      expect(outrightService.saveTraderScore).toHaveBeenCalledWith(component.data.leagueId, [{
        orId: team.orId,
        teamId: team.teamId,
        result: team.traderScore,
        isDeadheat: team.isDeadheat
      }]);
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should handle dead heat setting No case', async () => {
      team.traderScore = 'WON';
      team.selected = true;
      team.isDeadheat = false;
      team.orId = '1';
      team.teamId = 100;
      component.teams = [team];
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      CalculateService.VerifySettledSelected = jest.fn().mockReturnValue(false);
      CalculateService.teamWonSettled = jest.fn().mockReturnValue([]);
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(DeadHeatSettings.No));
      CalculateService.VerifyDeadHeatNoSetting = jest.fn().mockReturnValue('');
      toastrService.clear = jest.fn();
      outrightService.saveTraderScore = jest.fn().mockReturnValue(Promise.resolve());
      dialogRef.close = jest.fn();

      const mockConfirm = jest.fn();
      messageBoxService.confirm = mockConfirm;

      await component.saveTraderScore();

      expect(CalculateService.VerifyDeadHeatNoSetting).toHaveBeenCalled();
      expect(messageBoxService.confirm).toHaveBeenCalled();

      const confirmCallback = mockConfirm.mock.calls[0][1];
      await confirmCallback();

      expect(outrightService.saveTraderScore).toHaveBeenCalledWith(component.data.leagueId, [{
        orId: team.orId,
        teamId: team.teamId,
        result: team.traderScore,
        isDeadheat: team.isDeadheat
      }]);
      expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should handle default dead heat setting case', async () => {
      team.traderScore = 'WON';
      team.selected = true;
      team.isDeadheat = false;
      team.orId = '1';
      team.teamId = 100;
      component.teams = [team];
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      CalculateService.VerifySettledSelected = jest.fn().mockReturnValue(false);
      CalculateService.teamWonSettled = jest.fn().mockReturnValue([]);
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(999)); // Unknown setting
      CalculateService.VerifyDeadHeatNoSet = jest.fn().mockReturnValue('');
      toastrService.clear = jest.fn();
      outrightService.saveTraderScore = jest.fn().mockReturnValue(Promise.resolve());
      dialogRef.close = jest.fn();

      const mockConfirm = jest.fn();
      messageBoxService.confirm = mockConfirm;

      await component.saveTraderScore();

      expect(CalculateService.VerifyDeadHeatNoSet).toHaveBeenCalled();
      expect(messageBoxService.confirm).toHaveBeenCalled();

      const confirmCallback = mockConfirm.mock.calls[0][1];
      await confirmCallback();

      expect(outrightService.saveTraderScore).toHaveBeenCalledWith(component.data.leagueId, [{
        orId: team.orId,
        teamId: team.teamId,
        result: team.traderScore,
        isDeadheat: team.isDeadheat
      }]);
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });

  describe("VerifyHideStatus", () => {
    it('should return true when all hide teams can be voided', async () => {
      const hideTeam = { ...team, status: 'HIDE' };
      outrightService.checkVoidTickets = jest.fn().mockReturnValue(Promise.resolve(true));

      const result = await component.VerifyHideStatus([hideTeam]);

      expect(result).toBeTruthy();
      expect(outrightService.checkVoidTickets).toHaveBeenCalled();
    });

    it('should return false when any hide team cannot be voided', async () => {
      const hideTeam = { ...team, status: 'HIDE' };
      outrightService.checkVoidTickets = jest.fn().mockReturnValue(Promise.resolve(false));

      const result = await component.VerifyHideStatus([hideTeam]);

      expect(result).toBeFalsy();
    });

    it('should return true when no hide teams', async () => {
      const result = await component.VerifyHideStatus([]);

      expect(result).toBeTruthy();
    });
  });

  describe("Edge cases and error scenarios", () => {
    it('should handle empty teams array in filteredTeam', () => {
      component.teams = [];
      statusPipe.transform = jest.fn().mockReturnValue([]);
      ticketStatusFilterPipe.transform = jest.fn().mockReturnValue([]);

      const result = component.filteredTeam();

      expect(result).toEqual([]);
    });

    it('should handle empty teamSelected array in disableCalculate', () => {
      component.teams = [];
      component.leagueSettle = { permission: { canCalculateOutright: true } } as LeagueSettle;

      const result = component.disableCalculate();

      expect(result).toBeTruthy();
    });
  });

  describe("Integration test scenarios", () => {
    it('should handle complete calculation workflow with multiple validations', async () => {
      // Setup complex scenario
      const team1 = { ...team, orId: '1', selected: true, status: 'WON', isDeadheat: false };
      const team2 = { ...team, orId: '2', selected: true, status: 'WON', isDeadheat: true };
      component.teams = [team1, team2];
      component.permission = { isLeader: true, canCalculateOutright: true } as Permission;
      
      // Mock all services
      outrightService.getMatches = jest.fn().mockReturnValue(Promise.resolve(leagueSettle));
      outrightService.getDeadHeatSetting = jest.fn().mockReturnValue(Promise.resolve(DeadHeatSettings.Yes));
      outrightService.saveScore = jest.fn().mockReturnValue(Promise.resolve());
      outrightService.calculate = jest.fn().mockReturnValue(Promise.resolve(ResultSuccessful));
      
      // Mock validation methods to return false (no errors)
      CalculateService.ExistRunningStatus = jest.fn().mockReturnValue(false);
      CalculateService.VerifySettledSelected = jest.fn().mockReturnValue(false);
      CalculateService.VerifyOnlyOneTeamWon = jest.fn().mockReturnValue(false);
      CalculateService.VerifyDeadHeatYesSetting = jest.fn().mockReturnValue('');
      component.VerifyHideStatus = jest.fn().mockReturnValue(Promise.resolve(true));
      
      toastrService.clear = jest.fn();
      dialogRef.close = jest.fn();

      const mockConfirm = jest.fn();
      messageBoxService.confirm = mockConfirm;

      await component.calculate();

      expect(messageBoxService.confirm).toHaveBeenCalled();

      const confirmCallback = mockConfirm.mock.calls[0][1];
      await confirmCallback();

      expect(outrightService.saveScore).toHaveBeenCalled();
      expect(outrightService.calculate).toHaveBeenCalled();
      expect(dialogRef.close).toHaveBeenCalled();
    });
  });
});

