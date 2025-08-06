import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from "@angular/core";
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from '.';

// Mock UrlHelper
jest.mock('../../helper', () => ({
  UrlHelper: {
    getUrlParameter: jest.fn().mockReturnValue('123')
  }
}));

// Mock the child components to avoid complex dependencies
jest.mock('./calculate-actions.component', () => ({
  CalculateActionsComponent: class MockCalculateActionsComponent {
    getMatch() {}
  }
}));

jest.mock('./refund-actions.component', () => ({
  RefundActionsComponent: class MockRefundActionsComponent {
    getMatch() {}
  }
}));

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let elementRef: ElementRef<HTMLElement>;
  
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AppComponent,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
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

  it('should have ngOnInit method', () => {
    expect(component.ngOnInit).toBeDefined();
  });

  it('should throw exception for invalid page type', () => {
    fixture.debugElement.nativeElement.setAttribute("page-type", "invalid")
    expect(() => {
      fixture.detectChanges();
    }).toThrow("Not implemented yet");
  });
});