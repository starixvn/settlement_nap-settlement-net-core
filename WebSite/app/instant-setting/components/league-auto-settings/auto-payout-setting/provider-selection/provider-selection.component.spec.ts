import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderSelectionComponent } from './provider-selection.component';
import { LeagueSettingsStore } from '../../../../services/league-settings.store';
import { LeagueSettings, ProviderSource } from '../../../../../shared/models/league-settings.model';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Language } from '../../../../../shared/language.native';

export class MatDialogRefMock {
  close():void{}
}
describe('ProviderSelectionComponent', () => {
  let component: ProviderSelectionComponent;
  let fixture: ComponentFixture<ProviderSelectionComponent>;
  let store: LeagueSettingsStore;
  let dialogRef: MatDialogRef<ProviderSelectionComponent>;

  const firstProvider: ProviderSource = {
    sourceId: 1,
    sourceName: 'first',
    priority: 0
  }

  const secondProvider: ProviderSource = {
    sourceId: 2,
    sourceName: 'second',
    priority: 0
  }

  const thirdProvider: ProviderSource = {
    sourceId: 3,
    sourceName: 'third',
    priority: 0
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
    providers: [firstProvider, secondProvider, thirdProvider]
  }

  const data = false

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProviderSelectionComponent, MatDialogModule],
      providers: [ 
        { provide: MatDialogRef, useValue: new MatDialogRefMock() },
        { provide: MAT_DIALOG_DATA, useValue: data }]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ProviderSelectionComponent);
    component = fixture.componentInstance;
    store = fixture.debugElement.injector.get(LeagueSettingsStore);
    dialogRef = fixture.debugElement.injector.get(MatDialogRef);
    store.actionAfterUpdate = () => { };
    store.setState(leagueSettings);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  test.each(
    [["first", "second", 1, 2 , 0],
    ["first, second", "third", 1, 1 , 2],
    ["", "", 0, 0 , 0]])("Should set priority based on primary and secondary from result settings", (primary: string, secondary: string, firstPriority: number, secondPriority: number, thirdPriority: number) => {
    component.isEarly = false;
    store.setState({ ...leagueSettings, mainResultSettings: { ...store.state.mainResultSettings, primaryProvider: primary, secondaryProvider: secondary } });

    component.ngOnInit();

    expect(component.providerSources[0].priority).toEqual(firstPriority);
    expect(component.providerSources[1].priority).toEqual(secondPriority);
    expect(component.providerSources[2].priority).toEqual(thirdPriority);
  });

  it('close - should invoke close popup function', () => {
    jest.spyOn(dialogRef, 'close');

    component.close();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  describe('submit', () => {
      it('should set error message when exist secondary but not exist primary', () => { 
          secondProvider.priority = 2;
          component.providerSources = [secondProvider];

          component.submit();

          expect(component.errorMessage).toEqual(Language.AutoPayoutSetting.MissingPrimarySource);
      });

      
      it('should set primary and provider for main when flag isEarly is false', () => { 
        firstProvider.priority = 1;
        secondProvider.priority = 2;
        component.isEarly = false;
        component.providerSources = [firstProvider, secondProvider];

        component.submit();

        expect(component.errorMessage).toEqual("");
        expect(store.state.mainResultSettings.primaryProvider).toEqual("first");
        expect(store.state.mainResultSettings.secondaryProvider).toEqual("second")
    });

    it('should set primary and provider for early when flag isEarly is true', () => { 
      firstProvider.priority = 1;
      secondProvider.priority = 2;
      component.isEarly = true;
      component.providerSources = [firstProvider, secondProvider];

      component.submit();

      expect(component.errorMessage).toEqual("");
      expect(store.state.earlyResultSettings.primaryProvider).toEqual("first");
      expect(store.state.earlyResultSettings.secondaryProvider).toEqual("second")
  });
  });
});
