import { TestBed, waitForAsync, ComponentFixture} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ElementRef } from "@angular/core";
import { ModalDialogComponent, ModalContentDialogComponent, MultipleSelectComponent, TreeViewComponent } from '../../shared/components';
import { AppComponent } from './app.component';
import { MessageBoxService, HttpRequestService, BlockUIService, ClosePopupService } from '../../shared/services';
import { MatchDetailComponent } from './match-detail.component';
import { BetTypesComponent } from './bet-types.component';
import { FilterComponent } from './filter.component';
import { TicketStatusPipe, ResultStatusPipe, IntervalPipe, SpecialTimePipe, SpecialTimeEventCounterPipe } from '../pipes';
import { OnlyIntegerDirective, FocusDirective } from '../../shared/directives';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '../../shared/material-module';
import { SpecialSessionComponent } from './special-session.component';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';

describe('Component: AppComponent', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;

    class MockElementRef implements ElementRef {
        nativeElement = {};
      }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                MatchDetailComponent,
                BetTypesComponent,
                FilterComponent,
                ResultStatusPipe,
                TicketStatusPipe,
                IntervalPipe,
                MultipleSelectComponent,
                TreeViewComponent,
                ModalDialogComponent,
                ModalContentDialogComponent,
                SpecialSessionComponent,
                SpecialTimePipe,
                SpecialTimeEventCounterPipe,
            ],
            providers: [
                HttpRequestService,
                BlockUIService,
                ClosePopupService,
                NgbModal,
                { provide: MessageBoxService, useClass: MessageBoxService },
                { provide: ElementRef , useValue: new MockElementRef()} ,
            ],
            imports: [
                BrowserModule,
                FormsModule,
                HttpClientModule,
                NgbModule,
                MaterialModule,
                ToastNoAnimationModule.forRoot(),
            ],
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(AppComponent);
                component = fixture.componentInstance;
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));

    it('ngOnInit - should set BlockUI', () => {
        component.ngOnInit();

        expect(component.blockUI).toBe(false);
    });
});
