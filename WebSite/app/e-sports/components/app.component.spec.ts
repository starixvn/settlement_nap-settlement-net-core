import { TestBed, waitForAsync, ComponentFixture } from "@angular/core/testing";
import { ElementRef } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
import { CalculationMatchDetailComponent } from "./calculation-match-detail.component";
import { CalculationActionsComponent } from "./calculation-actions.component";
import { RefundActionsComponent } from "./refund-actions.component";
import { MatchDetailComponent } from "./match-detail.component";
import { EarlySettlementComponent } from "./early-settlement.component";
import { ResourceNameByIdPipe} from "../pipes";
import { ResettleCheckerComponent } from "../../shared/components/resettle-checker/resettle-checker.component";
import { TicketCountComponent } from "../../shared/components/ticket-count/ticket-count.component";
import { NotReadyMatchComponent } from "../../shared/components/not-ready-match/not-ready-match.component";
import { MaterialModule } from "../../shared/material-module";
import { NewMultipleSelectComponent } from "../../shared/components/multiple-select/multiple-select.component";
import { ExternalLinkPipe } from "../../score-source-setting/pipes";
import { PipesModule } from '../../shared/pipes/pipes.module.native';
import { ToastNoAnimationModule, ToastrModule } from "ngx-toastr";
import { PageType } from '../../shared/constants';
import { CalculationActionsComponent as CalculationESport } from "./calculation-actions.component";
import { RefundActionsComponent as RefundESport } from "./refund-actions.component";
import { EarlySettlementComponent as EarlyESport } from "./early-settlement.component";

describe("Component: App", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
      ],
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        MaterialModule,
        PipesModule,
        NoopAnimationsModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot(),
        AppComponent,
        CalculationMatchDetailComponent,
        NotReadyMatchComponent,
        CalculationActionsComponent,
        RefundActionsComponent,
        MatchDetailComponent,
        EarlySettlementComponent,
        NewMultipleSelectComponent,
        ResettleCheckerComponent,
        TicketCountComponent,
        ResourceNameByIdPipe,
        ExternalLinkPipe,
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
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      elementRef = fixture.debugElement.injector.get(ElementRef);
      elementRef.nativeElement.setAttribute("page-type", PageType.ReCalculate);
      component.ngOnInit();
      fixture.detectChanges();
      // Test that the component was created and ngOnInit was called
      expect(component).toBeTruthy();
      // Test that the correct component factory is returned
      const factory = (component as any).getComponentFactory();
      expect(factory).toBe(CalculationESport);
  });

  it('should render refund-actions tag', () => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      elementRef = fixture.debugElement.injector.get(ElementRef);
      elementRef.nativeElement.setAttribute("page-type", PageType.Refund);
      component.ngOnInit();
      fixture.detectChanges();
      // Test that the component was created and ngOnInit was called
      expect(component).toBeTruthy();
      // Test that the correct component factory is returned
      const factory = (component as any).getComponentFactory();
      expect(factory).toBe(RefundESport);
  });

  it('should render early-settlement tag', () => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      elementRef = fixture.debugElement.injector.get(ElementRef);
      elementRef.nativeElement.setAttribute("page-type", PageType.EarlySettlement);
      component.ngOnInit();
      fixture.detectChanges();
      // Test that the component was created and ngOnInit was called
      expect(component).toBeTruthy();
      // Test that the correct component factory is returned
      const factory = (component as any).getComponentFactory();
      expect(factory).toBe(EarlyESport);
  });

  it('should throw exception: Not implemented yet', () => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      elementRef = fixture.debugElement.injector.get(ElementRef);
      elementRef.nativeElement.setAttribute("page-type", "");
      expect(() => {
          component.ngOnInit();
          fixture.detectChanges();
      }).toThrow("Not implemented yet");
  });
});
