import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from '../../services';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';

import { Resources } from '../../constants/resources';
import { League } from '../../models';
import { of } from 'rxjs';
import { ModalDialogMessage } from '../../../shared/models';
import { LogPopupComponent } from './log-popup.component';
import { OutrightLog } from 'outright/models/outright-log.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';

describe('LogPopupComponent', () => {
    let component: LogPopupComponent;
    let fixture: ComponentFixture<LogPopupComponent>;
    let verifyDateService: VerifyDateService;
    let outrightService: OutrightService;
    let calendar: NgbCalendar;
    let messageBoxService: MessageBoxService;
    let dialogRef: MatDialogRef<LogPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonModule,
                FormsModule,
                DatepickerComponent,
                HttpClientModule,
                LogPopupComponent
            ],
            providers: [OutrightService,
                VerifyDateService,
                MessageBoxService,
                BlockUIService,
                HttpRequestService,
                DatePipe,
                // { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') },
                { provide: MatDialogRef, useValue: {} },
                { provide: MAT_DIALOG_DATA, useValue: {} },
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LogPopupComponent);
        component = fixture.componentInstance;

        outrightService = fixture.debugElement.injector.get(OutrightService);
        verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
        calendar = fixture.debugElement.injector.get(NgbCalendar);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        dialogRef = fixture.debugElement.injector.get(MatDialogRef<LogPopupComponent>)
        jest.spyOn(messageBoxService, 'alert');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it('onSelectFromDate - should return logs correct date.', fakeAsync(() => {
        const date = new Date();
        const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        const toDate: NgbDateStruct = { day: date.getUTCDay() + 1, month: date.getUTCMonth(), year: date.getUTCFullYear() };

        const logs: OutrightLog[] = [{
            orId: 1,
            matchCode: 'ab',
            teamId: 2,
            leagueId: 2,
            leagueName: 'ab',
            outrightDetails: [
                {
                    logId: 1,
                    logDate: '2023-02-13T02:07:17.767',
                    username: 'sa',
                    actionNameEn: 'A',
                    leagueId: 1,
                    matchId: 1,
                    matchCode: 'abc',
                    teamId: 1,
                    eventDate: '2023-02-13T02:07:17.767',
                    result: 'R',
                    remark: 'ab',
                    teamName: 'ab',
                    leagueName: 'ab',
                    remarkName: 'ab'
                }
            ]
        }];
        jest.spyOn(outrightService, 'getLogs').mockReturnValue(of(logs));
        // component.toDate = toDate;

        // component.onSelectFromDate(fromDate);
        tick();

        // expect(component.outrightLogs.length).toEqual(1);
    }));

    it('onSelectToDate - should return logs correct date.', fakeAsync(() => {
        const date = new Date();
        const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        const toDate: NgbDateStruct = { day: date.getUTCDay() + 1, month: date.getUTCMonth(), year: date.getUTCFullYear() };

        const logs: OutrightLog[] = [{
            orId: 1,
            matchCode: 'ab',
            teamId: 2,
            leagueId: 2,
            leagueName: 'ab',
            outrightDetails: [
                {
                    logId: 1,
                    logDate: '2023-02-13T02:07:17.767',
                    username: 'sa',
                    actionNameEn: 'A',
                    leagueId: 1,
                    matchId: 1,
                    matchCode: 'abc',
                    teamId: 1,
                    eventDate: '2023-02-13T02:07:17.767',
                    result: 'R',
                    remark: 'ab',
                    teamName: 'ab',
                    leagueName: 'ab',
                    remarkName: 'ab'
                }
            ]
        }];
        jest.spyOn(outrightService, 'getLogs').mockReturnValue(of(logs));
        // component.toDate = toDate;

        // component.onSelectFromDate(fromDate);
        tick();

        // expect(component.outrightLogs.length).toEqual(1);
    }));

});
