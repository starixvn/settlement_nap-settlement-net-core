import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleBadgeComponent } from './circle-badge.component';

describe('CircleBadgeComponent', () => {
  let component: CircleBadgeComponent;
  let fixture: ComponentFixture<CircleBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CircleBadgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CircleBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
