import { fakeAsync } from '@angular/core/testing';
import { ComponentFixture, TestBed, flush } from '@angular/core/testing';

import { SettingContainerComponent } from './setting-container.component';
import { LeagueSettingsStore } from '../../../../services/league-settings.store';
import { LeagueSettings, ResultSettings } from '../../../../../shared/models/league-settings.model';
import { MatDialog } from '@angular/material/dialog';
import { ProviderSelectionComponent } from '../provider-selection/provider-selection.component';

describe('SettingContainerComponent', () => {
  let component: SettingContainerComponent;
  let fixture: ComponentFixture<SettingContainerComponent>;
  let store: LeagueSettingsStore;
  let dialog : MatDialog;

  const resultSettings: ResultSettings = {
    hasTrader: false,
    minimumProvider: 1,
    primaryProvider: '',
    secondaryProvider: ''
  }

  const leagueSettings: LeagueSettings = {
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
      imports: [SettingContainerComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(SettingContainerComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(LeagueSettingsStore);
    dialog = fixture.debugElement.injector.get(MatDialog);
    store.actionAfterUpdate = () => { };
    store.setState(leagueSettings);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      store.setState(leagueSettings);
    });
    it('show setting of main result when isEarly is false', () => {
      store.setState({ ...store.state, mainResultSettings: { ...resultSettings, minimumProvider: 1 } });
      component.isEarly = false

      component.ngOnInit();

      expect(component.resultSettings.minimumProvider).toEqual(1);

      store.setState({ ...store.state, mainResultSettings: { ...resultSettings, minimumProvider: 2 } });

      expect(component.resultSettings.minimumProvider).toEqual(2);
    });

    it('show setting of early result when isEarly is true', () => {
      store.setState({ ...store.state, earlyResultSettings: { ...resultSettings, minimumProvider: 1 }, mainResultSettings: { ...resultSettings, minimumProvider: 2 } });
      component.isEarly = true

      component.ngOnInit();

      expect(component.resultSettings.minimumProvider).toEqual(1);

      store.setState({ ...store.state, earlyResultSettings: { ...resultSettings, minimumProvider: 2 } });

      expect(component.resultSettings.minimumProvider).toEqual(2);
    });
  })

  describe('changeSetting', () => {
    beforeEach(() => {
      store.setState({...leagueSettings});
      component.resultSettings = {...resultSettings};
    });

    it('should change settings for main result on store when isEarly is false', () => {
      component.isEarly = false;
      
      component.changeSetting();
  
      expect(store.state.mainResultSettings.hasTrader).toBeTruthy();
      expect(store.state.earlyResultSettings.hasTrader).toBeFalsy();
    });

    it('should change settings for main result on store when isEarly is true', () => {
      component.isEarly = true;
  
      component.changeSetting();
  
      expect(store.state.earlyResultSettings.hasTrader).toBeTruthy();
      expect(store.state.mainResultSettings.hasTrader).toBeFalsy();
    });

    it('should change minium provider to two when setting not need trader', () => {
      component.isEarly = true;
      component.resultSettings.hasTrader = true;
      
      component.changeSetting();
  
      expect(store.state.earlyResultSettings.hasTrader).toBeFalsy();
      expect(store.state.earlyResultSettings.minimumProvider).toEqual(2);
    });
  });

  it('openProviderSelection - should open provider selection popup', () => {
    jest.spyOn(dialog, 'closeAll');
    jest.spyOn(dialog, 'open');

    component.openProviderSelection();
  
    expect(dialog.closeAll).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalledWith(ProviderSelectionComponent,  {
      width: '400px',
      data: component.isEarly
    })
  });
});
