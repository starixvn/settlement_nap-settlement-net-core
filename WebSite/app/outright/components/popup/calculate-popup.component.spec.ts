import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { StatusPipe } from '../../pipes/status-pipe';
import { CalculateService, OutrightService } from '../../services';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';

import { CalculatePopupComponent } from './calculate-popup.component';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { LeagueSettle, Permission, Team } from '../../models';
import * as exp from 'constants';

describe('CalculatePopupComponent', () => {
  let component: CalculatePopupComponent;
  let fixture: ComponentFixture<CalculatePopupComponent>;
  let outrightService: OutrightService;

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
        { provide: MatDialogRef, useValue: {} },
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
    fixture.detectChanges();
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
        tick()
        const actualTeam = component.teams[0];

        expect(actualTeam.status).toEqual(status.toUpperCase());
        expect(actualTeam.eventDate).toEqual(eventDate);
        expect(actualTeam.disableDeadheat).toEqual(disableDeadHeat);
      }));
  });
});
