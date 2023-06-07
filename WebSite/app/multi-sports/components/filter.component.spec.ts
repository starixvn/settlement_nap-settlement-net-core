import { NgbModule, NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { DateFilter } from '../models';
import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FilterComponent } from './filter.component';
import { Sport, League } from '../models';
import { Resources } from '../constants';
import { MultiSportService } from '../services';
import { ModalDialogMessage, ItemsSelect } from '../../shared/models';
import {
    MessageBoxService,
    HttpRequestService,
    BlockUIService,
    VerifyDateService,
    GenerateFilterService
} from './../../shared/services';
import { MaterialModule } from '../../shared/material-module';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { DatepickerComponent } from '../../shared/components/date-picker/date-picker.component';
import { NewMultipleSelectComponent } from '../../shared/components/multiple-select/multiple-select.component';
import { DatePipe } from '@angular/common';

describe('MultiSport - FilterComponent', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let verifyDateService: VerifyDateService;
    let messageBoxService: MessageBoxService;
    let multiSportService: MultiSportService;
    let generateFilterService: GenerateFilterService;

    const item = new ItemsSelect(1, "1", "1", true, true, true, []);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                FilterComponent,
                ModalDialogComponent,
                ModalContentDialogComponent
            ],
            providers: [
                VerifyDateService,
                MessageBoxService,
                MultiSportService,
                HttpRequestService,
                MultiSportService,
                BlockUIService,
                GenerateFilterService,
                DatePipe
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
                DatepickerComponent,
                NewMultipleSelectComponent,
            ],
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: {
                    entryComponents: [ModalDialogComponent, ModalContentDialogComponent]
                },
            })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(FilterComponent);
                component = fixture.componentInstance;
                verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                multiSportService = fixture.debugElement.injector.get(MultiSportService);
                generateFilterService = fixture.debugElement.injector.get(GenerateFilterService);
                messageBoxService.alert = jest.fn().mockReturnValue(new ModalDialogMessage());
            });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return date and number item as expected.', fakeAsync(() => {
        const dateServer: DateFilter = {
            fromDate: "2020/06/19 00:00:00",
            toDate: "2020/06/20 00:00:00",
        };

        const sportServer: Sport[] = [{ sportType: 2, sportName: "Basketball", group: "All popular sport" }];
        multiSportService.getDate = jest.fn().mockReturnValue(Promise.resolve(dateServer));
        multiSportService.getSport = jest.fn().mockReturnValue(Promise.resolve(sportServer));
        component.ngOnInit();
        tick();

        fixture.whenStable()
            .then(() => {
                expect(component.fromDate).toEqual({ year: 2020, month: 6, day: 19 });
                expect(component.toDate).toEqual({ year: 2020, month: 6, day: 20 });
                expect(component.sportSelect.items.length).toBeGreaterThanOrEqual(1);
                expect(component.holdStatusSelect.items.length).toEqual(6);
                expect(component.matchStatusSelect.items.length).toEqual(6);
                expect(component.overStatusSelect.items.length).toEqual(4);
                expect(component.autoPayoutSelect.items.length).toEqual(3);
            });
    }));

    describe('search method', () => {
        it('should show error message date when select wrong from date and to date.', () => {
            verifyDateService.validDate = jest.fn().mockReturnValue(false);
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Resources.invalidDate);
        });

        it('should show error message select sport when have not selected any sport.', () => {
            verifyDateService.validDate = jest.fn().mockReturnValue(true);
            component.sportTypesSelected = "";
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Resources.atLeastSport);
        });

        it('should call filter method and event emit when pass all validation.', async () => {
            multiSportService.filter = jest.fn().mockReturnValue(Promise.resolve(""));
            verifyDateService.validDate = jest.fn().mockReturnValue(true);
            component.searchAction.emit = jest.fn()
            component.requestEmitter.emit = jest.fn()
            component.sportTypesSelected = "2";
            component.leaguesSelected = "1";
            await component.search();

            expect(multiSportService.filter).toHaveBeenCalled();
            expect(component.searchAction.emit).toHaveBeenCalled();
            expect(component.requestEmitter.emit).toHaveBeenCalled();
        });
    });

    it('should return value when is existed an item.', () => {
        const items: ItemsSelect[] = [];
        items.push(item);
        component.onSelectLeague(items);

        expect(component.leaguesSelected).not.toEqual("");
    });

    describe('onSelectSport() method', () => {
        const items: ItemsSelect[] = [];
        items.push(item);
        it('should return leagues when correct date.', fakeAsync(() => {
            const league = new League();
            league.leagueId = 1;
            league.leagueName = "ABC";
            const leagues: League[] = [league, league];
            multiSportService.getLeague = jest.fn().mockReturnValue(Promise.resolve(leagues));
            verifyDateService.validDate = jest.fn().mockReturnValue(true);

            component.onSelectSport(items);
            tick();

            expect(component.leagueSelect.items.length).toBeGreaterThanOrEqual(2);
        }));

        it('should return empty leagues when incorrect date.', () => {
            verifyDateService.validDate = jest.fn().mockReturnValue(false);
            component.onSelectSport(items);

            expect(component.leagueSelect.items.length).toEqual(0);
        });
    });

    describe('onSelectHoldStatus() method', () => {

        it('should return right value when selected.', () => {
            const items: ItemsSelect[] = [];
            items.push(item);
            items.push(new ItemsSelect(2, "2", "2", true, true, true, []));
            component.onSelectHoldStatus(items);

            expect(component.holdStatusSelected).toEqual("1,2");
        });

        it('should return default value when not selected.', () => {
            const items: ItemsSelect[] = [];
            component.onSelectHoldStatus(items);

            expect(component.holdStatusSelected).toEqual("0");
        });
    });

    it('onSelectFromDate - should return right value sports correct date.', fakeAsync(() => {
        const sport = new Sport();
        const date = new Date();
        const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        sport.sportType = 1;
        sport.sportName = "mockName";
        const sports: Sport[] = [sport, sport];
        multiSportService.getSport = jest.fn().mockReturnValue(Promise.resolve(sports));

        component.onSelectFromDate(fromDate);
        tick();

        expect(component.sportSelect.items.length).toEqual(2);
    }));

    it('onSelectToDate - should return right value sports correct date.', fakeAsync(() => {
        const sport = new Sport();
        const date = new Date();
        const toDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        sport.sportType = 1;
        sport.sportName = "mockName";
        const sports: Sport[] = [sport, sport];
        multiSportService.getSport = jest.fn().mockReturnValue(Promise.resolve(sports));
        component.onSelectFromDate(toDate);
        tick();

        expect(component.sportSelect.items.length).toEqual(2);
    }));
});