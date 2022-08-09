import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ResourceNameByIdPipe, ExcludeTotalPointPipe, ResourceHeaderPipe } from '../pipes';
import { MatchDetailComponent, RefundActionsComponent } from './';
import {
  ModalDialogComponent,
  ModalContentDialogComponent,
} from '../../shared/components';
import {
  HttpRequestService,
  BlockUIService,
  MessageBoxService,
  ClosePopupService,
  AioService
} from '../../shared/services';
import { HedgeMatchDetail, Match } from '../models';
import { BadmintonApiKeys, ResourcesIds } from '../constants';
import { of } from 'rxjs';
import { Language } from '../../shared/language';
import { CalculateAction, SettlementStatusId } from '../../shared/constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';
import { MatchDetail, Permission, ResultDetail, SettleQuery } from '../../shared/models/sportsbook-sop';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ResultSettingModel } from '../../shared/models';
import { ToastContainerDirective, ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';

describe('Badminton - Refund actions component', () => {
  let component: RefundActionsComponent;
  let fixture: ComponentFixture<RefundActionsComponent>;
  let aioService: AioService;
  let closePopupService: ClosePopupService;
  const buttonName = "btn-danger";
  const matchDetail = new MatchDetail();
  matchDetail.matchId = 1;
  const match = new Match(matchDetail);
  const resultDetail = new ResultDetail();
  resultDetail.checked = true;
  resultDetail.resultSettingData = new ResultSettingModel();
  match.resultDetails = [resultDetail, resultDetail];
  let toastrService: ToastrService;

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
  const existMarkedTicket = {
    isExistMarkedTicket: true,
  };
  const notExistMarkedTicket = {
    isExistMarkedTicket: false,
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        RefundActionsComponent,
        MatchDetailComponent,
        ResourceNameByIdPipe,
        ModalDialogComponent,
        ModalContentDialogComponent,
        ExcludeTotalPointPipe,
        IntervalBackgroundPipe,
        ResourceHeaderPipe,
        ScoreBySettlementPipe,
      ],
      providers: [
        MessageBoxService,
        HttpRequestService,
        BlockUIService,
        ClosePopupService,
        AioService,
        NgbModal,
        ToastContainerDirective,
        ToastrService,
        { provide: MessageBoxService, useClass: MessageBoxService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        FormsModule,
        HttpClientModule,
        NgbModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot()
      ],
    })
      .overrideModule(BrowserDynamicTestingModule, {
        set: {
          entryComponents: [ModalDialogComponent, ModalContentDialogComponent],
        },
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(RefundActionsComponent);
        component = fixture.componentInstance;
        aioService = fixture.debugElement.injector.get(AioService);
        closePopupService = fixture.debugElement.injector.get(ClosePopupService);
        spyOn(closePopupService, 'closePopup').and.callFake(() => { });
        toastrService = fixture.debugElement.injector.get(ToastrService);
        spyOn(toastrService, 'clear');
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getMatch - should call get-match service and set components properties', async () => {
    spyOn(aioService, 'getMatch').and.returnValue(of(match));

    await component.getMatch(1234, '');

    expect(aioService.getMatch).toHaveBeenCalled();
  });

  describe('refund', () => {
    beforeEach(() => {
      resultDetail.resultSettingData.isConfirmedRefund = true;
      component.match = match;
      component.resultDetails = [resultDetail];
      component.matchDetail = matchDetail;
      component.permission = new Permission();
      component.hedgeMatchDetail = new HedgeMatchDetail();
      spyOn(toastrService, 'error');
    });

    it('should refund successfully when all verifications passed', fakeAsync(async () => {
      component.applyHedgeMatch = false;
      spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(notExistMarkedTicket));
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));

      await component.refund();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(closePopupService.closePopup).toHaveBeenCalled();
    }));

    it('should push twice when match is applied hedge match', fakeAsync(async () => {
      component.applyHedgeMatch = true;
      component.hedgeMatchDetail.matchId = 12345;
      spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(notExistMarkedTicket));
      spyOn(aioService, 'push').and.returnValue(of(successfulResult));

      await component.refund();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(aioService.push).toHaveBeenCalledTimes(2);
    }));

    it('should raise error when all verifications passed but fail to refund', fakeAsync(async () => {
      component.applyHedgeMatch = false;
      spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(notExistMarkedTicket));
      spyOn(aioService, 'push').and.returnValue(of(unSuccessfulResult));

      await component.refund();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should raise error when there is result not confirmed', async () => {
      resultDetail.resultSettingData.isConfirmedRefund = false;
      spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(notExistMarkedTicket));

      await component.refund();

      expect(toastrService.error).toHaveBeenCalledWith('WARNING! Cannot continue due to selected results are not confirmed to refund. Please confirm refund and try again.');
    });

    it('should raise error when there is marked ticket', async () => {
      spyOn(aioService, 'checkMarkedTickets').and.returnValue(of(existMarkedTicket));

      await component.refund();

      expect(toastrService.error).toHaveBeenCalledWith('ERROR! Cannot proceed due to marked tickets. Please unmark them and try again.');
    });
  })
});