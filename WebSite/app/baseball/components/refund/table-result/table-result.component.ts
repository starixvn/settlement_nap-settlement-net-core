import { FormsModule } from '@angular/forms';
import { Component, inject, input, OnInit } from '@angular/core';
import { RefundActionBaseComponent } from '../../../../shared/components/sportsbook-sop/refund-action-base.component';
import { Match } from '../../../models/match.model';
import { CommonModule } from '@angular/common';
import { ResourceNamePipe } from '../../../pipes/resource-name.pipe';
import { HedgeMatchDetail, MatchDetail, Permission, ResultDetail } from '../../../../shared/models/sportsbook-sop';
import { Language } from '../../../../shared/language.native';
import { NotifyService } from '../../../services/notify.service';
import { BaseballApiKeys } from '../../../constants/api-keys.constant';
import { SettleChildMatchQuery, ResourceItem } from '../../../../shared/models';
import { CalculateAction, ResourceIds, SettlementStatusId } from '../../../../shared/constants';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IntervalBackgroundPipe } from '../../../../shared/pipes/interval-background.pipe';
import { RefundStorage } from '../../../services/refund/refund.storage';
@Component({
  selector: 'table-result',
  standalone: true,
  imports: [CommonModule, FormsModule, ResourceNamePipe, MatTooltipModule, IntervalBackgroundPipe],
  templateUrl: './table-result.component.html',
})
export class TableResultComponent extends RefundActionBaseComponent implements OnInit {
  match = input.required<Match>();
  #storage = inject(RefundStorage);
  #notifyService = inject(NotifyService);
  #resultPipe = inject(ResourceNamePipe);
  #backgroundPipe = inject(IntervalBackgroundPipe);
  hedgeMatchDetail: HedgeMatchDetail;
  applyHedgeMatch: boolean;
  resultDetails: ResultDetail[];
  matchDetail: MatchDetail;
  permission: Permission;
  extraInningId = ResourceIds.extraInning;
  homeName: string;
  awayName: string;
  resourceIds = ResourceIds;
  public get confirmRefundResources() {
    return this.selectedResources.map((x) => ({...x,resourceName: this.#resultPipe.transform(x.resourceId)}))
  } 

  ngOnInit(): void {
    this.hedgeMatchDetail = this.match().hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail !== null;
    this.resultDetails = this.match().resultDetails;
    this.matchDetail = this.match().matchDetail;
    this.permission = this.match().permission;
    this.homeName = this.matchDetail.homeName;
    this.awayName = this.matchDetail.awayName;
    this.isConfirmRefund = this.resultDetails.findIndex(result => result.resultSettingData.isConfirmedRefund || result.resultSettingData.isConfirmedRefundSdt) === -1;
    this.resetHomeAwayAndAddClass(this.resultDetails);
  }

  getTextTooltip(text: string, maxLength: number) {
    return text?.length > maxLength ? text : null;
  }
  private resetHomeAwayAndAddClass(resultDetails: ResultDetail[]) {
    resultDetails.forEach((item) => {
        if (!this.permission.isLeader || !item.resultSettingData.isConfirmedRefundSdt) {
            const needReset = item.settlementStatusId === SettlementStatusId.Refund || item.settlementStatusId === SettlementStatusId.Running;
            item.homeValue = needReset ? "" : item.homeValue;
            item.awayValue = needReset ? "" : item.awayValue;
        }
        item.className = this.#backgroundPipe.transform(item.settlementStatusId);
    });
  }
  async refund() {
    const paramsCheckingMarkedTickets = this.generateCheckMarkedTicketsQuery();
    const res = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets);
    this.toastrService.clear();
    if (this.existResultNotConfirmed()) {
      this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
    } else if (res.isExistMarkedTicket) {
      this.toastrService.error(Language.MarkedTicket);
    } else {
      this.#notifyService.confirm(Language.RefundConfirmMessage, () => {
        this.doRefund();
      });
    }
  }

  private async doRefund() {
    const query = this.generateRefundQuery(BaseballApiKeys.Settle);
    const result = await this.aioService.push(query);
    if (result.errCode === 0) {
      result.childMatchIds && await this.refundChildMatch(result.childMatchIds, result.settledSessionId);
      this.refundHedgeMatch(query);
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }

  private async refundChildMatch(childMatchIds: string, parentSessionId: string) {
    const settleChildMatchQuery = new SettleChildMatchQuery(
      childMatchIds, 
      this.selectedResources,
      CalculateAction.refund, 
      false);

    settleChildMatchQuery.sportType = this.matchDetail.sportType;
    settleChildMatchQuery.parentSessionId = parentSessionId;

    await this.aioService.pushChildMatch(settleChildMatchQuery);
  }

  confirmRefund(confirmRefundResources?: ResourceItem[]) {
    
    console.log(this.#storage.isSdtSettle() +" - "+this.#storage.isMercy() +" - "+ this.#storage.isAwayEnded());
  }
}
