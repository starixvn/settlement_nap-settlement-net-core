import { TestBed, waitForAsync, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BlockUIService, ReCheckInService } from '../../shared/services';
import { BrowserModule } from '@angular/platform-browser';
import {
    AppComponent,
    FilterComponent,
    MatchesComponent} from './index';
import {
    DatepickerComponent,
} from '../../shared/components/date-picker/date-picker.component';
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
                DatepickerComponent
            ],
            providers: [
                BlockUIService,
                ReCheckInService,
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
        const value = { matches: null, matchCode: "1", fromDate: "fromDate", toDate: "toDate" };
        component.search(value);

        expect("1").toEqual(component.matchCode);
        expect("fromDate").toEqual(component.fromDate);
        expect("toDate").toEqual(component.toDate);
    });
});