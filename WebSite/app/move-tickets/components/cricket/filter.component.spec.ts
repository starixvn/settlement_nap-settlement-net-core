import { DateFilter, MultiSport } from '../../models';
import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NgbModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FilterComponent } from './filter.component';
import { League } from '../../models';
import { MoveTicketsService } from './move-tickets.service';
import { ModalDialogMessage, ItemsSelect } from '../../../shared/models';
import {
    MessageBoxService,
    HttpRequestService,
    BlockUIService,
    VerifyDateService,
    GenerateFilterService,
    DialogBoxService
} from './../../../shared/services';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { NewMultipleSelectComponent } from '../../../shared/components/multiple-select/multiple-select.component';
// TreeViewComponent not found - removing import
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { of } from 'rxjs';
import { MaterialModule } from '../../../shared/material-module';
import { SportType } from '../../../shared/constants';
import { Language } from '../../../shared/language.native';

describe('FilterComponent', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let verifyDateService: VerifyDateService;
    let messageBoxService: MessageBoxService;
    let moveTicketsService: MoveTicketsService;
    let generateListService: GenerateFilterService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                FilterComponent,
            ],
            providers: [
                VerifyDateService,
                MessageBoxService,
                MoveTicketsService,
                HttpRequestService,
                BlockUIService,
                GenerateFilterService,
                DialogBoxService,
                DatePipe,
            ],
            imports: [
                ModalDialogComponent,
                ModalContentDialogComponent,
                DatepickerComponent,
                NewMultipleSelectComponent,
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(FilterComponent);
                component = fixture.componentInstance;
                component.sportTypesSelected = SportType.cricket.toString();
                verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                moveTicketsService = fixture.debugElement.injector.get(MoveTicketsService);
                generateListService = fixture.debugElement.injector.get(GenerateFilterService);
                jest.spyOn(messageBoxService, 'alert').mockReturnValue(undefined);
            });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return date and number item as expected.', fakeAsync(async () => {
        const dateServer: DateFilter = {
            fromDate: "2020/06/20 00:00:00",
            toDate: "2020/06/19 00:00:00",
        };

        jest.spyOn(moveTicketsService, 'getDate').mockReturnValue(of(dateServer));
        jest.spyOn(moveTicketsService, 'getAutoMoveTicketsStatus').mockReturnValue(Promise.resolve(true));
        component.ngOnInit();

        await fixture.whenStable();
        tick();

        expect(component.fromDate).toEqual({ year: 2020, month: 6, day: 20 });
        expect(component.toDate).toEqual({ year: 2020, month: 6, day: 19 });
        expect(component.matchStatusSelect.items.length).toEqual(6);
    }));

    describe('search method', () => {
        it('should show error message date when select wrong from date and to date.', () => {
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(false);
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Language.invalidDate);
        });

        it('should show error message select sport when have not selected any sport.', () => {
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(true);
            component.sportTypesSelected = "";
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Language.atLeastSport);
        });

        it('should show error message select league when have not selected any league.', () => {
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(true);
            component.sportTypesSelected = "2";
            component.leaguesSelected = "";
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Language.atLeastLeague);
        });

        it('should call filter method and event emit when pass all validation.', () => {
            jest.spyOn(moveTicketsService, 'filter').mockReturnValue(of({} as MultiSport));
            jest.spyOn(verifyDateService, 'validDate').mockReturnValue(true);
            jest.spyOn(component.searchAction, 'emit');
            jest.spyOn(component.requestEmitter, 'emit');
            component.sportTypesSelected = "2";
            component.leaguesSelected = "1";
            component.search();

            expect(moveTicketsService.filter).toHaveBeenCalled();
            expect(component.searchAction.emit).toHaveBeenCalled();
            expect(component.requestEmitter.emit).toHaveBeenCalled();
        });
    });

    it('should return value when is existed an item.', () => {
        const items: ItemsSelect[] = [];
        items.push(new ItemsSelect(1, "1", "1", true, true, true, []));
        component.onSelectLeague(items);

        expect(component.leaguesSelected).not.toEqual("");
    });

    it('onSelectFromDate - should return right value leagues correct date.', () => {
        const date = new Date();
        const league = new League();
        league.leagueId = 12345;
        const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        jest.spyOn(moveTicketsService, 'getLeague').mockReturnValue(of([league]));
        jest.spyOn(verifyDateService, 'validDate').mockReturnValue(true);
        component.onSelectFromDate(fromDate);

        expect(component.leagueSelect.items.length).toEqual(1);
    });

    it('onSelectToDate - should return right value leagues correct date.', () => {
        const date = new Date();
        const league = new League();
        league.leagueId = 12345;
        const toDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        jest.spyOn(moveTicketsService, 'getLeague').mockReturnValue(of([league]));
        jest.spyOn(verifyDateService, 'validDate').mockReturnValue(false);
        component.onSelectFromDate(toDate);

        expect(component.leagueSelect.items.length).toEqual(0);
    });


});