import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ProviderSourceComponent } from './provider-source.component';
import { OutsideSourceComponent } from './outside-source.component';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '../../shared/material-module';
import { FormsModule } from '@angular/forms';
import { NewMultipleSelectComponent } from '../../shared/components/multiple-select/multiple-select.component';
import { ExternalLinkPipe, GameStatusPipe, SourceStatusPipe } from '../pipes';
import { ElementRef } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        ExternalLinkPipe,
        GameStatusPipe,
        SourceStatusPipe,
        ProviderSourceComponent,
        OutsideSourceComponent,
        AppComponent,
        NewMultipleSelectComponent,
        BrowserModule,
        FormsModule,
        MaterialModule,
        HttpClientModule,
      ]})
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppComponent);
        component = fixture.componentInstance;
        elementRef = fixture.debugElement.injector.get(ElementRef);
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render provider-source tag', () => {
    elementRef.nativeElement.setAttribute("page-type", "ProviderSource")
    component.ngOnInit();
    expect(document.querySelectorAll("provider-source").length).toBeGreaterThanOrEqual(1);
  });

  it('should render outside-source tag', () => {
      elementRef.nativeElement.setAttribute("page-type", "OutsideSource")
      component.ngOnInit();
      expect(document.querySelectorAll("outside-source").length).toBeGreaterThanOrEqual(1);
  });

  it('should throw exception: Not implemented yet', () => {
      elementRef.nativeElement.setAttribute("page-type", "")
      expect(() => {
        component.ngOnInit();
      }).toThrow("Not implemented yet");
  });
});
