import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCalculateFilterComponent } from './auto-calculate-filter.component';

describe('AutoCalculateFilterComponent', () => {
  let component: AutoCalculateFilterComponent;
  let fixture: ComponentFixture<AutoCalculateFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoCalculateFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoCalculateFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
