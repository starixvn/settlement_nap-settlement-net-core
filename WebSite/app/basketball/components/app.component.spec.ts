import { TestBed, waitForAsync, ComponentFixture } from '@angular/core/testing';
import { ElementRef } from "@angular/core";
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
    CalculationMatchDetailComponent,
    CalculationActionsComponent,
    RefundActionsComponent,
    MatchDetailComponent,
    EarlySettlementComponent,
} from './index';
import { BrowserModule } from '@angular/platform-browser';
import { TicketCountComponent, ResettleCheckerComponent, NotReadyMatchComponent, NewMultipleSelectComponent, } from '../../shared/components';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import * as _ from 'lodash';
import { MaterialModule } from '../../shared/material-module';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { PipesModule } from '../../shared/pipes/pipes.module.native';
import { PageType } from '../../shared/constants';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';

describe('Component: App', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let elementRef: ElementRef<HTMLElement>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                AppComponent,
                NotReadyMatchComponent,
                CalculationMatchDetailComponent,
                CalculationActionsComponent,
                RefundActionsComponent,
                MatchDetailComponent,
                EarlySettlementComponent,
                TicketCountComponent,
                ResettleCheckerComponent,
                ResourceNameByIdPipe,
                ExternalLinkPipe,
                NewMultipleSelectComponent,
            ],
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                MaterialModule,
                PipesModule,
                ToastNoAnimationModule.forRoot(),
                ToastContainerModule,
                ToastrModule.forRoot()
            ],
        })
        .overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [EarlySettlementComponent, CalculationActionsComponent, RefundActionsComponent],
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

    it('should render calculation-actions tag', () => {
        elementRef.nativeElement.setAttribute("page-type", PageType.ReCalculate)
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelectorAll("calculation-actions").length).toBeGreaterThanOrEqual(1);
    });

    it('should render refund-actions tag', () => {
        elementRef.nativeElement.setAttribute("page-type", PageType.Refund)
        fixture.detectChanges();
        const compiled = fixture.debugElement.nativeElement;
        expect(compiled.querySelectorAll("refund-actions").length).toBeGreaterThanOrEqual(1);
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