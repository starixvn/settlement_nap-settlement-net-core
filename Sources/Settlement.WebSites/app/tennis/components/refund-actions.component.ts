import { Component, Input, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { MessageBoxService, ClosePopupService, AioService } from '../../shared/services';
import { MarkedTicketsModel, Result, ModalDialogMessage } from '../../shared/models';
import { CalculateAction, EventStatus } from '../../shared/constants';
import { Language } from '../../shared/language';
import { Match } from '../models';
import { ResourcesIds, TennisApiKeys } from '../constants';
import { ResultDetail, SettleQuery, SportTemplate } from '../../shared/models/sportsbook-sop';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'refund-actions',
  templateUrl: './refund-actions.component.html',
})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  @Input() public match: Match;
  public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  constructor(
    private readonly messageBoxService: MessageBoxService,
    protected aioService: AioService,
    protected closePopupService: ClosePopupService,
    protected toastrService: ToastrService) {
    super(closePopupService, aioService, toastrService);
    this.confirmationDialogMessage.title = Language.confirmationBox;
  }

  async getMatch(matchId: number): Promise<void> {
    const matchQuery = {
      matchId,
      apikey: TennisApiKeys.NormalMatch,
    };
    this.toastrService.overlayContainer = this.toastContainer;
    this.match = await this.aioService.getMatch(matchQuery).toPromise() as Match;
    this.init();
  }

  public init() {
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.matchDetail = this.match.matchDetail;
    this.permission = this.match.permission;
    this.resultDetails = this.match.resultDetails;
    this.cloneResultDetail();
  }

  public get isDisabledConfirmRefund(): boolean {
    const existResultSelected = _.find(this.match.resultDetails, item => item.checked);
    return _.isNil(existResultSelected);
  }

  public async refund() {
    const paramsCheckingMarkedTickets = this.generateCheckMarkedTicketsQuery();
    const response = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets).toPromise() as MarkedTicketsModel;
    this.toastrService.clear();
    if(this.existResultNotConfirmed()) {
      this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
    } else if (response.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      if (this.verifySelectedOnMap()) {
        this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
          this.doRefund();
        });
      }
    }
  }

  public verifySelectedOnMap() {
    const findMap = _.find(this.match.resultDetails, (map: ResultDetail) => map.checked);

    if (!findMap) {
      this.toastrService.error(Language.NotSelectRefundTypeMessage);
    }

    return findMap;
  }

  public async doRefund() {
    const query = this.generateRefundQuery(TennisApiKeys.Settle);
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

    return new SettleQuery(this.matchDetail.matchId,
        this.selectedResources,
        CalculateAction.refund,
        false,
        this.getBetStatus(),
        apikey);
  }

  public getBetStatus() {
    const betStatus: string[] = [];
    const refund = this.match.resultDetails.find((map) => map.resourceId === ResourcesIds.totalSets).checked
      || this.match.matchDetail.betStatus
      && _.includes(this.match.matchDetail.betStatus, EventStatus.refund)
      ? `${EventStatus.refund};` : '';
    const submitedSets = this.match.resultDetails.filter((map) =>
      map.resourceId !== ResourcesIds.totalGames && map.resourceId !== ResourcesIds.totalSets);
    submitedSets.forEach((map) => {
      betStatus.push(map.checked
        ? `${Number(map.homeValue)}-${Number(map.awayValue)}`
        : `${Number(map.originalHomeValue)}-${Number(map.originalAwayValue)}`);
    });

    return refund + betStatus.join(',');
  }
}
