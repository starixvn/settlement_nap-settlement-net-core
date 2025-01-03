import { HttpClientModule, HttpUrlEncodingCodec } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { Permission, Remark, RemarkAndPermission, RemarkStatus } from '../../models';
import { RequestService } from '../../services/request.service';
import { RemarkSettingComponent } from './remark-setting.component';
import { UrlHelper } from '../../../helper';
import { cloneDeep } from 'lodash';
import * as exp from 'constants';

describe('SettlementSettingComponent', () => {
  let component: RemarkSettingComponent;
  let fixture: ComponentFixture<RemarkSettingComponent>;
  let requestService: RequestService;
  let messageBoxService : MessageBoxService;
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
        RemarkSettingComponent
      ],
    })
    .compileComponents()
    .then(() => {
      fixture = TestBed.createComponent(RemarkSettingComponent);
      messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
      requestService = fixture.debugElement.injector.get(RequestService);
      component = fixture.componentInstance;
      jest.spyOn(requestService, 'getRemarkInfo').mockResolvedValue(mockRemarkedResult);
      fixture.detectChanges();
    });
  }))

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit - should set properties and get remark info', () => {
    jest.spyOn(requestService, 'getRemarkInfo').mockResolvedValue(mockRemarkedResult);
    jest.spyOn(UrlHelper, 'getUrlParameter').mockImplementation((param) => {
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

  it('refreshRemarkStatusOnMainPage - should call refreshRemarkStatus on parent window', () => {
    window.parent['Sportsbook'] = {
      refreshRemarkStatus: jest.fn()
    };

    component.matchId = '12345';

    component.refreshRemarkStatusOnMainPage(mockRemarkedResult.match.remark, 'abc', 'def');

    expect(window.parent['Sportsbook'].refreshRemarkStatus).toHaveBeenCalledWith('12345', mockRemarkedResult.match.remark, 'abc', 'def', mockRemarkedResult.permission);
  });

  it('cancel - should close popup', () => {
    jest.spyOn(messageBoxService, 'closePopupNotChanged');

    component.cancel();

    expect(messageBoxService.closePopupNotChanged).toHaveBeenCalled();
  });

  describe('submit', () => {

    it('should show confirmation box and call changeHoldMatchSetting', () => {
      jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
        callback();
      });
      
      component.submit();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should call changeHoldMatchSetting with correct params', fakeAsync(() => {
      jest.spyOn(messageBoxService, 'confirm').mockImplementation((message, callback) => {
        callback();
      });

      const result: RemarkAndPermission = {
        match: new RemarkStatus(),
        permission: new Permission(),
      };
      component.orgRemark = { isPending: true} as Remark;
      component.remark  = { isPending: false} as Remark;
      component.isMtdApplyChild = true;
      component.isUndecidedApplyChild = false;
      const holdSetting = Object.keys(new Remark()).map((key) => ({
        name: key,
        value: undefined,
        isApplyChild: false,
      } ));
      const orgSettings = cloneDeep(holdSetting);
      orgSettings[0].value = true;
      holdSetting[3].isApplyChild = true;
      holdSetting[0].value = false;

      const request = {
        matchId: component.matchId,
        remark: component.remark,
        holdSettings: holdSetting,
        orgHoldSettings: orgSettings
      };

      jest.spyOn(requestService, 'changeHoldMatchSetting').mockResolvedValue(result);
      jest.spyOn(messageBoxService, 'closePopupNotChanged');
      jest.spyOn(component, 'refreshRemarkStatusOnMainPage');

       component.submit();
       tick();

      expect(component.refreshRemarkStatusOnMainPage).toHaveBeenCalled();
      expect(requestService.changeHoldMatchSetting).toHaveBeenCalledWith(request);
      expect(messageBoxService.closePopupNotChanged).toHaveBeenCalled();
    }));
  })

});
