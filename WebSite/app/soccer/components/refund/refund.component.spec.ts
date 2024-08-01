import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ScorePipe } from '../../pipes/score.pipe';
import { MaterialModule } from '../../../shared/material-module';
import { RefundMatchDetailComponent } from './refund-match-detail.component';

import { RefundComponent } from './refund.component';
import { RequestService } from './services/request.service';
import { VerifyActionService } from './services/verify-action.service';
import { VerifyMatchService } from './services/verify-match.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { HttpClientModule } from '@angular/common/http';
import { MainRefundButtonStatus } from './model/button-status';
import { BetDaq, BetFair, MatchDetail, Match, HedgeMatchDetail } from './model/match.model';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MarkedTicketsModel } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ModalContentDialogComponent, ModalDialogComponent } from '../../../shared/components';
import { RefundType } from './model/constant.native';

describe('RefundComponent', () => {
  let component: RefundComponent;
  let fixture: ComponentFixture<RefundComponent>;
  let requestService: RequestService;
  let verifyMatchService: VerifyMatchService;
  let dialog: MatDialog;
  let toastrService: ToastrService;
  let messageBoxService: MessageBoxService;
  let verifyActionService: VerifyActionService;
  const matchDetail = {} as MatchDetail;
  const betDaq = {} as BetDaq;
  const betFair = {} as BetFair;
  const match: Match = {
    matchDetail,
    permission: null,
    resultDetails: [],
    hedgeMatchDetail: null,
    betDaq,
    betFair
  };

  const hedgeMatchDetail = {} as HedgeMatchDetail;

  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
  }
  const unSuccessfulResult = {
    errCode: 1,
    errMsg: 'errorMessage',
    isSuccessful: false,
  };

  const resultMarkedTickets = {} as MarkedTicketsModel;

  const buttonName = "btn-danger";


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        RefundComponent,
        RefundMatchDetailComponent,
        ScorePipe,
        ModalDialogComponent,
        ModalContentDialogComponent
      ],
      providers: [
        RequestService,
        VerifyMatchService,
        VerifyActionService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        { provide: MessageBoxService, useClass: MessageBoxService },
        { provide: ToastrService, useClass: ToastrService },
      ],
      imports: [
        NgbModule,
        FormsModule,
        MaterialModule,
        HttpClientModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot(),
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RefundComponent);
    requestService = fixture.debugElement.injector.get(RequestService);
    verifyMatchService = fixture.debugElement.injector.get(VerifyMatchService);
    verifyActionService = fixture.debugElement.injector.get(VerifyActionService);
    dialog = fixture.debugElement.injector.get(MatDialog);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    messageBoxService = fixture.debugElement.injector.get(MessageBoxService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('getMatch - should call api and set correct value', async () => {
    hedgeMatchDetail.isUndecided = false;
    match.hedgeMatchDetail = hedgeMatchDetail;
    matchDetail.applyGoalRecord = false;
    spyOn(requestService, 'getMatch').and.returnValue(of(match));
    spyOn(verifyMatchService, 'setDisableRefund').and.returnValue(new MainRefundButtonStatus(true, true, true));

    await component.getMatch(1);

    expect(requestService.getMatch).toHaveBeenCalled();
    expect(component.buttonRefundStatus).toEqual(new MainRefundButtonStatus(true, true, true));
    expect(component.matchDetail.applyHedgeMatch).toBeTruthy();
  });

  describe('changeApplyHedgeMatch', () => {
    it('should enable settle determined hedgeMatch when apply hedgeMatch', () => {
      component.matchDetail = matchDetail;
      component.matchDetail.applyHedgeMatch = true;

      component.changeApplyHedgeMatch();

      expect(component.disableSettleDeterminedHedgeMatch).toBeFalsy();
    });

    it('should disable settle determined hedgeMatch when match not apply hedgeMatch', () => {
      component.matchDetail = matchDetail;
      component.matchDetail.applyHedgeMatch = false;

      component.changeApplyHedgeMatch();

      expect(component.disableSettleDeterminedHedgeMatch).toBeTruthy();
      expect(component.isDeterminedHedgeMatch).toBeFalsy();
    });
  });

  describe('openPopupMoveBet', () => {
    it('should close main popup when sub popup move bet close and return successful', () => {
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      const result = successfulResult;
      const mockDialogRef = {
        afterClosed: () => of({ result })
      };
      spyOn(dialog, 'open').and.returnValue(mockDialogRef);
      spyOn(messageBoxService, 'closePopupNotChanged');

      component.openPopupMoveBet(true);

      expect(messageBoxService.closePopupNotChanged).toHaveBeenCalled();
    });

    it('should show error p when sub popup move bet close and return unSuccessful', () => {
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      const result = unSuccessfulResult;
      const mockDialogRef = {
        afterClosed: () => of({ result })
      };
      spyOn(dialog, 'open').and.returnValue(mockDialogRef);
      spyOn(toastrService, 'clear');
      spyOn(toastrService, 'error');

      component.openPopupMoveBet(true);

      expect(toastrService.clear).toHaveBeenCalled();
      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    });
  });

  describe('refundHalftime', () => {
    it('should show error when match marked ticket with refund HT', async () => {
      resultMarkedTickets.isExistMarkedTicket = true
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(toastrService, 'error');

      await component.refundHalftime();

      expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
    });

    it('should show error when match status is not pass', async () => {
      resultMarkedTickets.isExistMarkedTicket = false
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(requestService, 'checkNewStatus').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      await component.refundHalftime();

      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    });

    it('should show confirm when match pass all validation', async () => {
      resultMarkedTickets.isExistMarkedTicket = false
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(requestService, 'checkNewStatus').and.returnValue(of(successfulResult));
      spyOn(messageBoxService, 'confirm');
      spyOn(toastrService, 'error');

      await component.refundHalftime();

      expect(messageBoxService.confirm).toHaveBeenCalled();
    });

    it('should close popup when refund done', fakeAsync(async () => {
      resultMarkedTickets.isExistMarkedTicket = false
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      component.betDaq = betDaq;
      component.betFair = betFair;
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(requestService, 'checkNewStatus').and.returnValue(of(successfulResult));
      spyOn(requestService, 'refundMatch').and.returnValue(of(successfulResult));
      spyOn(messageBoxService, 'closePopup');

      await component.refundHalftime();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(messageBoxService.closePopup).toHaveBeenCalled();
    }));

    it('should show error when refund return fail', fakeAsync(async () => {
      resultMarkedTickets.isExistMarkedTicket = false
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      component.betDaq = betDaq;
      component.betFair = betFair;
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(requestService, 'checkNewStatus').and.returnValue(of(successfulResult));
      spyOn(requestService, 'refundMatch').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      await component.refundHalftime();
      tick();
      const buttonYes = document.getElementsByClassName(buttonName)[0] as HTMLElement;
      buttonYes.click();
      tick();

      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    }));
  });

  describe('refundFullTime', () => {

    it('should show error when match marked ticket with refund FT', async () => {
      resultMarkedTickets.isExistMarkedTicket = true
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(toastrService, 'error');

      await component.refundFullTime();

      expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
    });

    it('should open confirm score popup when sub popup confirm refund return true', async () => {
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      resultMarkedTickets.isExistMarkedTicket = false;
      const result = true;
      const mockDialogRef = {
        afterClosed: () => of({ result })
      };
      spyOn(dialog, 'open').and.returnValue(mockDialogRef);
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(verifyActionService, 'getMessageConfirm').and.returnValue("");

      await component.refundFullTime();

      expect(dialog.open).toHaveBeenCalledTimes(2);
    });

    it('should check marked ticket again and show confirm when sub popup close and return request refund match', async () => {
      component.match = match;
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      resultMarkedTickets.isExistMarkedTicket = false;
      const mockDialogRef = {
        afterClosed: () => of(false)
      };
      spyOn(dialog, 'open').and.returnValue(mockDialogRef);
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(messageBoxService, 'confirm');

      await component.refundFullTime();

      expect(requestService.checkingMarkedTicket).toHaveBeenCalledTimes(2);
      expect(messageBoxService.confirm).toHaveBeenCalled();
    });
  });

  describe('refundAll', () => {

    it('should show error when match marked ticket', async () => {
      resultMarkedTickets.isExistMarkedTicket = true
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(toastrService, 'error');

      await component.refundAll();

      expect(toastrService.error).toHaveBeenCalledWith(Language.MarkedTicket);
    });

    it('should open confirm score popup when sub popup confirm refund return true', async () => {
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      resultMarkedTickets.isExistMarkedTicket = false;
      const result = true;
      const mockDialogRef = {
        afterClosed: () => of({ result })
      };
      spyOn(dialog, 'open').and.returnValue(mockDialogRef);
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(verifyActionService, 'getMessageConfirm').and.returnValue("");

      await component.refundAll();

      expect(dialog.open).toHaveBeenCalledTimes(2);
    });

    it('should check marked ticket again and show confirm when sub popup close and return request refund match', async () => {
      component.match = match;
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      resultMarkedTickets.isExistMarkedTicket = false;
      const mockDialogRef = {
        afterClosed: () => of(false)
      };
      spyOn(dialog, 'open').and.returnValue(mockDialogRef);
      spyOn(requestService, 'checkingMarkedTicket').and.returnValue(of(resultMarkedTickets));
      spyOn(messageBoxService, 'confirm');

      await component.refundAll();

      expect(requestService.checkingMarkedTicket).toHaveBeenCalledTimes(2);
      expect(messageBoxService.confirm).toHaveBeenCalled();
    });
  });

  describe('refundRunningThirdPartyTickets', () => {
    it('should close popup when refund successful', async () => {
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      spyOn(requestService, 'refundRunningThirdPartyTickets').and.returnValue(of(successfulResult));
      spyOn(messageBoxService, 'closePopup');

      await component.refundRunningThirdPartyTickets(true);

      expect(requestService.refundRunningThirdPartyTickets).toHaveBeenCalledWith(100, RefundType.refundBetDaq);
      expect(messageBoxService.closePopup).toHaveBeenCalled();
    });

    it('should close popup when refund successful', async () => {
      component.matchDetail = matchDetail;
      component.matchDetail.matchId = 100;
      spyOn(requestService, 'refundRunningThirdPartyTickets').and.returnValue(of(unSuccessfulResult));
      spyOn(toastrService, 'error');

      await component.refundRunningThirdPartyTickets(true);

      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    });
  });
});
