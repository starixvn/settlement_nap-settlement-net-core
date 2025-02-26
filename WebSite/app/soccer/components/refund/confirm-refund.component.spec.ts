import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { CalculateAction } from '../../../shared/constants';
import { MaterialModule } from '../../../shared/material-module';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { ConfirmRefundComponent } from './confirm-refund.component';
import { RefundType } from './model/constant.model';
import { BetDaq, BetFair, Match, MatchDetail } from './model/match.model';
import { RequestService } from './services/request.service';
import { VerifyMatchService } from './services/verify-match.service';

export class MatDialogRefMock {
  close(value = false) {

  }
}
describe('ConfirmRefundComponent', () => {
  let component: ConfirmRefundComponent;
  let dialogRef: MatDialogRef<ConfirmRefundComponent>;
  let fixture: ComponentFixture<ConfirmRefundComponent>;
  let toastrService: ToastrService;
  let requestService: RequestService;
  let verifyMatchService: VerifyMatchService;

  const matchDetail = {} as MatchDetail;
  const betFair = {} as BetFair;
  const betDaq = {} as BetDaq;

  
const permission = {
  canCalculate: true,
  canUncalculate: false,
  canRefund: false,
  isLeader: false,
  canUncalculateInstant: false,
  isTrader: false,
  canViewSettlementLog: false,
  canAutoPayout: false,
  canMarkPending: false,
  canMarkUnDecided: false,
  canChangeScoreSource: false
};

  const match: Match = {
    matchDetail,
    permission: permission,
    resultDetails: [],
    hedgeMatchDetail: null,
    betDaq,
    betFair
  };

  const refundType = RefundType.refundAll;

  const data = {
    match,
    refundType,
  }
  const errorMessage = "Error message";
  const successfulResult = {
    errCode: 0,
    errMsg: "",
    isSuccessful: true,
    childMatchIds:"",
    settledSessionId:"",
    hasResultAmendment:false
  };
  const unSuccessfulResult = {
      errCode: 1,
      errMsg: errorMessage,
      isSuccessful: false,
      childMatchIds:"",
      settledSessionId:"",
      hasResultAmendment:false
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmRefundComponent],
      providers: [
        VerifyMatchService,
        RequestService,
        HttpRequestService,
        BlockUIService,
        MessageBoxService,
        { provide: MessageBoxService, useClass: MessageBoxService },
        { provide: ToastrService, useClass: ToastrService },
        { provide: MatDialogRef, useValue: new MatDialogRefMock() },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      imports: [
        HttpClientModule,
        MaterialModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot(),
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmRefundComponent);
    dialogRef = fixture.debugElement.injector.get(MatDialogRef);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    requestService = fixture.debugElement.injector.get(RequestService);
    verifyMatchService = fixture.debugElement.injector.get(VerifyMatchService);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#ngOnInit', () => {
    it('should call right function for refund all', () => {
      component.data.refundType = RefundType.refundAll;
      jest.spyOn(verifyMatchService, 'setDisableSubRefundAll');

      component.ngOnInit();

      expect(verifyMatchService.setDisableSubRefundAll).toHaveBeenCalled();
    });

    it('should call right function for refund FT', () => {
      component.data.refundType = RefundType.refundFT;
      jest.spyOn(verifyMatchService, 'setDisableSubRefundFT');

      component.ngOnInit();

      expect(verifyMatchService.setDisableSubRefundFT).toHaveBeenCalled();
    });
  });

  it('close - should call close function', () => {
    jest.spyOn(dialogRef, 'close');

    component.close();

    expect(dialogRef.close).toHaveBeenCalled();
  });

  describe('refundSus', () => {
    it('should close popup and return true when check match status passed', async () => {
      matchDetail.matchId = 10000;
      component.matchDetail = matchDetail;
      jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(dialogRef, 'close');

      await component.refundSus(CalculateAction.refundFullTime);

      expect(dialogRef.close).toHaveBeenCalledWith(true);
      expect(component.matchDetail.isSettleAbandonedMatchIBC).toBeTruthy();
    });

    it('should show error when check match status failed', async () => {
      matchDetail.matchId = 10000;
      component.matchDetail = matchDetail;
      jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(unSuccessfulResult));
      jest.spyOn(toastrService, 'error');

      await component.refundSus(CalculateAction.refundFullTime);

      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    });
  });

  describe('refundNotSdtAndPos', () => {
    it('should close popup and return true when check match status passed and match exist settle determine', async () => {
      matchDetail.matchId = 10000;
      match.betFair.settleDeterminedBetFair = true;
      component.matchDetail = matchDetail;
      component.data.match = match;
      jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(dialogRef, 'close');

      await component.refundNotSdtAndPos(CalculateAction.refundFullTime);

      expect(dialogRef.close).toHaveBeenCalledWith(true);
      expect(component.matchDetail.isSettleAbandonedMatchIBC).toBeFalsy();
    });

    it('should close popup and return false when check match status passed and match not exist settle determine', async () => {
      matchDetail.matchId = 10000;
      match.betFair.settleDeterminedBetFair = false;
      component.matchDetail = matchDetail;
      component.data.match = match;
      jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(successfulResult));
      jest.spyOn(dialogRef, 'close');

      await component.refundNotSdtAndPos(CalculateAction.refundFullTime);

      expect(dialogRef.close).toHaveBeenCalledWith(false);
      expect(component.matchDetail.isSettleAbandonedMatchIBC).toBeFalsy();
    });

    it('should show error when check match status failed', async () => {
      matchDetail.matchId = 10000;
      component.matchDetail = matchDetail;
      jest.spyOn(requestService, 'checkNewStatus').mockReturnValue(Promise.resolve(unSuccessfulResult));
      jest.spyOn(toastrService, 'error');

      await component.refundNotSdtAndPos(CalculateAction.refundFullTime);

      expect(toastrService.error).toHaveBeenCalledWith(unSuccessfulResult.errMsg);
    });
  });
});
