import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationActionComponent } from './calculation-action.component';

describe('CalculationActionComponent', () => {
  let component: CalculationActionComponent;
  let fixture: ComponentFixture<CalculationActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculationActionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CalculationActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
