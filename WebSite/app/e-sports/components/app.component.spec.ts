import { TestBed, waitForAsync, ComponentFixture } from "@angular/core/testing";
import "rxjs/add/observable/from";
import { ElementRef } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import {
  AppComponent,
  CalculationMatchDetailComponent,
  CalculationActionsComponent,
  RefundActionsComponent,
  MatchDetailComponent,
  EarlySettlementComponent,
} from "./index";
import { ResourceNameByIdPipe} from "../pipes";
import {
  ResettleCheckerComponent,
  TicketCountComponent,
  NotReadyMatchComponent,
} from "../../shared/components";
import { MaterialModule } from "../../shared/material-module";
import { NewMultipleSelectComponent } from "../../shared/components/multiple-select/multiple-select.component";
import { ExternalLinkPipe } from "../../score-source-setting/pipes";
import { PipesModule } from '../../shared/pipes/pipes.module.native';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ToastNoAnimationModule, ToastrModule } from "ngx-toastr";
import { PageType } from '../../shared/constants';

describe("Component: App", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        CalculationMatchDetailComponent,
        NotReadyMatchComponent,
        CalculationActionsComponent,
        RefundActionsComponent,
        MatchDetailComponent,
        EarlySettlementComponent,
        NewMultipleSelectComponent,
        ResourceNameByIdPipe,
        ResettleCheckerComponent,
        TicketCountComponent,
        ExternalLinkPipe,
      ],
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MaterialModule,
        PipesModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot()
      ],
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
