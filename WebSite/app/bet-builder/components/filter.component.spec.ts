import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { NgbModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { FilterComponent } from '.';
import { DatepickerComponent } from '../../shared/components/date-picker/date-picker.component';
import { ModalDialogComponent, NewMultipleSelectComponent } from "../../shared/components";
import { HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService } from '../../shared/services';
import { ItemsSelect } from '../../shared/models';
import { SportType, MultiSports } from '../models';
import { RequestService, GenerateListService } from '../services';
import { MaterialModule } from '../../shared/material-module';

describe('Bet Builder - Filter Component', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let requestService: RequestService;
    let generateListService: GenerateListService;
    let verifyDateService: VerifyDateService;
    let messageBoxService: MessageBoxService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                FilterComponent,
                DatepickerComponent,
                ModalDialogComponent,
                NewMultipleSelectComponent
            ],
            providers: [
                VerifyDateService,
                RequestService,
                HttpRequestService,
                GenerateListService,
                BlockUIService,
                MessageBoxService,
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
            ],
        })
            .overrideModule(BrowserDynamicTestingModule, {
                set: {
                    entryComponents: [ModalDialogComponent],
                },
            })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(FilterComponent);
                component = fixture.componentInstance;
                requestService = fixture.debugElement.injector.get(RequestService);
                generateListService = fixture.debugElement.injector.get(GenerateListService);
                verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
            });
    }));

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    describe('search', () => {
        beforeEach(() => {
            component.sportTypesSelected = '1';
            component.leaguesSelected = '123';
            component.fromDate = { year: 2020, month: 8, day: 1 };
            component.toDate = { year: 2020, month: 8, day: 31 };
        });

        it('should emit on click submit', () => {
            const multiSports = {} as MultiSports;
            spyOn(requestService, 'search').and.returnValue(of(multiSports));
            spyOn(component.searchAction, 'emit');

            component.search();

            expect(requestService.search).toHaveBeenCalled();
            expect(component.searchAction.emit).toHaveBeenCalled();
        });

        it('should show alert when date is not valid.', () => {
            spyOn(verifyDateService, 'validDate').and.returnValue(false);
            spyOn(messageBoxService, 'alert');

            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
        });

        it('should show alert when sport selected is empty.', () => {
            component.sportTypesSelected = '';
            spyOn(messageBoxService, 'alert');

            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
        });

        it('should show alert when leagueSelected is empty.', () => {
            component.leaguesSelected = '';
            spyOn(messageBoxService, 'alert');

            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
        });
    });
    it('onSelectLeague - should set leagueSelected.', () => {
        component.leaguesSelected = '';
        const mockItemOne = new ItemsSelect(1, '1', '', true, true, true, []);
        const mockItemTwo = new ItemsSelect(2, '2', '', true, true, true, []);
        const leagueExpect = '1,2';

        component.onSelectLeague([mockItemOne, mockItemTwo]);

        expect(component.leaguesSelected).toEqual(leagueExpect);
    });

    it('onSelectSport - should set SportTypeSelected and get render league.', () => {
        const mockItemOne = new ItemsSelect(1, '1', '', true, true, true, []);
        const mockItemTwo = new ItemsSelect(2, '2', '', true, true, true, []);
        const sportExpect = '1,2';
        spyOn(verifyDateService, 'validDate').and.returnValue(true);
        spyOn(requestService, 'getLeague').and.returnValue(of(""));
        spyOn(generateListService, 'renderLeagues');

        component.onSelectSport([mockItemOne, mockItemTwo]);

        expect(component.sportTypesSelected).toEqual(sportExpect);
        expect(requestService.getLeague).toHaveBeenCalled();
    });

    it('onSelectFromDate - should return right value sports correct date.', () => {
        const sport = new SportType();
        const date = new Date();
        const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        sport.sportType = 1;
        sport.sportName = "mockName";
        const sports: SportType[] = [sport, sport];
        spyOn(requestService, 'getSport').and.returnValue(of(sports));

        component.onSelectFromDate(fromDate);

        expect(component.sportSelect.items.length).toEqual(2);
    });

    it('onSelectToDate - should return right value sports correct date.', () => {
        const sport = new SportType();
        const date = new Date();
        const toDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        sport.sportType = 1;
        sport.sportName = "mockName";
        const sports: SportType[] = [sport, sport];
        spyOn(requestService, 'getSport').and.returnValue(of(sports));

        component.onSelectFromDate(toDate);

        expect(component.sportSelect.items.length).toEqual(2);
    });
});