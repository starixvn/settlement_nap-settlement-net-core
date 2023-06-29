import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgbModule, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
    VerifyDateService, BlockUIService, MessageBoxService, HttpRequestService,
    ReCheckInService, DialogBoxService, SportMatchService
} from './../../shared/services';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import {
    AppComponent,
    FilterComponent,
    LeagueComponent,
} from '.';
import { MultiSportService, RefreshMatchService } from '../services';
import { GenerateFilterService } from '../../shared/services';
import { MaterialModule } from '../../shared/material-module';
import { MultiSport, MatchWaitingRequest } from '../models';
import { PipesModule } from '../../shared/pipes/pipes.module.native';
import { NewMultipleSelectComponent } from '../../shared/components/multiple-select/multiple-select.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';
import { DatepickerComponent } from '../../shared/components/date-picker/date-picker.component';


describe('MultiSport - AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let reCheckInService: ReCheckInService;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                FilterComponent,
                LeagueComponent,
                ModalContentDialogComponent,
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
                PipesModule,
                DatepickerComponent,
                NewMultipleSelectComponent
            ],
            providers: [
                VerifyDateService,
                MessageBoxService,
                MultiSportService,
                GenerateFilterService,
                BlockUIService,
                HttpRequestService,
                NgbActiveModal,
                ReCheckInService,
                RefreshMatchService,
                DialogBoxService,
                SportMatchService,
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(AppComponent);
                component = fixture.componentInstance;
                reCheckInService = fixture.debugElement.injector.get(ReCheckInService);
            });
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit - should start recheck in interval', fakeAsync(() => {
        reCheckInService.reCheckin = jest.fn();

        component.ngOnInit();
        tick(60000);
        component.ngOnDestroy();

        expect(reCheckInService.reCheckin).toHaveBeenCalled();
    }));

    it('search - should set multi sport', () => {
        const multiSport = new MultiSport();

        component.search(multiSport);

        expect(component.multiSport).toEqual(multiSport);
    });

    it('getRequest - should set request', () => {
        const request = new MatchWaitingRequest('', '', '', '', "", "");

        component.getRequest(request);

        expect(component.request).toEqual(request);
    });
});