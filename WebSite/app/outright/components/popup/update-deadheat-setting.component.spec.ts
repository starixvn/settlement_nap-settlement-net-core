import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastContainerDirective, ToastrModule, ToastrService } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { UpdateDeadheatSettingComponent } from './update-deadheat-setting.component';
import { OutrightService } from '../../services';
import { HttpRequestService } from '../../../shared/services';
import { MessageBoxService } from '../../../shared/services/message-box.service.native';
import { BlockUIService } from '../../../shared/services/block-ui.service';
import { LeagueSettle, Team } from '../../models';
import { Language } from '../../../shared/language.native';
import { HttpClientModule } from '@angular/common/http';

describe('UpdateDeadheatSettingComponent', () => {
  let component: UpdateDeadheatSettingComponent;
  let fixture: ComponentFixture<UpdateDeadheatSettingComponent>;
  let outrightService: OutrightService;
  let toastrService: ToastrService;
  let messageBoxService: MessageBoxService;
  let dialogRef: MatDialogRef<UpdateDeadheatSettingComponent>;

  const leagueSettle: LeagueSettle = {
    leagueName: '',
    sportName: '',
    teams: [],
    permission: null,
    moveBetsDay: '',
    today: ''
  };

  const team: Team = {
    isDeadheat: false,
    disableDeadheat: false,
    selected: false,
    eventDate: '',
    dateTime: undefined,
    oddsStatus: '',
    statusClass: '',
    totalCal: 0,
    totalRunning: 0,
    totalHide: 0,
    originalStatus: '',
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

  const dialogMock = {
    close: (value?: any) => { }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        DragDropModule,
        MatDialogModule,
        FormsModule,
        HttpClientModule,
        ToastrModule.forRoot(),
        UpdateDeadheatSettingComponent
      ],
      providers: [
        OutrightService,
        HttpRequestService,
        MessageBoxService,
        BlockUIService,
        { provide: MatDialogRef, useValue: dialogMock },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: ToastrService, useClass: ToastrService },
        ToastContainerDirective
      ],
      teardown: { destroyAfterEach: false }
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateDeadheatSettingComponent);
    outrightService = fixture.debugElement.injector.get(OutrightService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    dialogRef = fixture.debugElement.injector.get(MatDialogRef);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set expectedSetting and overlayContainer', () => {
      outrightService.getMatches = jest.fn().mockResolvedValue(leagueSettle);
      component.data = { deadHeatSetting: true, leagueId: 1, sportType: 1 };
      toastrService.overlayContainer = null;
      
      // Mock the toastContainer ViewChild
      component.toastContainer = {} as ToastContainerDirective;

      component.ngOnInit();

      expect(component.expectedSetting).toBe(true);
      expect(toastrService.overlayContainer).toBeTruthy();
    });

    it('should call getMatches', () => {
      outrightService.getMatches = jest.fn().mockResolvedValue(leagueSettle);

      component.ngOnInit();

      expect(outrightService.getMatches).toHaveBeenCalled();
    });
  });


  describe('close', () => {
    it('should call dialogRef.close', () => {
      dialogRef.close = jest.fn();

      component.close();

      expect(dialogRef.close).toHaveBeenCalled();
    });
  });

  describe('updateSetting', () => {
    beforeEach(() => {
      component.leagueSettle = leagueSettle;
    });

    it('should show error toastr when expectedSetting is not null and teamWonQuantity > 1', () => {
      component.expectedSetting = true;
      team.status = 'Won';
      component.leagueSettle.teams = [team, team];

      component.clearError = jest.fn();
      toastrService.error = jest.fn();

      component.updateSetting();
      expect(component.clearError).toHaveBeenCalled();
      expect(toastrService.error).toHaveBeenCalledWith(Language.Outright.multiTeamWon);
    });

    it('should call messageBoxService.confirm and sendRequest when expectedSetting is not null and teamWonQuantity <= 1', () => {
      component.data.deadHeatSetting = null;
      component.expectedSetting = true;
      component.leagueSettle.teams = [team];

      messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());
      outrightService.updateDeatHeat = jest.fn().mockResolvedValue(null);

      component.updateSetting();

      expect(component.confirmationDialogMessage.message).toEqual("Are you sure you want to change Dead Heat Setting from Not Set to Yes?");
      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(outrightService.updateDeatHeat).toHaveBeenCalled();
    });

    it('should call messageBoxService.confirm when expectedSetting is null', () => {
      component.data.deadHeatSetting = true;
      component.expectedSetting = null;

      messageBoxService.confirm = jest.fn().mockImplementation((message, callback) => callback());
      outrightService.updateDeatHeat = jest.fn().mockResolvedValue(null);

      component.updateSetting();

      expect(component.confirmationDialogMessage.message).toEqual("Are you sure you want to change Dead Heat Setting from Yes to Not Set?");
      expect(messageBoxService.confirm).toHaveBeenCalled();
      expect(outrightService.updateDeatHeat).toHaveBeenCalled();
    });
  });


  describe('clearError', () => {
    it('should call toastrService.clear', () => {
      toastrService.clear = jest.fn();

      component.clearError();

      expect(toastrService.clear).toHaveBeenCalled();
    });
  });
});