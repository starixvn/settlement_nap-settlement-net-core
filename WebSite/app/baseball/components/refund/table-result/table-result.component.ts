import { FormsModule } from '@angular/forms';
import * as _ from "lodash";
import { Component, inject, OnInit } from '@angular/core';
import { ResultDetailBaseBall } from '../../../models';
import { CommonModule } from '@angular/common';
import { HedgeMatchDetail, Permission } from '../../../../shared/models/sportsbook-sop';
import { NotifyService } from '../../../services/notify.service';
import { ResourceIds, SettlementStatusId, BackgroundColor } from '../../../../shared/constants';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IntervalBackgroundPipe } from '../../../../shared/pipes/interval-background.pipe';
import { RefundStorage } from '../../../services/refund/refund.storage';
import { RefundService } from "../../../services/refund/refund.service";
import { ConfirmRefundService } from '../../../services/refund/confirm-refund.service';

@Component({
  selector: 'table-result',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTooltipModule],
  templateUrl: './table-result.component.html',
})
export class TableResultComponent implements OnInit {
  #storage = inject(RefundStorage);
  #confirmRefundService = inject(ConfirmRefundService);
  #refundService = inject(RefundService);
  #notifyService = inject(NotifyService);
  #backgroundPipe = inject(IntervalBackgroundPipe);
  match = this.#storage.getMatch()
  externalResults = this.#storage.getExternalResults();
  selectedResources = this.#storage.getResultChecked();
  isMatchSeries = this.#storage.isMatchSeries();
  resultDetails = this.match.resultDetails;
  matchDetail = this.match.matchDetail;
  isConfirmRefund: boolean;
  isMercy: boolean;
  isSdtSettle = this.#storage.isSdtSettle();
  hedgeMatchDetail: HedgeMatchDetail;
  applyHedgeMatch: boolean;
  permission: Permission;
  homeName: string;
  awayName: string;
  resourceIds = ResourceIds;

  public get disableButton () {
    return this.#storage.getResultChecked().length == 0;
  }

