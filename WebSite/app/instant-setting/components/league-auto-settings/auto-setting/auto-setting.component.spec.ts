import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoTypeComponent } from './auto-setting.component';
import { LeagueSettingsStore } from '../../../services/league-settings.store.native';
import { LeagueSettings } from '../../../../shared/models/league-settings.model';

describe('AutoTypeComponent', () => {
  let component: AutoTypeComponent;
  let fixture: ComponentFixture<AutoTypeComponent>;
  let store : LeagueSettingsStore;

  const leagueSettings : LeagueSettings = {
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
      imports: [ AutoTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoTypeComponent);
    component = fixture.componentInstance;
    store  = fixture.debugElement.injector.get(LeagueSettingsStore);
    store.actionAfterUpdate = () => {};
    store.setState(leagueSettings);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('changeAutoSetting - change auto type on store', () => {
    component.changeAutoSetting(5);

    expect(store.state.autoSetting).toEqual(5);
  });
});
