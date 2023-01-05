import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculatePopupComponent } from './calculate-popup.component';

describe('CalculatePopupComponent', () => {
  let component: CalculatePopupComponent;
  let fixture: ComponentFixture<CalculatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalculatePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
