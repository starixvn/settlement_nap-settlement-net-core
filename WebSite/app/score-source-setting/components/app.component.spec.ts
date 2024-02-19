import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { AppComponent } from './app.component';
import { ProviderSourceComponent } from './provider-source.component';
import { OutsideSourceComponent } from './outside-source.component';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '../../shared/material-module';
import { FormsModule } from '@angular/forms';
import { NewMultipleSelectComponent } from '../../shared/components';
import { ExternalLinkPipe, GameStatusPipe, SourceStatusPipe } from '../pipes';
import { ElementRef } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        ProviderSourceComponent,
        OutsideSourceComponent,
        NewMultipleSelectComponent,
        ExternalLinkPipe,
        GameStatusPipe,
        SourceStatusPipe
      ],
      imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        HttpClientModule,
      ]
      })
      .compileComponents()
      .then(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      elementRef = fixture.debugElement.injector.get(ElementRef);
    });
  }));
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render provider-source tag', () => {
    elementRef.nativeElement.setAttribute("page-type", "ProviderSource")
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelectorAll("provider-source").length).toBeGreaterThanOrEqual(1);
  });

  it('should render outside-source tag', () => {
      elementRef.nativeElement.setAttribute("page-type", "OutsideSource")
      fixture.detectChanges();
      const compiled = fixture.debugElement.nativeElement;
      expect(compiled.querySelectorAll("outside-source").length).toBeGreaterThanOrEqual(1);
  });

  it('should throw exception: Not implemented yet', () => {
      elementRef.nativeElement.setAttribute("page-type", "")
      expect(() => {
          fixture.detectChanges();
      }).toThrow("Not implemented yet");
  });
});
