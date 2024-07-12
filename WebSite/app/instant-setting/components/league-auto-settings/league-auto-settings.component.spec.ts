import { MessageBoxService } from './../../../shared/services/message-box.service.native';
import { ComponentFixture, TestBed, tick, fakeAsync, flush } from '@angular/core/testing';
import { LeagueAutoSettingsComponent } from './league-auto-settings.component';
import { LeagueSettingsStore } from '../../services/league-settings.store';
import { LeagueSettings } from '../../../shared/models/league-settings.model';
import { RequestService } from '../../services/request.service';
import { BlockUIService, HttpRequestService } from '../../../shared/services';
import { HttpClientModule } from '@angular/common/http';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { Language } from '../../../shared/language.native';
import { Result } from '../../../shared/models';

describe('LeagueAutoSettingsComponent', () => {
  let component: LeagueAutoSettingsComponent;
  let fixture: ComponentFixture<LeagueAutoSettingsComponent>;
  let store: LeagueSettingsStore;
  let requestService :RequestService;
  let messageBoxService: MessageBoxService;
  let toastrService : ToastrService;
  const leagueSettings : LeagueSettings = {
    leagueId: 100,
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
    providers: [{ priority: 1, sourceName: 'temp', sourceId: 1 }],
    refundWaitingTime: 0
  }

  const buttonName = "btn-danger";

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ LeagueAutoSettingsComponent,  HttpClientModule ,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()],
      providers: [HttpRequestService, RequestService, BlockUIService, MessageBoxService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeagueAutoSettingsComponent);
    component = fixture.componentInstance;
    store  = fixture.debugElement.injector.get(LeagueSettingsStore);
    requestService = fixture.debugElement.injector.get(RequestService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - should Get League setting from API', fakeAsync(() => {
    jest.spyOn(requestService, 'getLeagueSetting').mockReturnValue(Promise.resolve({...leagueSettings, leagueName: 'test'}));
   
    component.ngOnInit();
    tick();

    expect(store.originalState.leagueId).toEqual(100);
    expect(component.leagueName).toEqual('test');
  }));

  it('cancel - should invoke messageBoxService to close', () => {
    jest.spyOn(messageBoxService, "closePopup");

    component.cancel();

    expect(messageBoxService.closePopup).toHaveBeenCalled();
  });

 
  describe('submit', () => {
    it('should show alert when minium provider is one and not exist trader on main result', () => {
      jest.spyOn(toastrService, "error");
      store.setState({...leagueSettings, mainResultSettings: {minimumProvider: 1, hasTrader: false, primaryProvider: '', secondaryProvider: ''}});
  
      component.submit();


      expect(toastrService.error).toHaveBeenCalledWith(Language.AutoPayoutSetting.MinimumSource);
    });

    it('should show alert when minium provider is one and not exist trader on early result', () => {
      jest.spyOn(toastrService, "error");
      store.setState({...leagueSettings, earlyResultSettings: {minimumProvider: 1, hasTrader: false, primaryProvider: '', secondaryProvider: ''}});
  
      component.submit();


      expect(toastrService.error).toHaveBeenCalledWith(Language.AutoPayoutSetting.MinimumSource);
    });

    it('should show confirm box, invoke update api and update parent docs after click yes or no', fakeAsync(() => {
      store.setState({...leagueSettings, autoSetting: 1,
         earlyResultSettings: {minimumProvider: 2, hasTrader: false, primaryProvider: '', secondaryProvider: ''},
         mainResultSettings: {minimumProvider: 2, hasTrader: false, primaryProvider: '', secondaryProvider: ''}});
      store.originalState = store.state;
      const element = document.createElement("dialog-response");
      jest.spyOn(requestService, 'updateLeagueSetting').mockResolvedValue({isSuccessful: true, errCode: 0, errMsg: '', childMatchIds:''} as Result);
      jest.spyOn(messageBoxService, "closePopup");
      jest.spyOn(document, 'getElementById').mockReturnValue(element);

      component.submit();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      flush();
      
      expect(document.getElementById("dialog-response").getAttribute('value')).toEqual("{\"isApplyAll\":true,\"autoSetting\":1,\"waitingTime\":0,\"retryTime\":0}");
      expect(requestService.updateLeagueSetting).toHaveBeenCalledWith(store.state, store.originalState, true);
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should show alert when update failed', fakeAsync(() => {
      store.setState({...leagueSettings,
         earlyResultSettings: {minimumProvider: 2, hasTrader: false, primaryProvider: '', secondaryProvider: ''},
         mainResultSettings: {minimumProvider: 2, hasTrader: false, primaryProvider: '', secondaryProvider: ''}});
      store.originalState = store.state;
      jest.spyOn(requestService, 'updateLeagueSetting').mockResolvedValue({isSuccessful: false, errCode: 1, errMsg: 'message', childMatchIds:''} as Result);
      jest.spyOn(messageBoxService, "closePopup");
      jest.spyOn(toastrService, "error");

      component.submit();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();
      flush();
      
      expect(toastrService.error).toHaveBeenCalledWith('message');
      expect(messageBoxService.closePopup).not.toHaveBeenCalled();
    }));
  });
});
