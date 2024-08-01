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
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { MaterialModule } from '../../shared/material-module';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { PipesModule } from '../../shared/pipes/pipes.module.native';
import { PageType } from '../../shared/constants';
import { ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';
import { NotReadyMatchComponent } from '../../shared/components/not-ready-match/not-ready-match.component';
import { NewMultipleSelectComponent } from '../../shared/components/multiple-select/multiple-select.component';
import { TicketCountComponent } from '../../shared/components/ticket-count/ticket-count.component';
import { ResettleCheckerComponent } from '../../shared/components/resettle-checker/resettle-checker.component';

describe('Component: App', () => {
    let component: AppComponent;
    let fixture: ComponentFixture<AppComponent>;
    let elementRef: ElementRef<HTMLElement>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                BrowserModule,
                FormsModule,
                ReactiveFormsModule,
                HttpClientModule,
                MaterialModule,
                PipesModule,
                ToastNoAnimationModule.forRoot(),
                ToastrModule.forRoot(),
                NewMultipleSelectComponent,
                NotReadyMatchComponent,
                TicketCountComponent,
                ResettleCheckerComponent,
                NewMultipleSelectComponent,
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
        }).compileComponents()
            .then(() => {
                fixture = TestBed.createComponent(AppComponent);
                component = fixture.componentInstance;
                elementRef = fixture.debugElement.injector.get(ElementRef);
            });
    });

    it('should create the app', () => {
        expect(component).toBeTruthy();
    });

    it('should render calculation-actions tag', () => {
        elementRef.nativeElement.setAttribute("page-type", PageType.ReCalculate)
        fixture.detectChanges();
        expect(document.querySelectorAll("calculation-actions").length).toBeGreaterThanOrEqual(1);
    });

    it('should render refund-actions tag', () => {
        elementRef.nativeElement.setAttribute("page-type", PageType.Refund)
        fixture.detectChanges();
        expect(document.querySelectorAll("refund-actions").length).toBeGreaterThanOrEqual(1);
    });

    it('should render early-settlement tag', () => {
        elementRef.nativeElement.setAttribute("page-type", PageType.EarlySettlement)
        fixture.detectChanges();
        expect(document.querySelectorAll("early-settlement").length).toBeGreaterThanOrEqual(1);
    });

    it('should throw exception: Not implemented yet', () => {
        elementRef.nativeElement.setAttribute("page-type", "")
        expect(() => {
            fixture.detectChanges();
        }).toThrow("Not implemented yet");
    });
});