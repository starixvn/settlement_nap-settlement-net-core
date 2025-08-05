import { TeamSettle } from './../../models/team.model';
import { LogPopupComponent } from './../popup/log-popup.component';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from '../../services';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';

import { LeagueTeamComponent } from './league-team.component';
import { DynamicHeightDirective } from '../../../shared/directives';
import { LeagueMatch } from '../../models/league-match.model';
import { MatDialog } from '@angular/material/dialog';
import { UncalculatePopupComponent } from '../popup/uncalculate-popup.component';
import { CalculatePopupComponent } from '../popup/calculate-popup.component';
import { of } from 'rxjs';
import { ToastrModule } from 'ngx-toastr';

describe('LeagueTeamComponent', () => {
    let component: LeagueTeamComponent;
    let fixture: ComponentFixture<LeagueTeamComponent>;
    let dialog: MatDialog;

    const date = new Date();
    const dateTime: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };

    const leagueMatch: LeagueMatch = {
        leagueId: 1,
        leagueName: 'ABC',
        teams: [{
            matchCode: '1',
            orId: '1',
            kickOffTime: new Date(),
            sportType: 1,
            status: 'running',
            leagueId: 4545,
            leagueName: 'AB',
            teamId: 1,
            teamName: 'MU',
            betCount: 1,
            isDeadheat: true,
            disableDeadheat: false,
            selected: false,
            eventDate: '',
            dateTime: dateTime,
            oddsStatus: 'lost',
            statusClass: '',
            totalCal: 0,
            totalRunning: 0,
            totalHide: 0,
            originalStatus: ''
        }],
        collapsed: false,
        eventDate: '',
        deadHeat: false,
        deadHeatClass: ''
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonModule,
                FormsModule,
                DatepickerComponent,
                HttpClientModule,
                DynamicHeightDirective,
                LeagueTeamComponent,
                ToastrModule.forRoot()
            ],
            providers: [OutrightService,
                VerifyDateService,
                MessageBoxService,
                BlockUIService,
                HttpRequestService,
                DatePipe,
                DialogBoxService
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LeagueTeamComponent);
        component = fixture.componentInstance;
        dialog = fixture.debugElement.injector.get(MatDialog);
        jest.spyOn(dialog, 'open');
        fixture.detectChanges();
        component.outright = {
            permission: {
                canCalculateOutright: true,
                canUncalculateOutright: true,
                isLeader: true
            },
            sportLeague: []
        }
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open popup called when call function viewLog', () => {
        const data = { "data": { "leagueId": 1, "matchCode": "1", "matchId": null }, "hasBackdrop": true, "height": "650px", "panelClass": "log-modalbox", "width": "1200px" }
        component.viewLog(leagueMatch);

        expect(dialog.open).toHaveBeenCalledWith(LogPopupComponent, data);

    })

    describe('calculatePopup', () => {
        it('should open popup called when call function unCalculatePopup', () => {
            const data = { "data": { "leagueId": 1, "sportType": 1 }, "disableClose": true, "hasBackdrop": true, "height": "550px", "width": "800px" }
            component.uncalculatePopup(leagueMatch);

            expect(dialog.open).toHaveBeenCalledWith(UncalculatePopupComponent, data);

        });

        it('should set new status when calculated', () => {
            dialog.open = jest.fn().mockReturnValue({ afterClosed: () => of('1') });

            component.uncalculatePopup(leagueMatch);

            expect(leagueMatch.teams[0].status).toEqual('Running');
        })
    })

    describe('calculatePopup', () => {
        it('should open popup called when call function calculatePopup', () => {
            const data = { "data": { "eventDate": "", "leagueId": 1, "sportType": 1 }, "disableClose": true, "hasBackdrop": true, "height": "100%", "width": "930px" };
            component.calculatePopup(leagueMatch);

            expect(dialog.open).toHaveBeenCalledWith(CalculatePopupComponent, data);
        });

        it('should set new status when calculated', () => {
            dialog.open = jest.fn().mockReturnValue({ afterClosed: () => of([new TeamSettle('1', '1', false, 'won', '')]) });

            component.calculatePopup(leagueMatch);

            expect(leagueMatch.teams[0].status).toEqual('won');
        })
    });


});
