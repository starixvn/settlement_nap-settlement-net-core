import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCalculateMatchesComponent } from './auto-calculate-matches.component';

describe('MatchesComponent', () => {
  let component: AutoCalculateMatchesComponent;
  let fixture: ComponentFixture<AutoCalculateMatchesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoCalculateMatchesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoCalculateMatchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
