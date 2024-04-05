import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoPayoutSettingComponent } from './auto-payout-setting.component';
import { LeagueSettingsStore } from '../../../services/league-settings.store';
import { LeagueSettings } from '../../../../shared/models/league-settings.model';

describe('AutoPayoutSettingComponent', () => {
  let component: AutoPayoutSettingComponent;
  let fixture: ComponentFixture<AutoPayoutSettingComponent>;
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
    providers: []
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ AutoPayoutSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutoPayoutSettingComponent);
    component = fixture.componentInstance;
    store  = fixture.debugElement.injector.get(LeagueSettingsStore);
    store.actionAfterUpdate = () => {};
    store.setState(leagueSettings);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - retryTime always get on store', () => {
    store.setState( {...store.state, retryTime: 1 });
    component.ngOnInit();

    expect(component.retryTime).toEqual(1);

    store.setState( {...store.state, retryTime: 2 });

    expect(component.retryTime).toEqual(2);
  });

  it('changeWaiting - change retryTime on store', () => {
    component.changeRetryTime('5');

    expect(store.state.retryTime).toEqual(5);
  });
});
