import { TestBed, waitForAsync, ComponentFixture } from "@angular/core/testing";
import { ElementRef, NO_ERRORS_SCHEMA, ViewContainerRef } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ToastNoAnimationModule, ToastrModule } from "ngx-toastr";

// Add jest global
declare const jest: any;

import { UrlHelper } from "../../helper";
import AppComponent from "./app.component";
import { CalculationActionsComponent } from "./calculation-actions.component";
import { RefundActionsComponent } from "./refund-actions.component";
import { EarlySettlementComponent } from "./early-settlement.component";
import { PageType } from '../../shared/constants';
import { EarlyConstraintService } from "../services/early-constraint.service";
import { VerificationService } from "../services/verification.service";
import { HttpRequestService, AioService, BlockUIService, MessageBoxService } from "../../shared/services";
import { VerificationBaseService } from "../../core/services/verification-base.service";
import { ToastrService } from "ngx-toastr";
import { ResultByTeamNamePipe } from '../../shared/pipes/result-by-team-name.pipe';
import { ResultByPlayerNamePipe, ResultNameByIdPipe, ResultValuePipe } from '../pipes';

// Mock for EarlyConstraintService to break circular dependency
class MockEarlyConstraintService {
  autoFillItemSelect() {
    return Promise.resolve();
  }
}

// Mock for VerificationService to avoid circular dependency
class MockVerificationService {
  invalidInputScore() { return false; }
  allMapHaveScoreSources() { return true; }
  isMismatchedWarning() { return false; }
  autoFillScore() { }
  isDisableUncalculate() { return false; }
}

describe("Component: App", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;
  let viewContainerRef: ViewContainerRef;

  beforeEach(waitForAsync(() => {
    jest.spyOn(UrlHelper, 'getUrlParameter').mockReturnValue('12345');
    
    TestBed.configureTestingModule({
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],    
      providers: [
        { provide: VerificationService, useClass: MockVerificationService },
        HttpRequestService,
        AioService,
        BlockUIService,
        MessageBoxService,
        ResultNameByIdPipe,
        ResultByTeamNamePipe,
        VerificationBaseService,
        ToastrService,
        { provide: EarlyConstraintService, useClass: MockEarlyConstraintService }
      ],
      imports: [
        AppComponent,
        CalculationActionsComponent,
        RefundActionsComponent,
        EarlySettlementComponent,
        ResultByPlayerNamePipe,
        ResultNameByIdPipe,
        ResultValuePipe,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot()
      ],
    }).compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        elementRef = fixture.debugElement.injector.get(ElementRef);
        viewContainerRef = fixture.debugElement.injector.get(ViewContainerRef);
        
        // Mock createTemplateComponent to prevent errors
        jest.spyOn(component, 'createTemplateComponent').mockImplementation(() => {
          // Do nothing to avoid actual component creation
        });
      });
  }));

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should handle ReCalculate page type', () => {
    elementRef.nativeElement.setAttribute("page-type", PageType.ReCalculate);
    
    // Test that getComponentFactory returns the correct component
    const componentFactory = (component as any).getComponentFactory();
    expect(componentFactory).toBe(CalculationActionsComponent);
  });

  it('should handle Refund page type', () => {
    elementRef.nativeElement.setAttribute("page-type", PageType.Refund);
    
    // Test that getComponentFactory returns the correct component
    const componentFactory = (component as any).getComponentFactory();
    expect(componentFactory).toBe(RefundActionsComponent);
  });

  it('should handle EarlySettlement page type', () => {
    elementRef.nativeElement.setAttribute("page-type", PageType.EarlySettlement);
    
    // Test that getComponentFactory returns the correct component
    const componentFactory = (component as any).getComponentFactory();
    expect(componentFactory).toBe(EarlySettlementComponent);
  });

  it('should throw exception for unknown page type', () => {
    elementRef.nativeElement.setAttribute("page-type", "unknown");
    
    expect(() => {
      (component as any).getComponentFactory();
    }).toThrow("Not implemented yet");
  });

  it('should throw exception for empty page type', () => {
    elementRef.nativeElement.setAttribute("page-type", "");
    
    expect(() => {
      (component as any).getComponentFactory();
    }).toThrow("Not implemented yet");
  });

  it('should throw exception for null page type', () => {
    elementRef.nativeElement.removeAttribute("page-type");
    
    expect(() => {
      (component as any).getComponentFactory();
    }).toThrow("Not implemented yet");
  });

  it('should call ngOnInit successfully', () => {
    elementRef.nativeElement.setAttribute("page-type", PageType.ReCalculate);
    
    expect(() => {
      component.ngOnInit();
    }).not.toThrow();
  });

  it('should have correct constructor parameters', () => {
    expect(component).toBeTruthy();
    expect(elementRef).toBeTruthy();
    expect(viewContainerRef).toBeTruthy();
  });
});
