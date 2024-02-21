import { TestBed, waitForAsync, ComponentFixture} from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FilterComponent} from './index';
import { SearchService } from '../../services';
import { MessageBoxService, VerifyDateService, BlockUIService, HttpRequestService  } from '../../../shared/services';
import { ModalDialogComponent } from "../../../shared/components/modal-dialog/modal-dialog.component";
import { of } from 'rxjs';
import {
    DatepickerComponent,
} from '../../../shared/components/date-picker/date-picker.component';
import { Filter, LogQuery } from '../../models';
describe('Filter component', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let searchService: SearchService;
    let verifyDateService: VerifyDateService;
    let messageBoxService: MessageBoxService;
    const filter = {
        matchCode: "123",
        fromDate: "2018/12/1",
        toDate: "2018/12/31",
        productType: "Log"
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                FilterComponent,
                ModalDialogComponent
            ],
            providers: [
                BlockUIService,
                VerifyDateService,
                MessageBoxService,
                SearchService,
                HttpRequestService,
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
                DatepickerComponent
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(FilterComponent);
                component = fixture.componentInstance;
                searchService = fixture.debugElement.injector.get(SearchService);
                verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);

                searchService.filter = jest.fn().mockReturnValue(Promise.resolve(filter));
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    describe('ngOnInit', () => {
        it('should return fromDate and toDate as expected when matchCode is empty', () => {
            const fromDateExpected = { year: 2018, month: 12, day: 1 };
            const toDateExpected = { year: 2018, month: 12, day: 31 };
            searchService.filter = jest.fn().mockReturnValue(of(new LogQuery("", "", "12/1/2018", "12/31/2018")));
            fixture.detectChanges();

            expect(component.filter.fromDate).toEqual(fromDateExpected);
            expect(component.filter.toDate).toEqual(toDateExpected);
        });
    });

    describe('search', () => {
        it('should call emit when input correct value', () => {
            verifyDateService.validDate = jest.fn().mockReturnValue(Promise.resolve(true));
            searchService.search = jest.fn().mockReturnValue(of(""));
            component.searchAction.emit = jest.fn();
            const input = new Filter();
            input.matchCode = "123";
            component.filter = input;

            component.search();
            expect(component.searchAction.emit).toHaveBeenCalled();
        });

        it('should call alert when input incorrect value', () => {
            messageBoxService.alert = jest.fn();
            const input = new Filter();
            input.matchCode = "";
            component.filter = input;
            component.search();
            expect(messageBoxService.alert).toHaveBeenCalled();
            expect(component.warningDialogMessage.message).toEqual("Please input the Match Code/ID.");
        });

        it('should show warning message when input incorrect date value', () => {
            const input = new Filter();
            input.matchCode = "123";
            component.filter = input;
            component.search();
            expect(component.warningDialogMessage.message).toEqual("From date must be before To date.");
        });
    });

    describe('change toDate on date picker', () => {
        const fromDate = { year: 2018, month: 12, day: 1 };
        const toDate = { year: 2018, month: 12, day: 31 };

        it('should return right fromDate value when select on date picker', () => {
            component.onSelectFromDate(fromDate);
            expect(component.filter.fromDate).toBe(fromDate);
        });

        it('should return right toDate value when select on date picker', () => {
            component.onSelectToDate(toDate);
            expect(component.filter.toDate).toBe(toDate);
        });

    });
});