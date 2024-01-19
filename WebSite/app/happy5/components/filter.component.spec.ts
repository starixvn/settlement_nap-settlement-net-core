import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { of } from 'rxjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FilterComponent } from './index';
import { QueryService } from '../services';
import { DatepickerComponent } from '../../shared/components/date-picker/date-picker.component';
import { ModalDialogComponent } from "../../shared/components/modal-dialog/modal-dialog.component";
import { HttpRequestService, BlockUIService, MessageBoxService, VerifyDateService } from '../../shared/services';

describe('Happy 5 - Filter Component', () => {
    let component: FilterComponent;
    let fixture: ComponentFixture<FilterComponent>;
    let queryService: QueryService;
    const filter = {
        matchCode: 123,
        status: 0,
        fromDate: "2018/12/1",
        toDate: "2018/12/31",
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                FilterComponent,
                DatepickerComponent,
                ModalDialogComponent,
            ],
            providers: [
                QueryService,
                HttpRequestService,
                VerifyDateService,
                BlockUIService,
                MessageBoxService,
            ],
            imports: [
                FormsModule,
                HttpClientModule,
                NgbModule,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(FilterComponent);
                component = fixture.componentInstance;
                queryService = fixture.debugElement.injector.get(QueryService);
                spyOn(queryService, 'filter').and.returnValue(of(filter));
            });
    }));

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should return fromDate and toDate as expected', () => {
        const fromDateExpected = { year: 2018, month: 12, day: 1 };
        const toDateExpected = { year: 2018, month: 12, day: 31 };
        fixture.detectChanges();

        expect(component.fromDate).toEqual(fromDateExpected);
        expect(component.toDate).toEqual(toDateExpected);
    });

    describe("ngOnChanges()", () => {
        it('should call search when have change', () => {
            component.isDisabled = false;
            component.change = 1;
            component.status = "All";
            spyOn(queryService, 'search').and.returnValue(of(""));
            spyOn(component.searchAction, 'emit');
            component.ngOnChanges();

            expect(component.searchAction.emit).toHaveBeenCalled();
        });

        it('should not call when there are not change', () => {
            component.change = 0;
            spyOn(component.searchAction, 'emit');
            component.ngOnChanges();

            expect(component.searchAction.emit).not.toHaveBeenCalled();
        });
    });

    it('should emit on click submit', () => {
        spyOn(queryService, 'search').and.returnValue(of(""));
        spyOn(component.searchAction, 'emit');
        component.search();

        expect(component.searchAction.emit).toHaveBeenCalled();
    });

    describe('change fromDate on date picker', () => {
        const fromDate = { year: 2018, month: 12, day: 1 };
        const toDate = { year: 2018, month: 12, day: 31 };

        it('should enable button search when fromDate is less than or equal to toDate', () => {
            component.toDate = toDate;
            component.onSelectFromDate(fromDate);

            expect(component.isDisabled).toBe(false);
        });

        it('should disable button search when fromDate is greater than toDate', () => {
            component.toDate = fromDate;
            component.onSelectFromDate(toDate);

            expect(component.isDisabled).toBe(true);
        });
    });

    describe('change toDate on date picker', () => {
        const fromDate = { year: 2018, month: 12, day: 1 };
        const toDate = { year: 2018, month: 12, day: 31 };

        it('should enable button search when toDate is greater than fromDate', () => {
            component.fromDate = fromDate;
            component.onSelectToDate(toDate);

            expect(component.isDisabled).toBe(false);
        });

        it('should disable button search when toDate less than fromDate', () => {
            component.fromDate = toDate;
            component.onSelectToDate(fromDate);

            expect(component.isDisabled).toBe(true);
        });
    });
});
