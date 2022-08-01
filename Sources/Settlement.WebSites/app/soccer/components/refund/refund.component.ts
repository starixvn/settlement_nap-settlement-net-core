import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { Language } from '../../../shared/language';
import { CalculateAction } from '../../../shared/constants';
import { ModalDialogMessage, Result } from '../../../shared/models';
import { Soccer } from '../soccer.model';
import { MainRefundButtonStatus } from './model/button-status';
import { BetDaq, BetFair, HedgeMatchDetail, Match, MatchDetail } from './model/match.model';
import { RequestService } from './services/request.service';
import { VerifyMatchService } from './services/verify-match.service';
import { SpecificBettypeComponent } from './specific-bettype.component';
import { ClosePopupService, MessageBoxService } from '../../../shared/services';
import { VerifyActionService } from './services/verify-action.service';
import { RefundQuery } from './model/query.model';
import { ConfirmRefundComponent } from './confirm-refund.component';
import { RefundType } from './model/constant.native';
import * as _ from 'lodash';
import { ConfirmScoreComponent } from './confirm-score.component';
import { MoveBetComponent } from './move-bet.component';

@Component({
  selector: 'refund',
  templateUrl: './refund.component.html',
  providers: [
    RequestService,
    VerifyMatchService,
    VerifyActionService
  ]
})
export class RefundComponent implements Soccer {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public match: Match;
  public hedgeMatchDetail: HedgeMatchDetail;
  public isMatchReady: boolean;
  public isReSettledTickets: boolean;
  public matchDetail: MatchDetail;
  public betDaq: BetDaq;
  public betFair: BetFair;
  public dialogMessage = new ModalDialogMessage();
  public buttonRefundStatus: MainRefundButtonStatus;
  public isDeterminedHedgeMatch = false;
  public disableSettleDeterminedHedgeMatch = false;

  constructor(private readonly requestService: RequestService,
    private readonly verifyMatchService: VerifyMatchService,
    private readonly toastrService: ToastrService,
    private readonly messageBoxService: MessageBoxService,
    private readonly verifyActionService: VerifyActionService,
    private readonly closePopupService: ClosePopupService,
    private readonly dialog: MatDialog) {
    this.dialogMessage.title = Language.RefundConfirmationBox;
  }

  async getMatch(matchId: number, apiUrl: string) {
    this.requestService.apiUrl = apiUrl;
    this.toastrService.overlayContainer = this.toastContainer;
    this.match = await this.requestService.getMatch(matchId).toPromise() as Match;
    this.matchDetail = this.match.matchDetail;
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.matchDetail.applyHedgeMatch = this.hedgeMatchDetail != null && !this.hedgeMatchDetail.isUndecided;
    this.betDaq = this.match.betDaq;
    this.betFair = this.match.betFair;
    this.buttonRefundStatus = this.verifyMatchService.setDisableRefund(this.matchDetail, this.match.resultDetails);
    this.matchDetail.originalGoalRecord = this.matchDetail.goalRecord;
  }

  public changeApplyHedgeMatch() {
    if (this.matchDetail.applyHedgeMatch) {
      this.disableSettleDeterminedHedgeMatch = false;
    } else {
      this.disableSettleDeterminedHedgeMatch = true;
      this.isDeterminedHedgeMatch = false;
    }
  }

  public openPopupSpecificBetTypes(type: string, action: string) {
    this.dialog.open(SpecificBettypeComponent, {
      width: '630px',
      height: '500px',
      data: {
        type,
        action,
        apiUrl: this.requestService.apiUrl
      }
    });
  }

  public openPopupMoveBet(isBetDaq: boolean) {
    this.dialog.open(MoveBetComponent, {
      width: '350px',
      height: '350px',
      data: {
        matchId: this.matchDetail.matchId,
        refundType: isBetDaq ? RefundType.refundBetDaq : RefundType.refundBetFair,
        apiUrl: this.requestService.apiUrl
      }
    }).afterClosed().subscribe((value) => {
      this.toastrService.overlayContainer = this.toastContainer;
      if (value) {
        if (value.result.isSuccessful) {
          this.closePopupService.closePopup(this.matchDetail.matchId);
        } else {
          this.toastrService.clear();
          this.toastrService.error(value.result.errMsg);
        }
      }
    });
  }

