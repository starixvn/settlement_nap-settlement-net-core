import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ToastNoAnimationModule, ToastrModule } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { PageType } from '../../shared/constants';
import { ElementRef, ViewContainerRef } from '@angular/core';
import { CalculateStorage } from '../services/calculate/calculate.storage';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;
  let viewContainerRef: ViewContainerRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
              imports: [AppComponent,
          ToastNoAnimationModule.forRoot(),
          ToastrModule.forRoot(),
          CommonModule
        ],
      providers: [CalculateStorage]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(AppComponent);
      component = fixture.componentInstance;
      viewContainerRef = fixture.debugElement.injector.get(ViewContainerRef);
      elementRef = fixture.debugElement.injector.get(ElementRef);
      elementRef.nativeElement.setAttribute("page-type", PageType.ReCalculate);
      fixture.detectChanges();
    });
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should render the toast container', () => {
    const toastContainer = fixture.nativeElement.querySelector('span[toastContainer]');
    expect(toastContainer).toBeTruthy();
  });

  it('should render the loading div when blockUI is true', () => {
    component.blockUI = true;
    fixture.detectChanges();
    const loadingDiv = fixture.nativeElement.querySelector('.loading');
    expect(loadingDiv).toBeTruthy();
  });

  it('should not render the loading div when blockUI is false', () => {
    component.blockUI = false;
    fixture.detectChanges();
    const loadingDiv = fixture.nativeElement.querySelector('.loading');
    expect(loadingDiv).toBeFalsy();
  });

  
  it('should throw an error for unknown page type', () => {
    elementRef.nativeElement.setAttribute('page-type', 'UnknownPageType');
  
    expect(() => {component.createComponent()}).toThrow(Error('Not implemented yet'));
  });
});
