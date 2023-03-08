import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { FullTimeService } from './fulltime.service';
import { Language } from '../../../shared/language.native';
import { ModalDialogMessage } from '../../../shared/models';
import { MessageBoxService } from '../../../shared/services';
import { Match, MatchDetail, QueryMatch, Permission } from '../../models';
import { RequestService } from '../../services/request.service';
import { SportTemplate } from '../../../shared/models/sportsbook-sop';
import { ResourcesIds } from '../../constants';
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
    const otherSportsMatch = await this.requestService.getMatch(query);
    this.match = otherSportsMatch.match;
    this.matchDetail = this.match.matchDetail;
    this.permission = otherSportsMatch.permission;
    this.fullTimeService.initScoreByPermission(this.matchDetail, this.permission);
  }

  public async refund() {
    this.toastrService.clear();
    const isExistedMarkedTicket = await this.isExistedMarkedTicket();
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

  private async isExistedMarkedTicket() {
    const params = {
      matchId: this.matchDetail.matchId,
      ResourceIds: ResourcesIds.fullTime,
    };
    const result = await this.requestService.checkMarkedTickets(params);
    return result.isExistMarkedTicket;
  }
}
