import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from "@angular/core";
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
  ResourceNameByIdPipe,
  ExcludeTotalPointPipe,
  ResourceHeaderPipe,
} from '../pipes';
import { MaterialModule } from '../../shared/material-module';
import { ExternalLinkPipe } from '../../score-source-setting/pipes';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { PipesModule } from '../../shared/pipes/pipes.module.native';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';
import { PageType } from '../../shared/constants';
import { AppComponent } from './app.component';
import { CalculateActionsComponent } from './calculate-actions.component';
import { CalculateMatchDetailComponent } from './calculate-match-detail.component';
import { MatchDetailComponent } from './match-detail.component';
import { RefundActionsComponent } from './refund-actions.component';
import { EarlySettlementComponent } from './early-settlement.component';
import { NotReadyMatchComponent } from '../../shared/components/not-ready-match/not-ready-match.component';
import { ResettleCheckerComponent } from '../../shared/components/resettle-checker/resettle-checker.component';
import { TicketCountComponent } from '../../shared/components/ticket-count/ticket-count.component';
import { NewMultipleSelectComponent } from '../../shared/components/multiple-select/multiple-select.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;

  beforeEach(async() => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MaterialModule,
        PipesModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot(),
        AppComponent,
        CalculateActionsComponent,
        CalculateMatchDetailComponent,
        NotReadyMatchComponent,
        MatchDetailComponent,
        RefundActionsComponent,
        EarlySettlementComponent,
        ResettleCheckerComponent,
        TicketCountComponent,
        NewMultipleSelectComponent,
        ExternalLinkPipe,
        ResourceNameByIdPipe,
        ExcludeTotalPointPipe,
        ResourceHeaderPipe,
      ],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [EarlySettlementComponent, CalculateActionsComponent, RefundActionsComponent],
      },
  })
    .compileComponents()
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
