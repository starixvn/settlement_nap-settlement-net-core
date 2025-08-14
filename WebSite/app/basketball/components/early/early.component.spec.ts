import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarlyComponent } from './early.component';

describe('EarlyComponent', () => {
  let component: EarlyComponent;
  let fixture: ComponentFixture<EarlyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EarlyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EarlyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
