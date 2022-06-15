import { TestBed, waitForAsync, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BlockUIService, HttpRequestService } from '../../shared/services';
import { BrowserModule } from '@angular/platform-browser';
import { FilterComponent} from './index';
import { SearchService } from '../services';
import { MessageBoxService, VerifyDateService } from '../../shared/services';
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { of } from 'rxjs';
import {
    DatepickerComponent,
} from '../../shared/components';
import { Filter } from '../models';
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
                DatepickerComponent,
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
                searchService = fixture.debugElement.injector.get(SearchService);
                verifyDateService = fixture.debugElement.injector.get(VerifyDateService);
                messageBoxService = fixture.debugElement.injector.get(MessageBoxService);

                spyOn(searchService, 'filter').and.returnValue(of(filter));
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    describe('ngOnInit', () => {
        it('should return fromDate and toDate as expected when matchCode is empty', () => {
            const fromDateExpected = { year: 2018, month: 12, day: 1 };
            const toDateExpected = { year: 2018, month: 12, day: 31 };
            fixture.detectChanges();

            expect(component.filter.fromDate).toEqual(fromDateExpected);
            expect(component.filter.toDate).toEqual(toDateExpected);
        });
    });

    describe('search', () => {
        it('should call emit when input correct value', () => {
            spyOn(verifyDateService, 'validDate').and.returnValue(of(true));
            spyOn(searchService, 'search').and.returnValue(of(""));
            spyOn(component.searchAction, 'emit');
            const input = new Filter();
            input.matchCode = "123";
            component.filter = input;

            component.search();
            expect(component.searchAction.emit).toHaveBeenCalled();
        });

        it('should call alert when input incorrect value', () => {
            spyOn(messageBoxService, 'alert');
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