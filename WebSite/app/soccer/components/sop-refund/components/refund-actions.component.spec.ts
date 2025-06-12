import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefundActionsComponent } from './refund-actions.component';

describe('RefundActionsComponent', () => {
  let component: RefundActionsComponent;
  let fixture: ComponentFixture<RefundActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefundActionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefundActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
