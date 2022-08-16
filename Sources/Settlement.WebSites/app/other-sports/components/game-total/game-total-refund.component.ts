import { Component, ViewChild } from '@angular/core';
import { AioService, ClosePopupService, MessageBoxService } from '../../../shared/services';
import { CalculateAction } from '../../../shared/constants';
import { ScorePipe } from '../../pipes';
import { Language } from '../../../shared/language';
import { MarkedTicketsModel, ModalDialogMessage, Result } from '../../../shared/models';
import { GameTotalService } from './game-total.service';
import { HedgeMatchDetail, MatchDetail, Permission, ResultDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import { MatchAio, SettleQuery } from '../../models';
import { ApiKeys, ResourcesIds } from '../../constants';
import * as _ from 'lodash';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
@Component({
  selector: 'refund',
  templateUrl: './game-total-refund.component.html',
  providers: [
    ScorePipe,
  ]
})
export class GameTotalRefundComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public match: MatchAio;
  public matchDetail: MatchDetail;
  public permission: Permission;
  public resultDetails: ResultDetail[];
  private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  public hedgeMatchDetail: HedgeMatchDetail;
  public applyHedgeMatch: boolean;
  constructor(
    private readonly messageBoxService: MessageBoxService,
    private readonly aioService: AioService,
    private readonly gameTotalService: GameTotalService,
    private readonly closePopupService: ClosePopupService,
    private readonly toastrService: ToastrService) {
    this.confirmationDialogMessage.title = Language.confirmationBox;
  }

  async getMatch(matchId: number) {
    const matchQuery = {
      matchId,
      apikey: ApiKeys.NormalMatch,
      settleType: "MNL"
    };
    this.match = await this.aioService.getMatch(matchQuery).toPromise() as MatchAio;
    this.mapValue();
  }

  public get totalSet(): ResultDetail {
    return _.find(this.match.resultDetails, item => item.resourceId === ResourcesIds.totalSets);
  }

  private mapValue() {
    this.toastrService.overlayContainer = this.toastContainer;
    this.hedgeMatchDetail = this.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.permission = this.match.permission;
    this.matchDetail = this.match.matchDetail;
    this.resultDetails = this.gameTotalService.getResultDetail(this.match.resultDetails);
    this.resultDetails.forEach(item => item.className = this.gameTotalService.getClass(item));
  }

  public async refund() {
    this.toastrService.clear();
    const paramsCheckingMarkedTickets = {
      matchId: this.match.matchDetail.matchId,
      selectedResources: this.match.resultDetails,
      isMergedParlay: true,
    };
    const response = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets).toPromise() as MarkedTicketsModel;
    if (response.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
      this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
        this.sendRequest(this.match.matchDetail.matchId,
          this.match.resultDetails, false, false);
      });
    }
  }

  private async sendRequest(matchId: number, resultDetailList: ResultDetail[],
    isReSettledTickets: boolean, isScoreDirect: boolean) {
    resultDetailList.forEach((item) => {
      item.homeValue = "";
      item.awayValue = "";
    });
    const settleQuery = new SettleQuery(matchId, resultDetailList, CalculateAction.refund,
      isReSettledTickets, isScoreDirect, this.matchDetail.betStatus);

    const result = await this.aioService.push(settleQuery).toPromise() as Result;
    if (result.errCode === 0) {
      this.hedgeMatch(settleQuery);
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private hedgeMatch(query: SettleQuery) {
    const matchId = query.matchId;
    const hedgeMatchId = this.applyHedgeMatch ? this.hedgeMatchDetail.matchId : 0;
    if (hedgeMatchId > 0) {
      query.matchId = hedgeMatchId;
      this.aioService.push(query).toPromise().then(() => {
        this.closePopupService.closePopup(matchId);
      });
    } else {
      this.closePopupService.closePopup(matchId);
    }
  }

  public confirmRefund(hedgeMatchDetail: HedgeMatchDetail, applyHedgeMatch: boolean) {
    if(!applyHedgeMatch){
      hedgeMatchDetail = new HedgeMatchDetail();
    }
    if (!this.totalSet.resultSettingData.isConfirmedRefund) {
      this.aioService.confirmResult([this.totalSet], this.match.matchDetail.matchId, ResourcesIds.totalSets, hedgeMatchDetail);
    } else {
      this.aioService.undoConfirmedResult([this.totalSet], this.match.matchDetail.matchId, ResourcesIds.totalSets, hedgeMatchDetail);
    }
  }
}