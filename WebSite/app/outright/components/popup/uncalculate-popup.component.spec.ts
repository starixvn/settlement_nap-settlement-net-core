import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UncalculatePopupComponent } from './uncalculate-popup.component';

describe('UncalculatePopupComponent', () => {
  let component: UncalculatePopupComponent;
  let fixture: ComponentFixture<UncalculatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UncalculatePopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UncalculatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
