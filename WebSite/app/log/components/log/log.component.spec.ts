import { TestBed, waitForAsync, ComponentFixture, tick, fakeAsync } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { BlockUIService, ReCheckInService, VerifyDateService } from '../../../shared/services';
import { SearchService } from '../../services/search.service';
import { BrowserModule } from '@angular/platform-browser';
import {
    LogComponent,
    FilterComponent,
    MatchesComponent} from './index';
import {
    DatepickerComponent,
} from '../../../shared/components/date-picker/date-picker.component';
describe('Component: App', () => {
    let component: LogComponent;
    let fixture: ComponentFixture<LogComponent>;
    let reCheckInService: ReCheckInService;
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                LogComponent,
                FilterComponent,
                MatchesComponent
            ],
            providers: [
                BlockUIService,
                ReCheckInService,
                VerifyDateService,
                DatePipe,
                SearchService,
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
                fixture = TestBed.createComponent(LogComponent);
                component = fixture.componentInstance;
                reCheckInService = fixture.debugElement.injector.get(ReCheckInService);
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('should call reCheckin function from re-checkin service.', fakeAsync(() => {
        reCheckInService.reCheckin = jest.fn();
        component.ngOnInit();
        tick(60000);
        component.ngOnDestroy();
        expect(reCheckInService.reCheckin).toHaveBeenCalled();
    }));

    it('should return right input value', () => {
        const value = { matches: null, matchCode: "1", fromDate: "fromDate", toDate: "toDate" };
        component.search(value);

        expect("1").toEqual(component.matchCode);
        expect("fromDate").toEqual(component.fromDate);
        expect("toDate").toEqual(component.toDate);
    });
});