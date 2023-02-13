import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbCalendar, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from '../../services';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';

import { FilterComponent } from './filter.component';
import { Resources } from '../../constants/resources';
import { League } from '../../models';
import { of } from 'rxjs';
import { ModalDialogMessage } from '../../../shared/models';

describe('FilterComponent', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let verifyDateService: VerifyDateService;
    let outrightService: OutrightService;
    let calendar: NgbCalendar;
    let messageBoxService: MessageBoxService

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonModule,
                FormsModule,
                DatepickerComponent,
                HttpClientModule,
                FilterComponent
            ],
            providers: [OutrightService,
                VerifyDateService,
                MessageBoxService,
                BlockUIService,
                HttpRequestService,
                DatePipe
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterComponent);
        component = fixture.componentInstance;

        outrightService = fixture.debugElement.injector.get(OutrightService);
        verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
        calendar = fixture.debugElement.injector.get(NgbCalendar);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        jest.spyOn(messageBoxService, 'alert');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });


    it('onSelectFromDate - should return leagues correct date.', fakeAsync(() => {
        const date = new Date();
        const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        const toDate: NgbDateStruct = { day: date.getUTCDay() + 1, month: date.getUTCMonth(), year: date.getUTCFullYear() };

        const leagues: League[] = [{ leagueId: 1, leagueName: 'ABC', sportType: 1 }];
        jest.spyOn(outrightService, 'getLeagues').mockReturnValue(of(leagues));
        component.toDate = toDate;

        component.onSelectFromDate(fromDate);
        tick();

        expect(component.leagueOptions.length).toEqual(2);
    }));

    it('onSelectToDate - should return leagues correct date.', fakeAsync(() => {
        const date = new Date();
        const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        const toDate: NgbDateStruct = { day: date.getUTCDay() + 1, month: date.getUTCMonth(), year: date.getUTCFullYear() };

        const leagues: League[] = [{ leagueId: 1, leagueName: 'ABC', sportType: 1 }];
        jest.spyOn(outrightService, 'getLeagues').mockReturnValue(of(leagues));
        component.fromDate = fromDate;

        component.onSelectToDate(toDate);
        tick();

        expect(component.leagueOptions.length).toEqual(2);
    }));

    describe('onSelectSport() method', () => {
        it('should return leagues when correct date.', fakeAsync(() => {
            const leagues: League[] = [{ leagueId: 1, leagueName: 'ABC', sportType: 1 }];
            jest.spyOn(outrightService, 'getLeagues').mockReturnValue(of(leagues));
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(true);

            component.onSelectSport(1);
            tick();

            expect(component.leagueOptions.length).toBeGreaterThanOrEqual(1);
        }));

        it('should return default league when incorrect date.', () => {
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(false);
            component.onSelectSport(1);

            expect(component.leagueOptions[0].leagueId).toEqual(0);
        });
    });

    describe('search method', () => {
        it('should show error message date when select wrong from date and to date.', () => {
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(false);
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Resources.invalidDate);
        });

        it('should call filter method and event emit when pass all validation.', async () => {
            jest.spyOn(outrightService, 'filter').mockReturnValue(of(null));
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(true);
            jest.spyOn(component.searchAction, 'emit');
            jest.spyOn(component.requestEmitter, 'emit');

            await component.search();

            expect(outrightService.filter).toHaveBeenCalled();
            expect(component.searchAction.emit).toHaveBeenCalled();
            expect(component.requestEmitter.emit).toHaveBeenCalled();
        });
    });
});
