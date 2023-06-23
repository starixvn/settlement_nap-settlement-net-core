import { TestBed, waitForAsync, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientModule } from '@angular/common/http';
import { ResourceNameByIdPipe, ExcludeTotalPointPipe, ResourceHeaderPipe } from '../pipes';
import {
  ModalContentDialogComponent
} from '../../shared/components/modal-dialog/modal-content-dialog.component';
import {
  MessageBoxService,
  AioService
} from '../../shared/services';
import { HedgeMatchDetail, Match } from '../models';
import { BadmintonApiKeys } from '../constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';
import { MatchDetail, Permission, ResultDetail } from '../../shared/models/sportsbook-sop';
import { Result, ResultSettingModel } from '../../shared/models';
import { ToastContainerModule, ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { ModalDialogComponent } from '../../shared/components/modal-dialog/modal-dialog.component';
import { RefundActionsComponent } from './refund-actions.component';
import { MatchDetailComponent } from './match-detail.component';

describe('Badminton - Refund actions component', () => {
  let component: RefundActionsComponent;
  let fixture: ComponentFixture<RefundActionsComponent>;
  let aioService: AioService;
  let messageBoxService: MessageBoxService;
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
  const successfulResult: Result = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
    childMatchIds: ''
  };
  const unSuccessfulResult: Result = {
    errCode: 1,
    errMsg: errorMessage,
    isSuccessful: false,
    childMatchIds: ''
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
        ModalDialogComponent,
        ModalContentDialogComponent
      ],
      imports: [
        RefundActionsComponent,
        MatchDetailComponent,
        HttpClientModule,
        ToastNoAnimationModule.forRoot(),
        ToastContainerModule,
        ToastrModule.forRoot(),
        ExcludeTotalPointPipe,
        IntervalBackgroundPipe,
        ResourceHeaderPipe,
        ScoreBySettlementPipe,
        ResourceNameByIdPipe
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
        messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
        toastrService = fixture.debugElement.injector.get(ToastrService);
        toastrService.clear = jest.fn();
        messageBoxService.closePopup = jest.fn();
        component.apiKeys = BadmintonApiKeys;
        component.initService();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getMatch - should call get-match service and set components properties', async () => {
    aioService.getMatch = jest.fn().mockReturnValue(Promise.resolve(match));

    await component.getMatch(1234);

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
      toastrService.error = jest.fn();
    });

    it('should refund successfully when all verifications passed', fakeAsync(async () => {
      component.applyHedgeMatch = false;
      aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(notExistMarkedTicket));
      aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));

      await component.refund();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should push twice when match is applied hedge match', fakeAsync(async () => {
      component.applyHedgeMatch = true;
      component.hedgeMatchDetail.matchId = 12345;
      aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(notExistMarkedTicket));
      aioService.push = jest.fn().mockReturnValue(Promise.resolve(successfulResult));

      await component.refund();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(aioService.push).toHaveBeenCalledTimes(2);
    }));

    it('should raise error when all verifications passed but fail to refund', fakeAsync(async () => {
      component.applyHedgeMatch = false;
      aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(notExistMarkedTicket));
      aioService.push = jest.fn().mockReturnValue(Promise.resolve(unSuccessfulResult));

      await component.refund();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(errorMessage);
    }));

    it('should raise error when there is result not confirmed', async () => {
      resultDetail.resultSettingData.isConfirmedRefund = false;
      aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(notExistMarkedTicket));

      await component.refund();

      expect(toastrService.error).toHaveBeenCalledWith('WARNING! Cannot continue due to selected results are not confirmed to refund. Please confirm refund and try again.');
    });

    it('should raise error when there is marked ticket', async () => {
      aioService.checkMarkedTickets = jest.fn().mockReturnValue(Promise.resolve(existMarkedTicket));

      await component.refund();

      expect(toastrService.error).toHaveBeenCalledWith('ERROR! Cannot proceed due to marked tickets. Please unmark them and try again.');
    });
  })
});