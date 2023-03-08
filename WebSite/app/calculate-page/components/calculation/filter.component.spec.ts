import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { DatepickerComponent } from '../../../shared/components/date-picker/date-picker.component';
import { ModalDialogComponent, NewMultipleSelectComponent } from "../../../shared/components";
import { NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FilterComponent } from './filter.component';
import { HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService } from '../../../shared/services';
import { RequestService } from '../../services';
import { GenerateFilterService, BackGroundService, DetectChangesService } from './../../services';
import { MaterialModule } from '../../../shared/material-module';
import { DateFilter, ItemsSelect, ModalDialogMessage,League } from '../../../shared/models';
import { of } from 'rxjs';
import { Language } from '../../../shared/language.native';
describe('FilterComponent', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let requestService: RequestService;
    let verifyDateService: VerifyDateService;
    let messageBoxService: MessageBoxService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                FilterComponent,
                DatepickerComponent,
                ModalDialogComponent,
                NewMultipleSelectComponent],
            providers: [
                MessageBoxService,
                VerifyDateService,
                RequestService,
                GenerateFilterService,
                HttpRequestService,
                BlockUIService,
                BackGroundService,
                DetectChangesService
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule
            ],
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        requestService = fixture.debugElement.injector.get(RequestService);
        verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        spyOn(messageBoxService, 'alert').and.returnValue(new ModalDialogMessage());

    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return date and number item as expected.', fakeAsync(() => {
        const dateServer: DateFilter = {
            fromDate: "2020/06/20 00:00:00",
            toDate: "2020/06/19 00:00:00",
        };

        spyOn(requestService, 'getDate').and.returnValue(of(dateServer));
        component.ngOnInit();

        fixture.whenStable()
            .then(() => {
                expect(component.fromDate).toEqual({ year: 2020, month: 6, day: 20 });
                expect(component.toDate).toEqual({ year: 2020, month: 6, day: 19 });
                expect(component.leagueSelect.items.length).toEqual(6);
                expect(component.matchStatusSelect.items.length).toEqual(8);
                expect(component.holdStatusSelect.items.length).toEqual(4);
            });
    }));

    describe('search method', () => {
        it('should show error message date when wrong query value', () => {
            component.search();

            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual(Language.calculatePageWarning);
        });

        it('should call filter method and event emit when pass all validation.', () => {
            spyOn(requestService, 'search').and.returnValue(of(""));
            spyOn(verifyDateService, 'validDate').and.returnValue(true);
            spyOn(component.searchAction, 'emit');
            spyOn(component.disableRefund, 'emit');
            component.query.matchCode = "1";
            component.query.leagueIds = "1";
            component.query.filterOver = 1;
            component.query.matchType = 2;

            component.search();

            expect(requestService.search).toHaveBeenCalled();
            expect(component.searchAction.emit).toHaveBeenCalled();
            expect(component.disableRefund.emit).toHaveBeenCalled();
        });
    });

    describe('onSelectLeague() method', () => {
        it('should return right value when selected.', () => {
            const items: ItemsSelect[] = [];
            items.push(new ItemsSelect(1, "2", "1", true, true, true, []));
            component.onSelectLeague(items);

            expect(component.query.leagueIds).toEqual("2");
        });

        it('should return default value when not selected.', () => {
            const items: ItemsSelect[] = [];
            component.onSelectLeague(items);

            expect(component.query.leagueIds).toEqual("0");
        });
    });

    describe('onSelectMatchStatus() method', () => {
        it('should return right value when selected.', () => {
            const items: ItemsSelect[] = [];
            items.push(new ItemsSelect(1, "2", "1", true, true, true, []));
            component.onSelectMatchStatus(items);

            expect(component.query.matchStatus).toEqual("2");
        });

        it('should return default value when not selected.', () => {
            const items: ItemsSelect[] = [];
            component.onSelectMatchStatus(items);

            expect(component.query.leagueIds).toEqual("0");
        });
    });

    describe('onSelectHoldStatus() method', () => {
        it('should return right value when selected.', () => {
            const items: ItemsSelect[] = [];
            items.push(new ItemsSelect(1, "2", "1", true, true, true, []));
            component.onSelectHoldStatus(items);

            expect(component.query.holdStatus).toEqual("2");
        });

        it('should return default value when not selected.', () => {
            const items: ItemsSelect[] = [];
            component.onSelectHoldStatus(items);

            expect(component.query.holdStatus).toEqual("0");
        });
    });

    it('onSelectFromDate - should return right value leagues correct date.', () => {
        const date = new Date();
        const league = new League();
        league.leagueId = 12345;
        const fromDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        spyOn(requestService, 'getLeague').and.returnValue(of([league]));
        spyOn(verifyDateService, 'validDate').and.returnValue(true);

        component.onSelectFromDate(fromDate);

        expect(requestService.getLeague).toHaveBeenCalled();
    });

    it('onSelectToDate - should return right value leagues correct date.', () => {
        const date = new Date();
        const league = new League();
        league.leagueId = 12345;
        const toDate: NgbDateStruct = { day: date.getUTCDay(), month: date.getUTCMonth(), year: date.getUTCFullYear() };
        spyOn(requestService, 'getLeague').and.returnValue(of([league]));
        spyOn(verifyDateService, 'validDate').and.returnValue(false);
       
        component.onSelectFromDate(toDate);

        expect(requestService.getLeague).not.toHaveBeenCalled();
        expect(component.leagueSelect.items.length).toEqual(0);
    });

});