  ngOnInit(): void {
    this.hedgeMatchDetail = this.#storage.getMatch().hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail !== null;
    this.permission = this.match.permission;
    this.homeName = this.matchDetail.homeName;
    this.awayName = this.matchDetail.awayName;
    this.isConfirmRefund = this.resultDetails.some(result => result.resultSettingData.isConfirmedRefund || result.resultSettingData.isConfirmedRefundSdt || result.resultSettingData.isConfirmedRefundMercy);
    this.resetHomeAwayAndAddClass(this.resultDetails);
  }

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }

  disableTotalHitsAndMatch(resourceId: string) {
    if(this.#storage.isSdtSettle()) {
      return _.isEqual(resourceId, ResourceIds.totalHits) ;
    } 
    else if(this.#storage.isMercy()) {
      return _.includes([ResourceIds.totalHits, ResourceIds.fullTime], resourceId);
    }
  }

  enableInput(extraInning: ResultDetailBaseBall, resultDetail: ResultDetailBaseBall) {
    if (this.#storage.isSdtSettle()) {
      this.generateSpecialControlSettleDetermine(extraInning, resultDetail);
    } else {
      resultDetail.disabled = true;  
    }
  }

  generateSpecialControlSettleDetermine(extraInning: ResultDetailBaseBall, resultDetail: ResultDetailBaseBall) {
    if (extraInning != null) {
      resultDetail.disabled = true;
      extraInning.disabled = !this.#storage.isSelectedMatch();
    } else {
      resultDetail.disabled = !resultDetail.checked;  
    }
  }

  changeScore(resultDetail: ResultDetailBaseBall) {
    const firstResourceIndex = this.resultDetails.indexOf(resultDetail);
    const resultDetailAfter = this.resultDetails.slice(firstResourceIndex !== -1 ? firstResourceIndex + 1 : 0);
    resultDetailAfter.forEach(resource => {
        if (resource.resourceId !== resultDetail.resourceId) {
            resource.awayValue = "";
            resource.homeValue = "";
        }
        resource.className = this.inputClass(resource);
    });

    resultDetail.className = this.inputClass(resultDetail);
  }

  private inputClass(resultDetail: ResultDetailBaseBall) {
    const externalResource = this.externalResults.find(r => r.resourceId === resultDetail.resourceId);
    const isConsistentScore = resultDetail.resultSettingData.isConfirmedRefundSdt 
                        && externalResource 
                        && (!_.isEqual(resultDetail.awayValue, externalResource.awayValue) || !_.isEqual(resultDetail.homeValue, externalResource.homeValue));
    return isConsistentScore
          ? BackgroundColor.scoreSdtNotConsistent : this.#backgroundPipe.transform(resultDetail.settlementStatusId);
  }

  private resetHomeAwayAndAddClass(resultDetails: ResultDetailBaseBall[]) {
    resultDetails.forEach((item) => {
      this.resourceConfirmed(item); 
      item.disabled = !item.checked;
      if (!this.permission.isLeader || !item.resultSettingData.isConfirmedRefundSdt) {
          const needReset = _.includes([SettlementStatusId.Refund, SettlementStatusId.Running], item.settlementStatusId) 
          || (_.isEqual(item.resourceId, ResourceIds.fullTime) &&  item.settlementStatusId === SettlementStatusId.RefundSettleDetermined);
          item.homeValue = needReset ? "" : item.homeValue;
          item.awayValue = needReset ? "" : item.awayValue;
      }

      item.className = this.#backgroundPipe.transform(item.settlementStatusId);
    });
  }

  private resourceConfirmed(resultDetail: ResultDetailBaseBall) {
    const flag = this.permission.isLeader && resultDetail.resultSettingData.isConfirmedRefundSdt;
    if(flag) {
      const resource = this.externalResults.find(resultConfirmed => resultConfirmed.resourceId === resultDetail.resourceId);
      resultDetail.homeValue = resource.homeValue;
      resultDetail.awayValue = resource.awayValue;
    }
  }

  // async refund() {
  //   const paramsCheckingMarkedTickets = this.generateCheckMarkedTicketsQuery();
  //   const res = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets);
  //   this.toastrService.clear();
  //   if (this.existResultNotConfirmed()) {
  //     this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
  //   } else if (res.isExistMarkedTicket) {
  //     this.toastrService.error(Language.MarkedTicket);
  //   } else {
  //     this.#notifyService.confirm(Language.RefundConfirmMessage, () => {
  //       this.doRefund();
  //     });
  //   }
  // }

  private async doRefund() {
    // const query = this.generateRefundQuery(BaseballApiKeys.Settle);
    // const result = await this.aioService.push(query);
    // if (result.errCode === 0) {
    //   result.childMatchIds && await this.refundChildMatch(result.childMatchIds, result.settledSessionId);
    //   this.refundHedgeMatch(query);
    //   this.messageBoxService.closePopup();
    // } else {
    //   this.toastrService.error(result.errMsg);
    // }
  }

  private async refundChildMatch(childMatchIds: string, parentSessionId: string) {
    // const settleChildMatchQuery = new SettleChildMatchQuery(
    //   childMatchIds, 
    //   this.selectedResources,
    //   CalculateAction.refund, 
    //   false);

    // settleChildMatchQuery.sportType = this.matchDetail.sportType;
    // settleChildMatchQuery.parentSessionId = parentSessionId;

    // await this.aioService.pushChildMatch(settleChildMatchQuery);
  }

  async refund() {
    this.#notifyService.clearError();
    this.#refundService.refund();
  }

  confirmRefund() {
    this.#notifyService.clearError();
    this.#confirmRefundService.confirmRefund();
  }

  undoConfirmedAllResult() {
    this.#notifyService.clearError();
    this.#confirmRefundService.undoConfirmRefund();
  }
}
