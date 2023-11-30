import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Match, MatchDetail } from './model/match.model';
import * as _ from 'lodash';
import { RefundType } from './model/constant.native';
import { SubRefundAllButtonStatus, SubRefundFTButtonStatus } from './model/button-status';
import { VerifyMatchService } from './services/verify-match.service';
import { ResultDetail } from '../../models';
import { ResourceIds } from '../../constants';
import { RequestService } from './services/request.service';
import { BlockUIService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { CalculateAction } from '../../../shared/constants';
import { ModalDialogMessage, Result } from '../../../shared/models';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { Language } from '../../../shared/language.native';

@Component({
  selector: 'confirm-refund',
  templateUrl: './confirm-refund.component.html',
  providers: [
    VerifyMatchService,
    RequestService,
    HttpRequestService,
    BlockUIService,
    MessageBoxService
  ]
})
export class ConfirmRefundComponent implements OnInit {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public matchDetail: MatchDetail;
  public isRefundAll: boolean;
  public subButtonRefundAll: SubRefundAllButtonStatus;
  public subButtonRefundFT: SubRefundFTButtonStatus;
  public refundAction = CalculateAction;
  public dialogMessage = new ModalDialogMessage();
  constructor(
    private readonly verifyMatchService: VerifyMatchService,
    private readonly requestService: RequestService,
    private readonly toastrService: ToastrService,
    private readonly dialogRef: MatDialogRef<ConfirmRefundComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { match: Match, refundType: string }) {
    this.dialogRef.disableClose = true;
    this.dialogMessage.title = Language.RefundConfirmationBox;
  }

  ngOnInit(): void {
    this.toastrService.overlayContainer = this.toastContainer;
    this.matchDetail = this.data.match.matchDetail;
    this.isRefundAll = _.isEqual(this.data.refundType, RefundType.refundAll);
    const halfTimeStatusId = (_.find(this.data.match.resultDetails, item => _.isEqual(item.resourceId, ResourceIds.halfTime)) ??
      new ResultDetail()).settlementStatusId;
    const fullTimeStatusId = (_.find(this.data.match.resultDetails, item => _.isEqual(item.resourceId, ResourceIds.fullTime)) ??
      new ResultDetail()).settlementStatusId;

    if (this.isRefundAll) {
      this.subButtonRefundAll = this.verifyMatchService.setDisableSubRefundAll(halfTimeStatusId, fullTimeStatusId);
    } else {
      this.subButtonRefundFT = this.verifyMatchService.setDisableSubRefundFT(halfTimeStatusId, fullTimeStatusId);
    }
  }

  public close() {
    this.dialogRef.close();
  }

  public async refundSus(actionName: string) {
    this.toastrService.clear();
    this.matchDetail.isSettleAbandonedMatchIBC = true;
    const checkingStatus = await this.requestService.checkNewStatus(this.matchDetail.matchId, actionName, true);
    if (checkingStatus.isSuccessful) {
      this.dialogRef.close(true);
    } else {
      this.toastrService.error(checkingStatus.errMsg);
    }
  }

  public async refundNotSdtAndPos(actionName: string) {
    this.toastrService.clear();
    this.matchDetail.isSettleAbandonedMatchIBC = false;
    const checkingStatus = await this.requestService.checkNewStatus(this.matchDetail.matchId, actionName, false);
    if (checkingStatus.isSuccessful) {
      this.confirmRefund();
    } else {
      this.toastrService.error(checkingStatus.errMsg);
    }
  }

  private confirmRefund() {
    if (this.data.match.betDaq.settleDeterminedBetDaq || this.data.match.betFair.settleDeterminedBetFair) {
      this.dialogRef.close(true);
    } else {
      this.dialogRef.close(false);
    }
  }
}
