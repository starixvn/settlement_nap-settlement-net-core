import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ResultDetail, SpecialSession } from '../models';
import { MaterialModule } from '../../shared/material-module';

import { SpecialSessionComponent } from './special-session.component';
import { RequestService } from '../services';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../shared/services';
import { HttpClientModule } from '@angular/common/http';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../shared/components';
import { Result } from '../../shared/models';
import { of } from 'rxjs';
import { SessionId } from '../constants';
import * as _ from 'lodash';

describe('SpecialSessionComponent', () => {
  let component: SpecialSessionComponent;
  let fixture: ComponentFixture<SpecialSessionComponent>;
  let requestService: RequestService;
  let messageBoxService: MessageBoxService;

  const resultDetail = new ResultDetail();
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SpecialSessionComponent,
        ModalDialogComponent,
        ModalContentDialogComponent,
      ],
      providers: [
        RequestService,
        HttpRequestService,
        BlockUIService,
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
      imports: [
        NgbModule,
        FormsModule,
        MaterialModule,
        HttpClientModule,

      ],
    }).overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
      },
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecialSessionComponent);
    requestService = TestBed.inject(RequestService);
    messageBoxService = TestBed.inject(MessageBoxService);
    component = fixture.componentInstance;
    component.resultDetail = [resultDetail];
    fixture.detectChanges();
  });

  it('should create', waitForAsync(() => {
    expect(component).toBeTruthy();
  }));

  it('verifyResult - should generate correct result', () => {
    const mockResultDetail = new ResultDetail();
    mockResultDetail.awayValue = 2;
    mockResultDetail.homeValue = 1;
    mockResultDetail.otherInfo = "1:3,2:4";
    mockResultDetail.resourceId = "221WB01";
    mockResultDetail.isApply = 0;

    component.resultDetail = [mockResultDetail];
    component.ngOnChanges();

    expect(component.waterBreakOne.startMinute).toEqual(1);
    expect(component.waterBreakOne.startSecond).toEqual(3);
    expect(component.waterBreakOne.endMinute).toEqual(2);
    expect(component.waterBreakOne.endSecond).toEqual(4);
    expect(component.waterBreakOne.apply).toBe(true);
  });

  it('changeMinute - should reset minute when input value higher than max.', () => {
    const mockSession = new SpecialSession('');
    mockSession.startMinute = 91;
    mockSession.endMinute = 92;

    component.changeMinute(mockSession);

    expect(mockSession.startMinute).toEqual(9);
    expect(mockSession.endMinute).toEqual(9);
  });

  it('changeSecond - should reset second when input value higher than max.', () => {
    const mockSession = new SpecialSession('');
    mockSession.startMinute = 14;
    mockSession.endMinute = 12;
    mockSession.startSecond = 68;
    mockSession.endSecond = 68;
    mockSession.apply = true;

    component.changeSecond(mockSession);

    expect(mockSession.startSecond).toEqual(6);
    expect(mockSession.endSecond).toEqual(6);
    expect(mockSession.color).toEqual('invalidTime');
  });

  describe('saveAndSelect', () => {
    let waterBreak: SpecialSession;

    beforeEach(() => {
      waterBreak = new SpecialSession(SessionId.waterBreakOne);
      waterBreak.startMinute = 1;
      waterBreak.startSecond = 12;
      waterBreak.endMinute = 3;
      waterBreak.endSecond = 12;
      waterBreak.color = '';
    })

    it('should emit new water break when successfully delete water break', fakeAsync(() => {
      const successfulResult = new Result();
      component.originalWaterBreakOne = _.cloneDeep(waterBreak);
      component.originalWaterBreakOne.apply = true;
      successfulResult.isSuccessful = true;
      spyOn(requestService, 'updateWaterBreakSetting').and.returnValue(of(successfulResult));
      spyOn(component.waterBreakFilter, 'emit');

      component.saveAndSelectWaterBreak(waterBreak);
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.waterBreakFilter.emit).toHaveBeenCalled();
    }));

    it('should alert when no change was made', () => {
      component.originalWaterBreakOne = _.cloneDeep(waterBreak);
      spyOn(messageBoxService, 'alert');

      component.saveAndSelectWaterBreak(waterBreak);

      expect(messageBoxService.alert).toHaveBeenCalled();
    });

    it('should successfully select water break when water break is applied and no change was made', fakeAsync(() => {
      waterBreak.apply = true;
      waterBreak.resultStatusId = 5;
      component.originalWaterBreakOne = _.cloneDeep(waterBreak);
      spyOn(component.waterBreakFilter, 'emit');

      component.saveAndSelectWaterBreak(waterBreak);
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.waterBreakFilter.emit).toHaveBeenCalled();
    }));

    it('should successfully update water break when water break is applied and is changed', fakeAsync(() => {
      waterBreak.apply = true;
      const successfulResult = new Result();
      component.originalWaterBreakOne = _.cloneDeep(waterBreak);
      successfulResult.isSuccessful = true;
      spyOn(requestService, 'updateWaterBreakSetting').and.returnValue(of(successfulResult));
      spyOn(component.waterBreakFilter, 'emit');

      component.saveAndSelectWaterBreak(waterBreak);
      const buttonYes = document.getElementsByClassName('btn-danger')[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(component.waterBreakFilter.emit).toHaveBeenCalled();
    }));

    it('should alert when fail on verifying before action', () => {
      waterBreak = new SpecialSession('1234');
      waterBreak.apply = true;
      spyOn(messageBoxService, 'alert');

      component.saveAndSelectWaterBreak(waterBreak);

      expect(messageBoxService.alert).toHaveBeenCalled();
    });
  });

  it('isErrorOnVerification - should return true when time is invalid', () => {
    const waterBreak = new SpecialSession('');
    waterBreak.apply = true;
    waterBreak.isSaveButtonPressed = true;

    const result = component.isErrorOnVerification(undefined, waterBreak);

    expect(result).toBe(true);
  });
});
