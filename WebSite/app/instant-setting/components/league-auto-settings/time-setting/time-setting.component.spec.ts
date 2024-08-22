import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSettingComponent } from './time-setting.component';
import { LeagueSettingsStore } from '../../../services/league-settings.store';
import { AutoSettings } from '../../../../shared/models/league-settings.model';
import { input } from '@angular/core';

describe('DirectSettingComponent', () => {
  let component: TimeSettingComponent;
  let fixture: ComponentFixture<TimeSettingComponent>;
  let store: LeagueSettingsStore;

  const leagueSettings: AutoSettings = {
    leagueId: 0,
    leagueName: '',
    autoSetting: 0,
    waitingTime: 0,
    retryTime: 0,
    mainResultSettings: {
      hasTrader: false,
      minimumProvider: 1,
      primaryProvider: '',
      secondaryProvider: ''
    },
    earlyResultSettings: {
      hasTrader: false,
      minimumProvider: 1,
      primaryProvider: '',
      secondaryProvider: ''
    },
    providers: [],
    refundWaitingTime: 0
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimeSettingComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TimeSettingComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(LeagueSettingsStore);
    store.actionAfterUpdate = () => { };
    store.setState(leagueSettings);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('changeWaiting - change waiting time on store', () => {
    fixture.componentRef.setInput('directSetting', true);
    component.changeWaiting('5');

    expect(store.state.waitingTime).toEqual(5);
  });

  it('changeWaiting - change refund waiting time on store', () => {
    fixture.componentRef.setInput('directSetting', false);
    component.changeWaiting('5');

    expect(store.state.refundWaitingTime).toEqual(5);
  });
});
