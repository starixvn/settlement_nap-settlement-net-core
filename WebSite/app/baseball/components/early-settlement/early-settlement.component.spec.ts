import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarlySettlementComponent } from './early-settlement.component';

describe('EarlySettlementComponent', () => {
  let component: EarlySettlementComponent;
  let fixture: ComponentFixture<EarlySettlementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarlySettlementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EarlySettlementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
