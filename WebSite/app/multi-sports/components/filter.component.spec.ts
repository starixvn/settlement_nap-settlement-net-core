import { NgbModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DateFilter, MultiSport, SportMatch } from '../models';
import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync, flush } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
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
import { MultiSportsStore } from '../services/multi-sports.store';
import { filter } from 'rxjs';

describe('MultiSport - FilterComponent', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let verifyDateService: VerifyDateService;
    let messageBoxService: MessageBoxService;
    let multiSportService: MultiSportService;
    let store: MultiSportsStore;

    const item = new ItemsSelect(1, "1", "1", true, true, true, []);

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            providers: [
                VerifyDateService,
                MessageBoxService,
                MultiSportService,
                HttpRequestService,
                MultiSportService,
                BlockUIService,
                GenerateFilterService,
                MultiSportsStore
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
                FilterComponent,
                ModalDialogComponent,
                ModalContentDialogComponent
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(FilterComponent);
                component = fixture.componentInstance;
                verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                multiSportService = fixture.debugElement.injector.get(MultiSportService);
                store = fixture.debugElement.injector.get(MultiSportsStore);
                messageBoxService.alert = jest.fn().mockReturnValue(new ModalDialogMessage());
                
            });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return date and number item as expected.', async () => {
        const dateServer: DateFilter = {
            fromDate: "2020/06/19 00:00:00",
            toDate: "2020/06/20 00:00:00",
        };

        const sportServer: Sport[] = [{ sportType: 2, sportName: "Basketball", group: "All popular sport" }];
        multiSportService.getDate = jest.fn().mockReturnValue(Promise.resolve(dateServer));
        multiSportService.getSport = jest.fn().mockReturnValue(Promise.resolve(sportServer));
        await component.ngOnInit();
      

        fixture.whenStable()
            .then(() => {
                expect(component.fromDate).toEqual({ year: 2020, month: 6, day: 19 });
                expect(component.toDate).toEqual({ year: 2020, month: 6, day: 20 });
                expect(component.sportOptions$.value.items.length).toEqual(1);
                expect(component.holdStatusSelect.items.length).toEqual(6);
                expect(component.matchStatusSelect.items.length).toEqual(6);
                expect(component.overStatusSelect.items.length).toEqual(4);
                expect(component.autoPayoutSelect.items.length).toEqual(3);
            });
    });

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
            const multiSport = new MultiSport();
            multiSport.sports = [new SportMatch()];
            multiSportService.filter = jest.fn().mockReturnValue(Promise.resolve(multiSport));
            verifyDateService.validDate = jest.fn().mockReturnValue(true);
            store.setState = jest.fn();
            component.sportTypesSelected = "2";
            component.leaguesSelected = "1";;

            await component.search();

            expect(multiSportService.filter).toHaveBeenCalled();
            expect(store.setState).toHaveBeenCalled();
            expect(store.request).not.toBeNull();
            expect(store.enableRefresh).toBeTruthy();
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
        it('should return leagues when correct date.', (done) => {
            const league = new League();
            league.leagueId = 1;
            league.leagueName = "ABC";
            const leagues: League[] = [league, league];
            multiSportService.getLeague = jest.fn().mockReturnValue(Promise.resolve(leagues));
            verifyDateService.validDate = jest.fn().mockReturnValue(true);

            component.onSelectSport(items);

            component.leagueOption$.pipe(filter(x => x.items.length > 0)).subscribe(s =>{
                expect(s.items.length).toEqual(2);
                done();
            });
        });

        it('should return empty leagues when incorrect date.', () => {
            verifyDateService.validDate = jest.fn().mockReturnValue(false);
            component.onSelectSport(items);

            expect(component.leagueOption$.value.items.length).toEqual(0);
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

    it('onSelectFromDate - should return right value sports correct date.', (done) => {
        const sport = new Sport();
        const date = new Date();
        const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        sport.sportType = 1;
        sport.sportName = "mockName";
        const sports: Sport[] = [sport, sport];
        multiSportService.getSport = jest.fn().mockReturnValue(Promise.resolve(sports));

        component.onSelectFromDate(fromDate);

        component.sportOptions$.pipe(filter(x => x.items.length > 0)).subscribe(s =>{
            expect(s.items.length).toEqual(2);
            done();
        });
    });

    it('onSelectToDate - should return right value sports correct date.', fakeAsync((done) => {
        const sport = new Sport();
        const date = new Date();
        const toDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        sport.sportType = 1;
        sport.sportName = "mockName";
        const sports: Sport[] = [sport, sport];
        multiSportService.getSport = jest.fn().mockReturnValue(Promise.resolve(sports));

        component.onSelectFromDate(toDate);

        component.sportOptions$.pipe(filter(x => x.items.length > 0)).subscribe(s =>{
            expect(s.items.length).toEqual(2);
            done();
        });
    }));
});