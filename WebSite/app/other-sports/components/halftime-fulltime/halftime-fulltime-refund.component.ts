import { Component, ViewChild } from '@angular/core';
import { RequestService } from '../../services/request.service';
import { MatchDetail, OtherSportsMatch, Permission, QueryMatch, RequestSettleWithInterval } from '../../models';
import * as _ from 'lodash';
import { VerificationService } from './verification.service';
import { MessageBoxService } from '../../../shared/services';
import { Language } from '../../../shared/language';
import { MarkedTicketsModel, ModalDialogMessage, Result } from '../../../shared/models';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { HalfTimeFullTimeService } from './halftime-fulltime.service';
import { CalculateAction } from '../../../shared/constants';
import { HedgeMatchDetail, ResultDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import { ResourcesIds } from '../../constants/resource-ids.native';
@Component({
  selector: 'halftime-fulltime-refund',
  templateUrl: './halftime-fulltime-refund.component.html',
})
export class HalfTimeFullTimeRefundComponent implements SportTemplate {
  @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
  public actionName = CalculateAction;
  public matchDetail: MatchDetail;
  public permission: Permission;
  public resultDetails: ResultDetail[];
  public hedgeMatchDetail: HedgeMatchDetail;
  public applyHedgeMatch: boolean;
  public confirmDialogMessage: ModalDialogMessage = new ModalDialogMessage();
  private halfTimeNode: number;
  public hasHalfTime = false;
  constructor(private readonly requestService: RequestService,
    private readonly messageBoxService: MessageBoxService,
    private readonly halfTimeFullTimeService: HalfTimeFullTimeService,
    private readonly toastrService: ToastrService) {
    this.confirmDialogMessage.title = Language.RefundConfirmationBox;
  }
  async getMatch(matchId: number) {
    this.toastrService.overlayContainer = this.toastContainer;
    const query = new QueryMatch(matchId, true);
    const result = await this.requestService.getMatch(query).toPromise() as OtherSportsMatch;
    this.permission = result.permission;
    this.matchDetail = result.match.matchDetail;
    this.resultDetails = result.match.resultDetails;
    this.hedgeMatchDetail = result.match.hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail != null;
    this.hasHalfTime = _.isObject(this.halfTime);
    this.halfTimeNode = this.halfTimeFullTimeService.numberSetOnHalfTime(this.matchDetail.sportType);
    this.halfTimeFullTimeService.processScore(this.matchDetail, this.halfTime, this.fullTime, this.results,
      this.halfTimeNode, this.permission.isLeader, false);
  }

  public get halfTime() {
    return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.halfTime));
  }

  public get fullTime() {
    return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.fullTime));
  }

  public get results() {
    return _.filter(this.resultDetails, (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.halfTime)
      && !_.isEqual(map.resourceId, ResourcesIds.fullTime));
  }
  public async refund(action: string, isParlay: boolean) {
    this.toastrService.clear();
    const params = {
      matchId: this.matchDetail.matchId,
      action: isParlay ? "MP-" + action : action,
    };

    const result = await this.requestService.checkMarkedTickets(params).toPromise() as MarkedTicketsModel;
    if (result.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.confirmDialogMessage.message = this.halfTimeFullTimeService.getMessageConfirmRefund(isParlay, action);
      this.messageBoxService.confirm(this.confirmDialogMessage, async () => {
        this.doRefund(action, isParlay);
      });
    }
  }

  private async doRefund(action: string, isParlay: boolean) {
    const param = {
      matchId: this.matchDetail.matchId,
      action,
      hedgeMatchId: this.applyHedgeMatch ? this.hedgeMatchDetail.matchId : 0,
      betStatus: _.isEqual(action, this.actionName.refundFullTime) ? this.matchDetail.betStatus : null
    };

    const response = isParlay
      ? await this.requestService.refundParlay(param).toPromise() as Result
      : await this.requestService.refund(param).toPromise() as Result;
    if (!response.isSuccessful) {
      this.toastrService.error(response.errMsg);
    } else {
      this.messageBoxService.closePopup();
    }
  }
}