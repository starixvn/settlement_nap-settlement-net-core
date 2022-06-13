import { HttpClientModule, HttpUrlEncodingCodec } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../shared/components';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { Permission, Remark, RemarkAndPermission, RemarkStatus } from '../models';
import { RequestService } from '../services/request.service';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { RemarkSettingComponent } from './remark-setting.component';
import { UrlHelper } from '../../helper';

describe('SettlementSettingComponent', () => {
  let component: RemarkSettingComponent;
  let fixture: ComponentFixture<RemarkSettingComponent>;
  let requestService: RequestService;
  const buttonName = 'btn-danger';
  const mockRemarkedResult: RemarkAndPermission = {
    match: new RemarkStatus(),
    permission: new Permission(),
  };
  mockRemarkedResult.match.remark = new Remark();
  mockRemarkedResult.match.remark.isMtdHold = true;
  mockRemarkedResult.match.eventStatus = 'abc';


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        RemarkSettingComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
      providers: [
        RequestService,
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        NgbModal,
        HttpUrlEncodingCodec,
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
        entryComponents: [
          ModalDialogComponent,
          ModalContentDialogComponent,
        ],
      },
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(RemarkSettingComponent);
      component = fixture.componentInstance;
      requestService = fixture.debugElement.injector.get(RequestService);
      spyOn(requestService, 'getRemarkInfo').and.returnValue(of(mockRemarkedResult));
      fixture.detectChanges();
    });
  }))

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - should set properties and get remark info', () => {
    spyOn(UrlHelper, 'getUrlParameter').and.callFake((param) => {
      if (param === 'matchId') {
        return '12345'
      }

      return 'test-match';
    });

    component.ngOnInit();

    expect(component.matchId).toEqual('12345');
    expect(component.matchCode).toEqual('test-match');
    expect(component.remark).toEqual(mockRemarkedResult.match.remark);
    expect(component.permission).toEqual(mockRemarkedResult.permission);
  });

  describe('Change Settings', () => {
    it('changeMTDHoldSetting - should set new setting and lock links', fakeAsync(() => {
      spyOn(requestService, 'changeSetting').and.returnValue(of(mockRemarkedResult));
      spyOn(component, 'refreshRemarkStatusOnMainPage');

      component.changeMTDHoldSetting();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.remark).toEqual(mockRemarkedResult.match.remark);
      expect(component.refreshRemarkStatusOnMainPage).toHaveBeenCalled();
    }));

    it('changeUndecidedSetting - should set new setting', fakeAsync(() => {
      spyOn(requestService, 'changeSetting').and.returnValue(of(mockRemarkedResult));
      spyOn(component, 'refreshRemarkStatusOnMainPage');

      component.changeUndecidedSetting();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.remark).toEqual(mockRemarkedResult.match.remark);
      expect(component.refreshRemarkStatusOnMainPage).toHaveBeenCalled();
    }));

    it('changePendingSetting - should set new setting', fakeAsync(() => {
      spyOn(requestService, 'changeSetting').and.returnValue(of(mockRemarkedResult));
      spyOn(component, 'refreshRemarkStatusOnMainPage');

      component.changePendingSetting();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.remark).toEqual(mockRemarkedResult.match.remark);
      expect(component.refreshRemarkStatusOnMainPage).toHaveBeenCalled();
    }));

    it('changeUnderSettleSetting - should set new setting', fakeAsync(() => {
      spyOn(requestService, 'changeSetting').and.returnValue(of(mockRemarkedResult));
      spyOn(component, 'refreshRemarkStatusOnMainPage');

      component.changeUnderSettleSetting();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.remark).toEqual(mockRemarkedResult.match.remark);
      expect(component.refreshRemarkStatusOnMainPage).toHaveBeenCalled();
    }));
  });
});
