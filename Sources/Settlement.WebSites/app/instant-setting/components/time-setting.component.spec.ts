import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { TimeSettingComponent } from './time-setting.component';
import { RequestService } from '../services/request.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { MessageBoxService, HttpRequestService, BlockUIService, ClosePopupService } from '../../shared/services';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { ModalDialogComponent, ModalContentDialogComponent } from '../../shared/components';
import { League } from '../models';
import { of } from 'rxjs';
import { UrlHelper } from '../../helper';
import { Language } from '../../shared/language';
import { AutoType } from '../constants/auto-type';

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
          declarations: [
            TimeSettingComponent,
            ModalDialogComponent,
            ModalContentDialogComponent
          ],
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
        spyOn(UrlHelper, 'getUrlParameter').and.callFake((param) => {
          if (param === "pageType") {
            return 'DirectTime';
          }

          return mockIdAndTime;
        })
        spyOn(requestService, 'getLeagueName').and.returnValue(of(mockLeague));

        await component.ngOnInit();

        expect(component.leagueId).toEqual(Number(mockIdAndTime));
        expect(component.time).toEqual(Number(mockIdAndTime));
        expect(component.leagueName).toEqual(mockLeague.leagueName);
        expect(component.autoType).toEqual(AutoType.direct);
      }));

      it('should set InstantTime setting for autoType', fakeAsync(async() => {
        const mockIdAndTime = '1000';
        const mockLeague: League = { leagueName: 'Champion League'};
        component.pageType = 'InstantTime';
        spyOn(UrlHelper, 'getUrlParameter').and.returnValue(mockIdAndTime);
        spyOn(requestService, 'getLeagueName').and.returnValue(of(mockLeague));

        await component.ngOnInit();

        expect(component.autoType).toEqual(AutoType.instant);
      }));
    });

    describe('proceed', () => {
      it('should pass all validation and successfully close pop-up', fakeAsync(() => {
        component.time = 10;
        spyOn(requestService, 'proceed').and.returnValue(of(successfulResult));
        spyOn(closePopupService, 'closePopupInstant');

        component.proceed();
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(closePopupService.closePopupInstant).toHaveBeenCalled();
      }));

      it('should return error message when result is unsuccessful', fakeAsync(() => {
        component.time = 10;
        spyOn(requestService, 'proceed').and.returnValue(of(unSuccessfulResult));

        component.proceed();
        const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
        buttonYes.click();
        tick();

        expect(component.errorMessage).toEqual(errorMessage);
      }));

      it('should alert when input time is out of range', () => {
        component.time = 301;
        spyOn(messageBoxService, 'alert');

        component.proceed();
        const expectedMessage = Language.InstantSetting.InvalidTimeSetting;

        expect(component.warningDialogMessage.message).toEqual(expectedMessage);
        expect(messageBoxService.alert).toHaveBeenCalled();
      });
    });
});