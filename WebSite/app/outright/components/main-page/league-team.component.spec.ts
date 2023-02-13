import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from '../../services';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { BlockUIService, DialogBoxService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';

import { LeagueTeamComponent } from './league-team.component';
import { DynamicHeightDirective } from '../../../shared/directives';
import { LeagueMatch } from '../../models/league-match.model';
import { MatDialog } from '@angular/material/dialog';

describe('LeagueTeamComponent', () => {
    let component: LeagueTeamComponent;
    let fixture: ComponentFixture<LeagueTeamComponent>;
    let verifyDateService: VerifyDateService;
    let outrightService: OutrightService;
    let calendar: NgbCalendar;
    let messageBoxService: MessageBoxService;
    let dialog: MatDialog;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonModule,
                FormsModule,
                DatepickerComponent,
                HttpClientModule,
                DynamicHeightDirective,
                LeagueTeamComponent
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

        outrightService = fixture.debugElement.injector.get(OutrightService);
        verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
        calendar = fixture.debugElement.injector.get(NgbCalendar);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        dialog = fixture.debugElement.injector.get(MatDialog);;
        jest.spyOn(dialog, 'open')
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should open popup called when call function viewLog', () => {
        const date = new Date();
        const dateTime: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        const leagueMatch: LeagueMatch = {
            leagueId: 1,
            leagueName: 'ABC',
            teams: [{
                matchCode: '1',
                orId: 'ab',
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
                isSettled: true,
                selected: false,
                eventDate: '',
                dateTime: dateTime,
                oddsStatus: 'running'
            }]

        }
        component.outright = {
            permission: {
                canCalculateOutright: true,
                canUncalculateOutright: true
            },
            leagueMatch: []
        }

        component.viewLog(leagueMatch);

        expect(dialog.open).toHaveBeenCalled();

    })

    it('should open popup called when call function unCalculatePopup', () => {
        const date = new Date();
        const dateTime: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        const leagueMatch: LeagueMatch = {
            leagueId: 1,
            leagueName: 'ABC',
            teams: [{
                matchCode: '1',
                orId: 'ab',
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
                isSettled: true,
                selected: false,
                eventDate: '',
                dateTime: dateTime,
                oddsStatus: 'running'
            }]

        }
        component.outright = {
            permission: {
                canCalculateOutright: true,
                canUncalculateOutright: true
            },
            leagueMatch: []
        }

        component.viewLog(leagueMatch);

        expect(dialog.open).toHaveBeenCalled();

    });

    it('should open popup called when call function calculatePopup', () => {
        const date = new Date();
        const dateTime: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        const leagueMatch: LeagueMatch = {
            leagueId: 1,
            leagueName: 'ABC',
            teams: [{
                matchCode: '1',
                orId: 'ab',
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
                isSettled: true,
                selected: false,
                eventDate: '',
                dateTime: dateTime,
                oddsStatus: 'running'
            }]

        }
        component.outright = {
            permission: {
                canCalculateOutright: true,
                canUncalculateOutright: true
            },
            leagueMatch: []
        }

        component.viewLog(leagueMatch);

        expect(dialog.open).toHaveBeenCalled();

    });


});
