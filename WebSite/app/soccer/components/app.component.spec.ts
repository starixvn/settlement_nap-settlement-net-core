import { AppComponent } from './app.component';
import { waitForAsync, TestBed, ComponentFixture } from '@angular/core/testing';
import { BlockUIService, ClosePopupService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ElementRef } from "@angular/core";
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { PageType } from '../../shared/constants';
import { CalculationComponent } from './calc/calculation.component'
import { RefundComponent } from './refund/refund.component'
import { EarlySettlementComponent } from './early/early-settlement.component'
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from '../../shared/material-module';
import { GroupNameByIdPipe } from '../pipes/group-name-by-id.pipe';

describe(`Soccer - AppComponent`, () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let elementRef: ElementRef<HTMLElement>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                MaterialModule,
                ToastNoAnimationModule.forRoot(),
                ToastContainerModule,
                ToastrModule.forRoot()
            ],
            declarations: [
                AppComponent,
                CalculationComponent,
                RefundComponent,
                EarlySettlementComponent,
                GroupNameByIdPipe,
            ],
            providers: [
                BlockUIService,
                HttpRequestService,
                MessageBoxService,
                ClosePopupService,
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).overrideModule(BrowserDynamicTestingModule, {
            set: {
              entryComponents: [EarlySettlementComponent, CalculationComponent, RefundComponent],
            },
        })
            .compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(AppComponent);
                component = fixture.componentInstance;
                elementRef = fixture.debugElement.injector.get(ElementRef);
            });
    }));

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should render calculation tag', () => {
        elementRef.nativeElement.setAttribute("page-type", PageType.ReCalculate)
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelectorAll("calculation").length).toBeGreaterThanOrEqual(1);
    });

    it('should render refund tag', () => {
        elementRef.nativeElement.setAttribute("page-type", PageType.Refund)
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelectorAll("refund").length).toBeGreaterThanOrEqual(1);
    });

    it('should render early-settlement tag', () => {
        elementRef.nativeElement.setAttribute("page-type", PageType.EarlySettlement)
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelectorAll("early-settlement").length).toBeGreaterThanOrEqual(1);
    });

    it('should throw exception: Not implemented yet', () => {
        elementRef.nativeElement.setAttribute("page-type", "")
        expect(() => {
            fixture.detectChanges();
        }).toThrow("Not implemented yet");
    });
});