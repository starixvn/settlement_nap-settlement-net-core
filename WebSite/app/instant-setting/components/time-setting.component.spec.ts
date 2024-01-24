import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { TimeSettingComponent } from './time-setting.component';
import { RequestService } from '../services/request.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { MessageBoxService, HttpRequestService, BlockUIService, ClosePopupService } from '../../shared/services';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { League } from '../models';
import { UrlHelper } from '../../helper';
import { Language } from '../../shared/language.native';
import { AutoType } from '../constants/auto-type';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { ModalContentDialogComponent } from '../../shared/components/modal-dialog/modal-content-dialog.component';

describe('TimeSettingComponent', () => {
    let component: TimeSettingComponent;
    let fixture: ComponentFixture<TimeSettingComponent>;
    let requestService: RequestService;
    let messageBoxService: MessageBoxService;
    let closePopupService: ClosePopupService;
    const buttonName = "btn-danger";
    const errorMessage = "Error message";
    const successfulResult = {
        errCode: 0,
        errMsg: "",
        isSuccessful: true,
    };
    const unSuccessfulResult = {
        errCode: 1,
        errMsg: errorMessage,
        isSuccessful: false,
    };

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
          providers: [
            RequestService,
            HttpRequestService,
            BlockUIService,
            ClosePopupService,
            NgbModal,
            { provide: MessageBoxService, useClass: MessageBoxService },
          ],
          imports: [
            FormsModule,
            HttpClientModule,
            NgbModule,
            TimeSettingComponent
          ],
        })
        .overrideModule(BrowserDynamicTestingModule, {
          set: {
              entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
          },
        })
        .compileComponents()
        .then(() => {
            fixture = TestBed.createComponent(TimeSettingComponent);
            component = fixture.componentInstance;
            requestService = fixture.debugElement.injector.get(RequestService);
            messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
            closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        });
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
      it('should successfully set component fields with DirectTime', fakeAsync(async() => {
        const mockIdAndTime = '1000';
        const mockLeague: League = { leagueName: 'Champion League'};
        jest.spyOn(UrlHelper, 'getUrlParameter').mockImplementation((param) => {
          if (param === "pageType") {
            return 'DirectTime';
          }

          if(param === "autoType"){
            return "";
          }

          return mockIdAndTime;
        })
        jest.spyOn(requestService, 'getLeagueName').mockResolvedValue(mockLeague);

        await component.ngOnInit();

        expect(component.leagueId).toEqual(Number(mockIdAndTime));
        expect(component.time).toEqual(Number(mockIdAndTime));
        expect(component.leagueName).toEqual(mockLeague.leagueName);
        expect(component.autoType).toEqual(AutoType.direct);
      }));

      it('should set InstantTime setting for autoType', fakeAsync(async() => {
        const mockLeague: League = { leagueName: 'Champion League'};
        component.pageType = 'InstantTime';
        jest.spyOn(UrlHelper, 'getUrlParameter').mockReturnValue("");
        jest.spyOn(requestService, 'getLeagueName').mockResolvedValue(mockLeague);

        await component.ngOnInit();

        expect(component.autoType).toEqual(AutoType.instant);
      }));

      it('should set time setting for autoType', fakeAsync(async() => {
        const mockLeague: League = { leagueName: 'Champion League'};
        jest.spyOn(UrlHelper, 'getUrlParameter').mockImplementation((arg) => {
           if(arg === 'pageType'){
              return 'AutoPayOut';
           } 
           return "";
        })
        jest.spyOn(requestService, 'getLeagueName').mockResolvedValue(mockLeague);

        component.ngOnInit();
        tick();

        expect(component.autoType).toEqual(AutoType.autoPayout);
      }));
    });

    describe('proceed', () => {
      it('should pass all validation and successfully close pop-up', fakeAsync(() => {
        component.time = 10;
        jest.spyOn(requestService, 'proceed').mockResolvedValue(successfulResult);
        jest.spyOn(messageBoxService, 'closePopup');
        const element = document.createElement("dialog-response");
        jest.spyOn(document, 'getElementById').mockReturnValue(element);

        component.proceed();
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(messageBoxService.closePopup).toHaveBeenCalled();
      }));

      it('should return error message when result is unsuccessful', fakeAsync(() => {
        component.time = 10;
        jest.spyOn(requestService, 'proceed').mockResolvedValue(unSuccessfulResult);
        const element = document.createElement("dialog-response");
        jest.spyOn(document, 'getElementById').mockReturnValue(element);

        component.proceed();
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(component.errorMessage).toEqual(errorMessage);
      }));

      it('should alert when input time is out of range', () => {
        component.time = 0;
        jest.spyOn(messageBoxService, 'alert');

        component.proceed();
        const expectedMessage = Language.InstantSetting.InvalidTimeSetting;

        expect(component.warningDialogMessage.message).toEqual(expectedMessage);
        expect(messageBoxService.alert).toHaveBeenCalled();
      });
    });
});