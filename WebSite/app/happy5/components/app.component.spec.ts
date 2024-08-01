import { TestBed, waitForAsync, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BlockUIService, HttpRequestService, MessageBoxService, ReCheckInService, VerifyDateService } from '../../shared/services';
import { BrowserModule } from '@angular/platform-browser';
import {
    AppComponent,
    FilterComponent,
    MatchesComponent,
    ReCalculationComponent,
    RefundComponent
} from './index';
import { DatepickerComponent } from '../../shared/components/date-picker/date-picker.component';
import { QueryService } from '../services';
import { HappyFive } from '../models';
describe('Component: App', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let reCheckInService: ReCheckInService;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                FilterComponent,
                MatchesComponent,
                ReCalculationComponent,
                RefundComponent
            ],
            providers: [
                BlockUIService,
                ReCheckInService,
                HttpRequestService,
                MessageBoxService,
                VerifyDateService,
                QueryService,
            ],
            imports: [
                DatepickerComponent,
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(AppComponent);
                component = fixture.componentInstance;
                reCheckInService = fixture.debugElement.injector.get(ReCheckInService);
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('should call reCheckin function from re-checkin service.', fakeAsync(() => {
        const spy = jest.spyOn(reCheckInService, 'reCheckin').mockReturnValue();
        component.ngOnInit();
        tick(60000);
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
    }));

    it('should return right input value', () => {
        const happyFive = new HappyFive();
        const value = { fromDate: "fromDate", toDate: "toDate" , happyFive  };
        component.search(value);

        expect("fromDate").toEqual(component.fromDate);
        expect("toDate").toEqual(component.toDate);
    });

    it('should return one value', () => {
        component.reloadAction();

        const expectedValue = component.change;
        expect(expectedValue).toEqual(1);
    });
});