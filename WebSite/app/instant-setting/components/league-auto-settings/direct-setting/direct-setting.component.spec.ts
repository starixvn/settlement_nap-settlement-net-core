import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectSettingComponent } from './direct-setting.component';
import { LeagueSettingsStore } from '../../../services/league-settings.store';
import { LeagueSettings } from '../../../models/league-settings.model';

describe('DirectSettingComponent', () => {
  let component: DirectSettingComponent;
  let fixture: ComponentFixture<DirectSettingComponent>;
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
      imports: [ DirectSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectSettingComponent);
    component = fixture.componentInstance;
    store  = fixture.debugElement.injector.get(LeagueSettingsStore);
    store.actionAfterUpdate = () => {};
    store.setState(leagueSettings);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - Waiting time always get on store', () => {
    store.setState( {...store.state, waitingTime: 1 });
    component.ngOnInit();

    expect(component.waitingTime).toEqual(1);

    store.setState( {...store.state, waitingTime: 2 });

    expect(component.waitingTime).toEqual(2);
  });

  it('changeWaiting - change waiting time on store', () => {
    component.changeWaiting('5');

    expect(store.state.waitingTime).toEqual(5);
  });
});
