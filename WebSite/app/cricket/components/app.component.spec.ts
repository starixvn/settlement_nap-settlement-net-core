import { TestBed, waitForAsync, ComponentFixture } from "@angular/core/testing";
// Removed deprecated rxjs import
import { ElementRef, NO_ERRORS_SCHEMA } from "@angular/core";
import { UrlHelper } from "../../helper";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import AppComponent from "./app.component";
import { CalculationActionsComponent } from "./calculation-actions.component";
import { RefundActionsComponent } from "./refund-actions.component";
import { MatchDetailComponent } from "./match-detail.component";
import { EarlySettlementComponent } from "./early-settlement.component";
import { ResettleCheckerComponent } from "../../shared/components/resettle-checker/resettle-checker.component";
import { TicketCountComponent } from "../../shared/components/ticket-count/ticket-count.component";
import { NotReadyMatchComponent } from "../../shared/components/not-ready-match/not-ready-match.component";
import { MaterialModule } from "../../shared/material-module";
import { NewMultipleSelectComponent } from "../../shared/components/multiple-select/multiple-select.component";
import { ExternalLinkPipe } from "../../score-source-setting/pipes";
import { PipesModule } from '../../shared/pipes/pipes.module.native';
import { ResultByPlayerNamePipe, ResultNameByIdPipe, ResultValuePipe } from '../pipes';
import { ToastNoAnimationModule, ToastrModule } from "ngx-toastr";
import { PageType } from '../../shared/constants';

describe("Component: App", () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;

  beforeEach(waitForAsync(() => {
    // Mock UrlHelper.getUrlParameter to return a mock matchId
    jest.spyOn(UrlHelper, 'getUrlParameter').mockReturnValue('12345');
    
    TestBed.configureTestingModule({
      declarations: [],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        AppComponent,
        NotReadyMatchComponent,
        CalculationActionsComponent,
        RefundActionsComponent,
        MatchDetailComponent,
        EarlySettlementComponent,
        NewMultipleSelectComponent,
        ResettleCheckerComponent,
        TicketCountComponent,
        ExternalLinkPipe,
        ResultNameByIdPipe,
        ResultValuePipe,
        ResultByPlayerNamePipe,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
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

it('should render calculation-actions tag', async () => {
    elementRef.nativeElement.setAttribute("page-type", PageType.ReCalculate)
    component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll("calculation-actions").length).toBeGreaterThanOrEqual(1);
});

it('should render refund-actions tag', async () => {
    elementRef.nativeElement.setAttribute("page-type", PageType.Refund)
    component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll("refund-actions").length).toBeGreaterThanOrEqual(1);
});

it('should render early-settlement tag', async () => {
    elementRef.nativeElement.setAttribute("page-type", PageType.EarlySettlement)
    component.ngOnInit();
    fixture.detectChanges();
    await fixture.whenStable();
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
