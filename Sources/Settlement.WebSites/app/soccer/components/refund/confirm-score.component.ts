import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RefundType } from './model/constant.native';
import { Match, MatchDetail } from './model/match.model';
import { SpecificBettypeComponent } from './specific-bettype.component';
import * as _ from 'lodash';
import { CalculateAction } from '../../../shared/constants';
import { Language } from '../../../shared/language';
import { VerifyActionService } from './services/verify-action.service';
import { BetStatus } from '../../constants';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { VerifyMatchService } from './services/verify-match.service';
import { VerificationBaseService } from '../../services/verification-base.service';
import { RequestService } from './services/request.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { ModalDialogMessage } from '../../../shared/models';

@Component({
  selector: 'confirm-score',
  templateUrl: './confirm-score.component.html',
  providers: [
    VerifyActionService,
    VerifyMatchService,
    VerificationBaseService,
    RequestService,
    HttpRequestService,
    BlockUIService,
    MessageBoxService,
    VerifyMatchService
  ]
})
export class ConfirmScoreComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public matchDetail: MatchDetail;
  public disableGoalRecordCheckbox: boolean;
  public refundAction: string;
  public betTicket: string;
  public markRemain: string;
  public matchNotRefundHT: boolean;
  private betStatus: string;
  public isWarningScoreHT: boolean;
  public isWarningScoreFT: boolean;
  public isRefundAll: boolean;
  public disableInputFT = true;
  public disableInputHT = true;
  public readonly refundNormalType = "Normal";
  public readonly refundBetFairType = "BetFair";
  public betDaq = this.data.match.betDaq;
  public betFair = this.data.match.betFair;
  public dialogMessage = new ModalDialogMessage();

  constructor(private readonly verifyActionService: VerifyActionService,
    private readonly verifyMatchService :VerifyMatchService,
    private readonly requestService: RequestService,
    private readonly dialogRef: MatDialogRef<ConfirmScoreComponent>,
    private readonly dialog: MatDialog,
    private readonly toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { match: Match, refundType: string, apiUrl: string }) {
    this.dialog.closeAll();
    this.dialogRef.disableClose = true;
    this.dialogMessage.title = Language.RefundConfirmationBox;
  }

  ngOnInit(): void {
    this.requestService.apiUrl = this.data.apiUrl;
    this.toastrService.overlayContainer = this.toastContainer;
    this.matchDetail = this.data.match.matchDetail;
    this.isRefundAll = _.isEqual(this.data.refundType, RefundType.refundAll);
    this.refundAction = this.isRefundAll ? CalculateAction.refund : CalculateAction.refundFullTime;
    this.betTicket = this.verifyActionService.createContentSpecificBetTypes(this.betDaq, this.betFair);
    this.markRemain = Language.specificBetType.MarkRemainTicket.replace("{0}", this.betTicket);
    this.disableGoalRecordCheckbox = this.matchDetail.isExistResultAndFirstTeamScore ||
      this.matchDetail.isEnabledGoalRecordFt || this.matchDetail.isEnabledGoalRecordHt;
    this.matchDetail.applyGoalRecord = this.disableGoalRecordCheckbox;
    this.betStatus = this.matchDetail.betStatus ?? "";
    this.matchNotRefundHT = _.includes(this.betStatus.toLowerCase(), BetStatus.refundHT);
    this.resetAllWarning();
  }

  public close() {
    this.dialogRef.close();
  }

  public openPopupSpecificBetTypes(type: string) {
    this.dialog.open(SpecificBettypeComponent, {
      width: '630px',
      maxHeight: '500px',
      data: {
        type,
        action: this.refundAction,
        apiUrl: this.data.apiUrl
      }
    });
  }

  public change() {
    if (this.isRefundAll) {
      this.disableInputHT = false;
      this.matchDetail.finalHomeScore = null;
      this.matchDetail.finalAwayScore = null;
    } else {
      this.disableInputFT = false;
    }
  }

  public focus() {
    if (this.isRefundAll) {
      document.getElementById('input-half-time').focus();
    } else {
      document.getElementById('input-final-time').focus();
    }
  }

  public proceedRefundFullTime() {
    this.toastrService.clear();
    const verifyMessage = this.verifyActionService.verifyFulltime(this.matchDetail);
    if (_.isEmpty(verifyMessage)) {
      this.dialogRef.close(true);
    } else {
      this.toastrService.error(verifyMessage);
    }

  }

  public proceedRefundAll() {
    this.toastrService.clear();
    const verifyMessage = this.verifyActionService.verifyAll(this.matchDetail);
    if (_.isEmpty(verifyMessage)) {
      this.dialogRef.close(true);
    } else {
      this.toastrService.error(verifyMessage);
    }
  }

  private resetAllWarning() {
    this.matchDetail.isWarningHalfTimeHomeScore = false;
    this.matchDetail.isWarningHalfTimeAwayScore = false;
    this.matchDetail.isWarningFinalHomeScore = false;
    this.matchDetail.isWarningFinalAwayScore = false;
    this.matchDetail.isWarningGoalRecord = false;
    this.toastrService.clear();
  }

  public changeScore() {
    const isExistHt = !this.verifyMatchService.isEmptyScore(this.matchDetail.halfTimeHomeScore)
        && !this.verifyMatchService.isEmptyScore(this.matchDetail.halfTimeAwayScore);

    const isExistFt = !this.verifyMatchService.isEmptyScore(this.matchDetail.finalHomeScore)
        && !this.verifyMatchService.isEmptyScore(this.matchDetail.finalAwayScore);

    const scoreInconsistent = Number(this.matchDetail.halfTimeHomeScore) > Number(this.matchDetail.finalHomeScore)
        || Number(this.matchDetail.halfTimeAwayScore) > Number(this.matchDetail.finalAwayScore);

    this.matchDetail.isScoreInconsistent = isExistHt && isExistFt ? scoreInconsistent : false;
}
}
