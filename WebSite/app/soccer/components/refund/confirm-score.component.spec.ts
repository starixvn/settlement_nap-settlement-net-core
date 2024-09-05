import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastNoAnimationModule, ToastrModule, ToastrService } from 'ngx-toastr';
import { MaterialModule } from '../../../shared/material-module';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { VerificationBaseService } from '../../services/verification-base.service';

import { ConfirmScoreComponent } from './confirm-score.component';
import { RefundType } from './model/constant.native';
import { BetDaq, BetFair, Match, MatchDetail } from './model/match.model';
import { RequestService } from './services/request.service';
import { VerifyActionService } from './services/verify-action.service';
import { VerifyMatchService } from './services/verify-match.service';


export class MatDialogRefMock {
  close(value = false) {

  }
}
describe('ConfirmScoreComponent', () => {
  let component: ConfirmScoreComponent;
  let fixture: ComponentFixture<ConfirmScoreComponent>;
  let verifyActionService: VerifyActionService;
  let dialogRef: MatDialogRef<ConfirmScoreComponent>;
  let toastrService: ToastrService;
  let dialog: MatDialog;
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

  const refundType = RefundType.refundAll;

  const data = {
    match,
    refundType,
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfirmScoreComponent],
      providers: [
        VerifyActionService,
        VerifyMatchService,
        VerificationBaseService,
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
        FormsModule,
        ToastNoAnimationModule.forRoot(),
        ToastrModule.forRoot(),
      ]

    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmScoreComponent);
    verifyActionService = fixture.debugElement.injector.get(VerifyActionService);
    dialogRef = fixture.debugElement.injector.get(MatDialogRef);
    toastrService = fixture.debugElement.injector.get(ToastrService);
    dialog = fixture.debugElement.injector.get(MatDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('ChangeScore', () => {
    it('Score inconsistent false when HT score empty', () => {
      matchDetail.halfTimeAwayScore = null;
      matchDetail.halfTimeHomeScore = 1;
      matchDetail.finalAwayScore = 1;
      matchDetail.finalHomeScore = 1;
      component.matchDetail = matchDetail;

      component.changeScore();

      expect(component.matchDetail.isScoreInconsistent).toBeFalsy();
    });

    it('Score inconsistent false when FT score empty', () => {
      matchDetail.halfTimeAwayScore = 1;
      matchDetail.halfTimeHomeScore = 1;
      matchDetail.finalAwayScore = null;
      matchDetail.finalHomeScore = 1;
      component.matchDetail = matchDetail;

      component.changeScore();

      expect(component.matchDetail.isScoreInconsistent).toBeFalsy();
    });

    it('Score inconsistent true when FT score slower than HT score', () => {
      matchDetail.halfTimeAwayScore = 1;
      matchDetail.halfTimeHomeScore = 2;
      matchDetail.finalAwayScore = 1;
      matchDetail.finalHomeScore = 1;
      component.matchDetail = matchDetail;

      component.changeScore();

      expect(component.matchDetail.isScoreInconsistent).toBeTruthy();
    });
  });

  describe('change', () => {
    it('should enable input ht and clear ft score when type is refund All', () => {
      matchDetail.finalAwayScore = 1;
      matchDetail.finalHomeScore = 1;
      component.matchDetail = matchDetail;
      component.isRefundAll = true;
      component.change();

      expect(component.disableInputFT).toBeTruthy();
      expect(component.disableInputHT).toBeFalsy();
      expect(component.matchDetail.finalAwayScore).toBeNull();
      expect(component.matchDetail.finalHomeScore).toBeNull();
    });

    it('should enable input ft when type is refund FT', () => {
      matchDetail.finalAwayScore = 1;
      matchDetail.finalHomeScore = 1;
      component.matchDetail = matchDetail;
      component.isRefundAll = false;
      component.change();

      expect(component.disableInputFT).toBeFalsy();
      expect(component.disableInputHT).toBeTruthy();
      expect(component.matchDetail.finalAwayScore).toEqual(1);
      expect(component.matchDetail.finalHomeScore).toEqual(1);
    });
  });

  describe('proceedRefundFullTime', () => {
    it('should close popup and return true when verify passed', () => {
      jest.spyOn(verifyActionService, 'verifyFulltime').mockReturnValue('');
      jest.spyOn(dialogRef, 'close');

      component.proceedRefundFullTime();

      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should show error when verify failed', () => {
      jest.spyOn(verifyActionService, 'verifyFulltime').mockReturnValue('error');
      jest.spyOn(toastrService, 'error');

      component.proceedRefundFullTime();

      expect(toastrService.error).toHaveBeenCalledWith('error');
    });
  });

  describe('proceedRefundAll', () => {
    it('should close popup and return true when verify passed', () => {
      jest.spyOn(verifyActionService, 'verifyAll').mockReturnValue('');
      jest.spyOn(dialogRef, 'close');

      component.proceedRefundAll();

      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should show error when verify failed', () => {
      jest.spyOn(verifyActionService, 'verifyAll').mockReturnValue('error');
      jest.spyOn(toastrService, 'error');

      component.proceedRefundAll();

      expect(toastrService.error).toHaveBeenCalledWith('error');
    });
  });


  it('openPopupSpecificBetTypes - open popup', () => {
    jest.spyOn(dialog, 'open');

    component.openPopupSpecificBetTypes('Normal');

    expect(dialog.open).toHaveBeenCalled();
  });
});
