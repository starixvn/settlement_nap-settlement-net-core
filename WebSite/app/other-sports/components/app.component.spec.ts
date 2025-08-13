import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { ComponentFactoryResolver, ElementRef } from '@angular/core';
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { NotReadyMatchComponent } from '../../shared/components/not-ready-match/not-ready-match.component';
import { ResettleCheckerComponent } from '../../shared/components/resettle-checker/resettle-checker.component';
import { TicketCountComponent } from '../../shared/components/ticket-count/ticket-count.component';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ScorePipe } from '../pipes';
import { FullTimeCalculationComponent } from './only-fulltime/fulltime-calculation.component';
import { FullTimeRefundComponent } from './only-fulltime/fulltime-refund.component';

describe('Component: App', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let blockUIService: BlockUIService;
    let elementRef: ElementRef<HTMLElement>;
    let componentFactoryResolver: ComponentFactoryResolver;
    class MockElementRef implements ElementRef {
        nativeElement = {};
      }

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                FullTimeCalculationComponent,
                FullTimeRefundComponent,
                ScorePipe,
            ],
            imports: [
                BrowserModule,
                FormsModule,
                HttpClientModule,
                NgbModule,
                TicketCountComponent,
                ResettleCheckerComponent,
                NotReadyMatchComponent,
            ],
            providers: [
                BlockUIService,
                HttpRequestService,
                MessageBoxService,
                ClosePopupService,
                NgbModal,
                { provide: ElementRef, useValue: new MockElementRef() },
            ],
        }).compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(AppComponent);
                component = fixture.componentInstance;
                elementRef = fixture.debugElement.injector.get(ElementRef);
                blockUIService = fixture.debugElement.injector.get(BlockUIService);

                componentFactoryResolver = fixture.debugElement.injector.get(ComponentFactoryResolver);
            });
    }));

    it('should create the app', waitForAsync(() => {
        expect(component).toBeTruthy();
    }));
});