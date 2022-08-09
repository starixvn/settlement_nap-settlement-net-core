import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResettleCheckerComponent, TicketCountComponent, NotReadyMatchComponent, NewMultipleSelectComponent, } from '../../shared/components';
import { ElementRef } from "@angular/core";
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import {
  AppComponent,
  CalculateActionsComponent,
  CalculateMatchDetailComponent,
  MatchDetailComponent,
  RefundActionsComponent,
  EarlySettlementComponent,
} from '.';
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

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        CalculateActionsComponent,
        CalculateMatchDetailComponent,
        NotReadyMatchComponent,
        MatchDetailComponent,
        RefundActionsComponent,
        EarlySettlementComponent,
        ResourceNameByIdPipe,
        ExcludeTotalPointPipe,
        ResourceHeaderPipe,
        ResettleCheckerComponent,
        TicketCountComponent,
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
  }));

  it('should create the app', () => {
      expect(component).toBeTruthy();
  });

  it('should render calculation-actions tag', () => {
      elementRef.nativeElement.setAttribute("page-type", PageType.Calculation)
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
