import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { FullTimeService } from './fulltime.service';
import { CalculateAction } from '../../../shared/constants';
import { Language } from '../../../shared/language';
import { MarkedTicketsModel, ModalDialogMessage } from '../../../shared/models';
import { MessageBoxService } from '../../../shared/services';
import { Match, MatchDetail, OtherSportsMatch, QueryMatch, Permission } from '../../models';
import { RequestService } from '../../services/request.service';
import { SportTemplate } from '../../../shared/models/sportsbook-sop';
@Component({
  selector: 'refund-actions',
  templateUrl: './fulltime-refund.component.html'
})
export class FullTimeRefundComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public lodash = _;
  public match: Match;
  public matchDetail: MatchDetail;
  public readonly isReSettledTickets: boolean;
  public confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public permission: Permission;
  constructor(private readonly messageBoxService: MessageBoxService,
    private readonly requestService: RequestService,
    private readonly fullTimeService: FullTimeService,
    private readonly toastrService: ToastrService) {
      this.confirmationDialogMessage.title = Language.RefundWarning;
    }

  async getMatch(matchId: number) {
    this.toastrService.overlayContainer = this.toastContainer;
    const query = new QueryMatch(matchId, true);
    const otherSportsMatch = await this.requestService.getMatch(query).toPromise() as OtherSportsMatch;
    this.match = otherSportsMatch.match;
    this.matchDetail = this.match.matchDetail;
    this.permission = otherSportsMatch.permission;
    this.fullTimeService.initScoreByPermission(this.matchDetail, this.permission);
  }

  public async refund() {
    this.toastrService.clear();
    const isExistedMarkedTicket = await this.isExistedMarkedTicket(CalculateAction.refund);
    if (isExistedMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
        this.confirmationDialogMessage.title = Language.RefundConfirmationBox;
        this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
        this.messageBoxService.confirm(this.confirmationDialogMessage, async() => {
          const errorMessage = await this.fullTimeService.refund(this.match.matchDetail);
          if(!_.isEmpty(errorMessage)) {
            this.toastrService.error(errorMessage);
          }
        });
    }
  }

  public async refundParlay() {
    this.toastrService.clear();
    const isExistedMarkedTicket = await this.isExistedMarkedTicket(CalculateAction.refundMarkedParlayAll);
    if (isExistedMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.confirmationDialogMessage.title = Language.RefundConfirmationBox;
      this.confirmationDialogMessage.message = Language.RefundParlayConfirmMessage;
      this.messageBoxService.confirm(this.confirmationDialogMessage, async() => {
        const errorMessage = await this.fullTimeService.refundParlay(this.match.matchDetail.matchId);
        if(!_.isEmpty(errorMessage)) {
          this.toastrService.error(errorMessage);
        }
      });
    }
  }

  private async isExistedMarkedTicket(action: string) {
    const params = {
      matchId: this.matchDetail.matchId,
      action,
    };
    const result = await this.requestService.checkMarkedTickets(params).toPromise() as MarkedTicketsModel;
    return result.isExistMarkedTicket;
  }
}
