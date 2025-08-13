import { TestBed, waitForAsync, ComponentFixture } from "@angular/core/testing";
import { ElementRef } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { AppComponent } from "./app.component";
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
      imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NoopAnimationsModule,
        AppComponent,
      ],
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        elementRef = fixture.debugElement.injector.get(ElementRef);
      });
  }));

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should return calculation-actions component factory', () => {
      elementRef.nativeElement.setAttribute("page-type", PageType.ReCalculate);
      const factory = (component as any).getComponentFactory();
      expect(factory).toBe(CalculationESport);
  });

  it('should return refund-actions component factory', () => {
      elementRef.nativeElement.setAttribute("page-type", PageType.Refund);
      const factory = (component as any).getComponentFactory();
      expect(factory).toBe(RefundESport);
  });

  it('should return early-settlement component factory', () => {
      elementRef.nativeElement.setAttribute("page-type", PageType.EarlySettlement);
      const factory = (component as any).getComponentFactory();
      expect(factory).toBe(EarlyESport);
  });

  it('should throw exception: Not implemented yet', () => {
      elementRef.nativeElement.setAttribute("page-type", "");
      expect(() => {
          (component as any).getComponentFactory();
      }).toThrow("Not implemented yet");
  });
});
