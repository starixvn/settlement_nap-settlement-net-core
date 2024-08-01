import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ResettleCheckerComponent, TicketCountComponent, NotReadyMatchComponent } from '../../shared/components';
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
} from '.';
import {
  ResourceNameByIdPipe,
  ExcludeTotalPointPipe,
  ResourceHeaderPipe,
  ExternalHeaderPipe,
} from '../pipes';
import { MaterialModule } from '../../shared/material-module';
import { PipesModule } from '../../shared/pipes/pipes.module.native';
import { ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';
import { PageType } from '../../shared/constants';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

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
        MatchDetailComponent,
        RefundActionsComponent,
        NotReadyMatchComponent,
        ResourceNameByIdPipe,
        ExcludeTotalPointPipe,
        ResourceHeaderPipe,
        ExternalHeaderPipe,
        ResettleCheckerComponent,
        TicketCountComponent,
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

  it('should render calculate-actions tag', () => {
    elementRef.nativeElement.setAttribute("page-type", PageType.ReCalculate)
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll("calculate-actions").length).toBeGreaterThanOrEqual(1);
  });

  it('should render refund-actions tag', () => {
    elementRef.nativeElement.setAttribute("page-type", PageType.Refund)
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll("refund-actions").length).toBeGreaterThanOrEqual(1);
  });

  it('should throw exception: Not implemented yet', () => {
    elementRef.nativeElement.setAttribute("page-type", "")
    expect(() => {
      fixture.detectChanges();
    }).toThrow("Not implemented yet");
  });
});