  public async refundHalftime() {
    this.toastrService.clear();
    const response = await this.requestService.checkingMarkedTicket(CalculateAction.refundHalfTime, this.matchDetail.matchId).toPromise();
    if (response.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.checkStatusHalfTime();
    }
  }

  private async checkStatusHalfTime() {
    const response = await this.requestService.checkNewStatus(this.matchDetail.matchId,
      CalculateAction.refundHalfTime, false).toPromise() as Result;
    if (response.isSuccessful) {
      this.matchDetail.isSettleAbandonedMatchIBC = false;
      this.dialogMessage.message = Language.soccer.refundHalfTime;
      this.messageBoxService.confirm(this.dialogMessage, async () => {
        this.doRefund(CalculateAction.refundHalfTime);
      });
    } else {
      this.toastrService.error(response.errMsg);
    }
  }

  public async refundFullTime() {
    const markedTicket = await this.requestService.checkingMarkedTicket(CalculateAction.refundFullTime,
      this.matchDetail.matchId).toPromise();
    if (markedTicket.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.openConfirmRefundPopup(RefundType.refundFT);
    }
  }

  public async refundAll() {
    const markedTicket = await this.requestService.checkingMarkedTicket(CalculateAction.refund, this.matchDetail.matchId).toPromise();
    if (markedTicket.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.openConfirmRefundPopup(RefundType.refundAll);
    }
  }

  private openConfirmRefundPopup(refundType: string) {
    this.dialog.open(ConfirmRefundComponent, {
      width: '620px',
      maxHeight: '230px',
      data: {
        match: this.match,
        refundType,
        apiUrl: this.requestService.apiUrl
      },
      hasBackdrop: true
    }).afterClosed().subscribe((result) => {
      this.toastrService.overlayContainer = this.toastContainer;
      if (result) {
        this.openConfirmScorePopup(refundType);
      } else if (!_.isUndefined(result)) {
        this.confirmRefund(refundType);
      }
    });
  }

  private openConfirmScorePopup(refundType: string) {
    this.dialog.open(ConfirmScoreComponent, {
      width: '620px',
      maxHeight: '360px',
      data: {
        match: this.match,
        refundType,
        apiUrl: this.requestService.apiUrl,
      },
      hasBackdrop: true
    }).afterClosed().subscribe((result) => {
      this.toastrService.overlayContainer = this.toastContainer;
      if (result) {
        this.confirmRefund(refundType);
      }
    });
  }

  private async confirmRefund(refundType: string) {
    this.toastrService.clear();
    const actionName = _.isEqual(refundType, RefundType.refundAll) ? CalculateAction.refund : CalculateAction.refundFullTime;
    const markedTicket = await this.requestService.checkingMarkedTicket(actionName, this.matchDetail.matchId).toPromise();
    if (markedTicket.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.dialogMessage.message = this.verifyActionService.getMessageConfirm(actionName, this.match);
      this.messageBoxService.confirm(this.dialogMessage, () => {
        this.doRefund(actionName);
      });
    }
  }

  private async doRefund(actionName: string) {
    const hedgeMatch = this.matchDetail.applyHedgeMatch ? this.match.hedgeMatchDetail : null;
    const query = new RefundQuery(this.matchDetail, hedgeMatch,
      actionName, this.betDaq, this.betFair, this.isDeterminedHedgeMatch);
    const result = await this.requestService.refundMatch(query).toPromise() as Result;
    if (result.isSuccessful) {
      this.closePopupService.closePopup(this.matchDetail.matchId);
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  public async refundRunningThirdPartyTickets(isBetDaq: boolean) {
    this.toastrService.clear();
    const refundType = isBetDaq ? RefundType.refundBetDaq : RefundType.refundBetFair;
    const result = await this.requestService.refundRunningThirdPartyTickets(this.matchDetail.matchId, refundType).toPromise() as Result;
    if (result.isSuccessful) {
      this.closePopupService.closePopup(this.matchDetail.matchId);
    } else {
      this.toastrService.error(result.errMsg);
    }
  }
}
