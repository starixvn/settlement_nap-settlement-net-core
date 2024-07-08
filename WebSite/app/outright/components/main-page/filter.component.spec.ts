import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { OutrightService } from '../../services';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { BlockUIService, HttpRequestService, MessageBoxService, VerifyDateService } from '../../../shared/services';

import { FilterComponent } from './filter.component';
import { SportLeagueFilter, SportLeague } from '../../models';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ItemsSelect, League, Sport } from '../../../shared/models';
import { SportType } from '../../../shared/constants';
import { Resources } from '../../constants/resources';

describe('FilterComponent', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let verifyDateService: VerifyDateService;
    let outrightService: OutrightService;
    let messageBoxService: MessageBoxService;

    const league: League = {
        leagueId: 1,
        leagueName: "test",
        sportType: SportType.soccer,
        sportName: 'soccer',
        group: ''
    }

    const sport: Sport = {
        sportType: SportType.soccer,
        sportName: 'soccer',
        group: ''
    }

    const date = new Date();

    const sportLeague: SportLeague = {
        leagueMatch: [],
        sportName: '',
        collapsed: false
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonModule,
                FormsModule,
                DatepickerComponent,
                HttpClientModule,
                FilterComponent,
                BrowserAnimationsModule
            ],
            providers: [
                OutrightService,
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
        outrightService = fixture.debugElement.injector.get(OutrightService);
        verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        jest.spyOn(messageBoxService, 'alert');

        fixture.detectChanges();
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('select date', () => {
        beforeEach(() => {
            const updateList = { ...component.sportOptions$.getValue(), items: [] };
            component.sportOptions$.next(updateList);
        })

        it('onSelectFromDate - should return leagues correct date.', fakeAsync(() => {
            const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
            const toDate: NgbDateStruct = { day: date.getUTCDay() + 1, month: date.getUTCMonth(), year: date.getUTCFullYear() };

            const sportLeague: SportLeagueFilter = { leagues: [league], sports: [sport] };
            outrightService.getSportLeague = jest.fn().mockResolvedValue(sportLeague);
            component.toDate = toDate;

            component.onSelectFromDate(fromDate);
            tick();

            expect(component.leagueOptions$.getValue().items.length).toEqual(1);
        }));

        it('onSelectToDate - should return leagues correct date.', fakeAsync(() => {
            const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
            const toDate: NgbDateStruct = { day: date.getUTCDay() + 1, month: date.getUTCMonth(), year: date.getUTCFullYear() };

            const sportLeague: SportLeagueFilter = { leagues: [league], sports: [sport] };
            outrightService.getSportLeague = jest.fn().mockResolvedValue(sportLeague);
            component.fromDate = fromDate;

            component.onSelectToDate(toDate);
            tick();

            expect(component.leagueOptions$.getValue().items.length).toEqual(1);
        }));

        describe('enableToDateHandler', () => {
            it('should set null to toDate when button not selected.', fakeAsync(() => {
                component.enableToDate = false;

                const sportLeague: SportLeagueFilter = { leagues: [league], sports: [sport] };
                outrightService.getSportLeague = jest.fn().mockReturnValue(Promise.resolve(sportLeague));
                const toDate: NgbDateStruct = { day: date.getUTCDay() + 1, month: date.getUTCMonth(), year: date.getUTCFullYear() };
                component.toDate = toDate;
                component.enableToDateHandler();

                expect(component.toDate).toBeNull();
            }))

            it('should set today to toDate when button selected.', fakeAsync(() => {
                component.enableToDate = true;

                const sportLeague: SportLeagueFilter = { leagues: [league], sports: [sport] };
                outrightService.getSportLeague = jest.fn().mockReturnValue(Promise.resolve(sportLeague));
                const toDate: NgbDateStruct = { day: date.getUTCDay() + 1, month: date.getUTCMonth(), year: date.getUTCFullYear() };
                const today: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
                component.today = today;
                component.toDate = toDate;
                component.enableToDateHandler();

                expect(component.toDate.day).toEqual(today.day);
            }))
        });
    })



    it('onSelectSport - should return leagues select sport', fakeAsync(() => {
        const leagueBadminton: League = {
            leagueId: 2,
            leagueName: "test",
            sportType: SportType.badminton,
            sportName: 'badminton',
            group: ''
        }
        const originalLeagues: League[] = [league, leagueBadminton];
        component.originalLeagues = originalLeagues;

        component.onSelectSport([new ItemsSelect(SportType.soccer, '1', 'soccer', true, false, false, [])]);
        tick();

        expect(component.leagueOptions$.getValue().items.length).toEqual(1);
    }));

    describe('search method', () => {
        it('should show error message date when select wrong from date and to date.', () => {
            component.enableToDate = true;
            verifyDateService.validDate = jest.fn().mockReturnValue(false);
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Resources.invalidDate);
        });

        it('should not validate date when toDate is disable', () => {
            component.enableToDate = false;
            verifyDateService.validDate = jest.fn();
            component.sportTypesSelected = ['1'];
            outrightService.filter = jest.fn();


            component.search().then(() => {
                expect(verifyDateService.validDate).not.toHaveBeenCalled();
            });
        });

        it('should show error message when not select any sport.', () => {
            component.enableToDate = false;
            component.sportTypesSelected = [];

            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Resources.atLeastSport);
        });

        it('should call filter method and event emit when pass all validation.', async () => {
            component.enableToDate = false;
            verifyDateService.validDate = jest.fn();
            component.sportTypesSelected = ['1'];
            outrightService.filter = jest.fn().mockReturnValue(Promise.resolve(sportLeague));
            jest.spyOn(component.searchAction, 'emit');
            jest.spyOn(component.requestEmitter, 'emit');

            await component.search();

            expect(outrightService.filter).toHaveBeenCalled();
            expect(component.searchAction.emit).toHaveBeenCalled();
            expect(component.requestEmitter.emit).toHaveBeenCalled();
        });
    });
});
