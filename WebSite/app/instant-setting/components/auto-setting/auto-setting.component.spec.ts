import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { AutoSettingComponent } from './auto-setting.component';
import { MessageBoxService, HttpRequestService, BlockUIService, ClosePopupService } from '../../../shared/services';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { UrlHelper } from '../../../helper';
import { RequestService } from '../../services/request.service';
import { ModalDialogComponent } from '../../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../../shared/components/modal-dialog/modal-content-dialog.component';
import { Result } from '../../../shared/models';
import * as _ from 'lodash';


describe('AutoSettingComponent', () => {
  let component: AutoSettingComponent;
  let fixture: ComponentFixture<AutoSettingComponent>;
  let requestService: RequestService;
  let messageBoxService: MessageBoxService;
  const mockUrlParameter = '7000000';
  const stateId = {
    direct: 5,
    auto: 1,
    off: 0,
  };
  const stateName = {
    direct: 'DIRECT',
    auto: 'AUTO',
    off: 'OFF',
  };
  const mockResult: Result = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
    childMatchIds: '',
    settledSessionId: '',
    hasResultAmendment: false,
    isOrg: false
  };


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        RequestService,
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,
        NgbModal,
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
      imports: [
        AutoSettingComponent,
        FormsModule,
        HttpClientModule,
        NgbModule,
        ModalDialogComponent,
        ModalContentDialogComponent
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoSettingComponent);
    component = fixture.componentInstance;
    requestService = fixture.debugElement.injector.get(RequestService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    messageBoxService.closePopup = jest.fn();
    jest.spyOn(UrlHelper, 'getUrlParameter').mockReturnValue(mockUrlParameter);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('submit', () => {
    it('should invoke updateSettingMatch & close popup when pageType is AutoSettingMatch and type is single', fakeAsync(() => {
      // Arrange
      component.pageType = 'AutoSettingMatch';
      component.isMultiSelect = false;

      jest.spyOn(requestService, 'updateSettingMatch').mockResolvedValue(mockResult);

      const element = document.createElement("dialog-response");
      jest.spyOn(document, 'getElementById').mockReturnValue(element);
      // Act

      component.submit();
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();
      tick();

      // Assert
      expect(requestService.updateSettingMatch).toHaveBeenCalled();
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should invoke updateSettingMatch & close popup when pageType is AutoSettingMatch', fakeAsync(() => {
      // Arrange
      component.pageType = 'AutoSettingMatch';
      component.isMultiSelect = true;
      component.originalListSetting = _.cloneDeep(component.listSetting);
      component.listSetting[0].isEnable = true;
      component.listSetting[1].isEnable = true;

      jest.spyOn(requestService, 'updateSettingMatch').mockResolvedValue(mockResult);
      const element = document.createElement("dialog-response");
      jest.spyOn(document, 'getElementById').mockReturnValue(element);

      // Act
      component.submit();
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();
      tick();

      // Assert
      expect(document.getElementById("dialog-response").getAttribute('value')).toEqual("10001");
      expect(requestService.updateSettingMatch).toHaveBeenCalledTimes(2);
      expect(messageBoxService.closePopup).toHaveBeenCalledTimes(1);
    }));

    it('should invoke updateSettingLeague & close popup when pageType is AutoSettingLeague and type is single', fakeAsync(() => {
      // Arrange
      component.pageType = 'AutoSettingLeague';
      component.isMultiSelect = false;
      const element = document.createElement("dialog-response");
      jest.spyOn(document, 'getElementById').mockReturnValue(element);
      jest.spyOn(requestService, 'updateSettingLeague').mockResolvedValue(mockResult);
      // Act

      component.submit();
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();
      tick();

      // Assert
      expect(requestService.updateSettingLeague).toHaveBeenCalled();
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should invoke updateSettingLeague & close popup when pageType is AutoSettingLeague', fakeAsync(() => {
      // Arrange
      component.pageType = 'AutoSettingLeague';
      component.isMultiSelect = true;
      component.originalListSetting = _.cloneDeep(component.listSetting);
      component.listSetting[0].isEnable = true;
      component.listSetting[1].isEnable = true;

      const element = document.createElement("dialog-response");
      jest.spyOn(document, 'getElementById').mockReturnValue(element);
      jest.spyOn(requestService, 'updateSettingLeague').mockResolvedValue(mockResult);
      // Act

      component.submit();
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();
      tick();

      // Assert
      expect(document.getElementById("dialog-response").getAttribute('value')).toEqual("10001,true");
      expect(requestService.updateSettingLeague).toHaveBeenCalledTimes(2);
      expect(messageBoxService.closePopup).toHaveBeenCalledTimes(1);
    }));

    
  });

  describe('getId', () => {
    it('should set leagueId when pageType is AutoSettingLeague', () => {
      // Arrange
      component.pageType = 'AutoSettingLeague';

      // Act
      component.getId();

      // Assert
      expect(component.leagueId).toEqual(Number(mockUrlParameter));
    });

    it('should set matchId when pageType is AutoSettingMatch', () => {
      // Arrange
      component.pageType = 'AutoSettingMatch';

      // Act
      component.getId();

      // Assert
      expect(component.matchId).toEqual(Number(mockUrlParameter));
    });
  });

  describe('getStateName', () => {
    it('should return direct state name', () => {
      // Act
      const result = component.getStateName(stateId.direct);

      // Assert
      expect(result).toEqual(stateName.direct);
    });

    it('should return auto state name', () => {
      // Act
      const result = component.getStateName(stateId.auto);

      // Assert
      expect(result).toEqual(stateName.auto);
    });

    it('should return off state name', () => {
      // Act
      const result = component.getStateName(stateId.off);

      // Assert
      expect(result).toEqual(stateName.off);
    });
  });
});