import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { MessageBoxService, ClosePopupService, AioService } from '../../shared/services';
import { CalculateAction, EventStatus, SportType } from '../../shared/constants';
import { Result, MarkedTicketsModel, ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language';
import { Match } from '../models';
import { BadmintonApiKeys, ResourcesIds, VolleyballApiKeys } from '../constants';
import { SettleQuery, SportTemplate } from '../../shared/models/sportsbook-sop';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { UrlHelper } from '../../helper';

@Component({
  selector: 'refund-actions',
  templateUrl: './refund-actions.component.html',
})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public match: Match;
  public readonly isReSettledTickets: boolean;
  public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  private apiKeys = null;
  constructor(
    private readonly messageBoxService: MessageBoxService,
    protected toastrService: ToastrService,
    protected closePopupService: ClosePopupService,
    protected aioService: AioService) {
    super(closePopupService, aioService, toastrService);
    this.confirmationDialogMessage.title = Language.confirmationBox;
  }

  async getMatch(matchId: number): Promise<void> {
    const sportType = Number(UrlHelper.getUrlParameter('sportType'));
    this.apiKeys = sportType === SportType.volleyBall ? VolleyballApiKeys : BadmintonApiKeys;
    const matchQuery = {
      matchId,
      sportType,
      apikey: this.apiKeys.NormalMatch,
      settleType: "MNL"
    };
    this.toastrService.overlayContainer = this.toastContainer;

    this.match = await this.aioService.getMatch(matchQuery).toPromise() as Match;
    this.init();
  }

  public init() {
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail !== null;
    this.resultDetails = this.match.resultDetails;
    this.matchDetail = this.match.matchDetail;
    this.permission = this.match.permission;
    this.cloneResultDetail();
  }

  public async refund() {
    const paramsCheckingMarkedTickets = this.generateCheckMarkedTicketsQuery();
    const res = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets).toPromise() as MarkedTicketsModel;
    this.toastrService.clear();
    if (this.existResultNotConfirmed()) {
      this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
    } else if (res.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.doRefund();
      });
    }
  }

  public async doRefund() {
    const query = this.generateRefundQuery(this.apiKeys.Settle);
    const result = await this.aioService.push(query).toPromise() as Result;
    if (result.errCode === 0) {
      this.refundHedgeMatch(query);
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  protected generateRefundQuery(apikey: string) {
      this.selectedResources.forEach((item) => {
          item.homeValue = "";
          item.awayValue = "";
      });
      const betStatus = this.matchDetail.sportType === SportType.volleyBall ? this.getBetStatus() : "";

      return new SettleQuery(this.matchDetail.matchId,
          this.selectedResources,
          CalculateAction.refund,
          false,
          betStatus,
          apikey);
  }

  public getBetStatus() {
    const betStatus: string[] = [];
    const refund = this.match.resultDetails.find((map) => map.resourceId === ResourcesIds.totalGames).checked
      || this.match.matchDetail.betStatus
      && _.includes(this.match.matchDetail.betStatus, EventStatus.refund)
      ? `${EventStatus.refund};` : '';
    const submitedSets = this.match.resultDetails.filter((map) =>
      map.resourceId !== ResourcesIds.totalPoints && map.resourceId !== ResourcesIds.totalGames);
    submitedSets.forEach((map) => {
      betStatus.push(map.checked
        ? `${Number(map.homeValue)}-${Number(map.awayValue)}`
        : `${Number(map.originalHomeValue)}-${Number(map.originalAwayValue)}`);
    });

    return refund + betStatus.join(',');
  }
}
