import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueAutoSettingsComponent } from './league-auto-settings.component';

describe('LeagueAutoSettingsComponent', () => {
  let component: LeagueAutoSettingsComponent;
  let fixture: ComponentFixture<LeagueAutoSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeagueAutoSettingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeagueAutoSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
