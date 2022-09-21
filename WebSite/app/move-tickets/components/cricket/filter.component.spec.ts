import { DateFilter } from '../../models';
import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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
import {
    DatepickerComponent,
    NewMultipleSelectComponent,
    TreeViewComponent,
    ModalContentDialogComponent,
    ModalDialogComponent,
} from '../../../shared/components';
import { of } from 'rxjs';
import { MaterialModule } from '../../../shared/material-module';
import { SportType } from '../../../shared/constants';
import { Language } from '../../../shared/language';

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
                ModalDialogComponent,
                ModalContentDialogComponent,
                DatepickerComponent,
                NewMultipleSelectComponent,
                TreeViewComponent,
            ],
            providers: [
                VerifyDateService,
                MessageBoxService,
                MoveTicketsService,
                HttpRequestService,
                BlockUIService,
                GenerateFilterService,
                DialogBoxService,
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
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
                component.sportTypesSelected = SportType.cricket.toString();
                verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
                moveTicketsService = fixture.debugElement.injector.get(MoveTicketsService);
                generateListService = fixture.debugElement.injector.get(GenerateFilterService);
                spyOn(messageBoxService, 'alert').and.returnValue(new ModalDialogMessage());
            });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return date and number item as expected.', fakeAsync(() => {
        const dateServer: DateFilter = {
            fromDate: "2020/06/20 00:00:00",
            toDate: "2020/06/19 00:00:00",
        };

        spyOn(moveTicketsService, 'getDate').and.returnValue(of(dateServer));
        component.ngOnInit();

        fixture.whenStable()
            .then(() => {
                expect(component.fromDate).toEqual({ year: 2020, month: 6, day: 20 });
                expect(component.toDate).toEqual({ year: 2020, month: 6, day: 19 });
                expect(component.remarkSelect.items.length).toEqual(6);
                expect(component.matchStatusSelect.items.length).toEqual(7);
                expect(component.ticketsStatusSelect.items.length).toEqual(4);
            });
    }));

    describe('search method', () => {
        it('should show error message date when select wrong from date and to date.', () => {
            spyOn(verifyDateService, 'validDate').and.returnValue(false);
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Language.invalidDate);
        });

        it('should show error message select sport when have not selected any sport.', () => {
            spyOn(verifyDateService, 'validDate').and.returnValue(true);
            component.sportTypesSelected = "";
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Language.atLeastSport);
        });

        it('should show error message select league when have not selected any league.', () => {
            spyOn(verifyDateService, 'validDate').and.returnValue(true);
            component.sportTypesSelected = "2";
            component.leaguesSelected = "";
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Language.atLeastLeague);
        });

        it('should call filter method and event emit when pass all validation.', () => {
            spyOn(moveTicketsService, 'filter').and.returnValue(of(""));
            spyOn(verifyDateService, 'validDate').and.returnValue(true);
            spyOn(component.searchAction, 'emit');
            spyOn(component.requestEmitter, 'emit');
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

    describe('onSelectTicketsStatus() method', () => {
        it('should return right value when selected.', () => {
            const items: ItemsSelect[] = [];
            items.push(new ItemsSelect(1, "2", "1", true, true, true, []));
            component.onSelectTicketsStatus(items);

            expect(component.ticketStatusSelected).toEqual("2");
        });

        it('should return default value when not selected.', () => {
            const items: ItemsSelect[] = [];
            component.onSelectTicketsStatus(items);

            expect(component.ticketStatusSelected).toEqual("0");
        });
    });

    describe('onSelectRemark() method', () => {

        it('should return right value when selected.', () => {
            const items: ItemsSelect[] = [];
            items.push(new ItemsSelect(1, "1", "1", true, true, true, []));
            items.push(new ItemsSelect(2, "2", "2", true, true, true, []));
            component.onSelectRemark(items);

            expect(component.remarkSelected).toEqual("1,2");
        });

        it('should return default value when not selected.', () => {
            const items: ItemsSelect[] = [];
            component.onSelectRemark(items);

            expect(component.remarkSelected).toEqual("0");
        });
    });

    it('onSelectFromDate - should return right value leagues correct date.', () => {
        const date = new Date();
        const league = new League();
        league.leagueId = 12345;
        const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        spyOn(moveTicketsService, 'getLeague').and.returnValue(of([league]));
        spyOn(verifyDateService, 'validDate').and.returnValue(true);
        component.onSelectFromDate(fromDate);

        expect(component.leagueSelect.items.length).toEqual(1);
    });

    it('onSelectToDate - should return right value leagues correct date.', () => {
        const date = new Date();
        const league = new League();
        league.leagueId = 12345;
        const toDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        spyOn(moveTicketsService, 'getLeague').and.returnValue(of([league]));
        spyOn(verifyDateService, 'validDate').and.returnValue(false);
        component.onSelectFromDate(toDate);

        expect(component.leagueSelect.items.length).toEqual(0);
    });


});