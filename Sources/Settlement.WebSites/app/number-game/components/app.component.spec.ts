import { TestBed, waitForAsync, tick, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BlockUIService, HttpRequestService, MessageBoxService, ReCheckInService, VerifyDateService } from '../../shared/services';
import { BrowserModule } from '@angular/platform-browser';
import {
    FilterComponent,
    MatchesComponent,
    BallsComponent,
    ReCalculationComponent
} from './index';
import {
    DatepickerComponent,
} from '../../shared/components';
import { NumberGame } from '../models';
import { QueryService } from '../services';

describe('Component: App', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let reCheckInService: ReCheckInService;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                FilterComponent,
                BallsComponent,
                ReCalculationComponent,
                MatchesComponent,
                DatepickerComponent,
            ],
            providers: [
                ReCheckInService,
                QueryService,
                HttpRequestService,
                MessageBoxService,
                VerifyDateService,
                BlockUIService,
                { provide: MessageBoxService, useClass: MessageBoxService },
            ],
            imports: [
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
        const spy = spyOn(reCheckInService, 'reCheckin');
        component.ngOnInit();
        tick(60000);
        component.ngOnDestroy();
        expect(spy).toHaveBeenCalled();
    }));

    it('should return right input value', () => {
        const value = { fromDate: "fromDate", toDate: "toDate", numberGame: new NumberGame() };
        component.search(value);

        expect("fromDate").toEqual(component.fromDate);
        expect("toDate").toEqual(component.toDate);
    });
});