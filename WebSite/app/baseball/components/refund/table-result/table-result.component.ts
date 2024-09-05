import { FormsModule } from '@angular/forms';
import { Component, inject, input, OnInit } from '@angular/core';
import { RefundActionBaseComponent } from '../../../../shared/components/sportsbook-sop/refund-action-base.component';
import { Match } from '../../../models/match.model';
import { CommonModule } from '@angular/common';
import { ResourceNamePipe } from '../../../pipes/resource-name.pipe';
import { ResourceIds } from '../../../constants/resource-id.constant';
import { HedgeMatchDetail, MatchDetail, Permission, ResultDetail, SettleQuery } from '../../../../shared/models/sportsbook-sop';
import { Language } from '../../../../shared/language.native';
import { NotifyService } from '../../../services/notify.service';
import { BaseballApiKeys } from '../../../constants/api-keys.constant';

@Component({
  selector: 'table-result',
  standalone: true,
  imports: [CommonModule, FormsModule, ResourceNamePipe],
  templateUrl: './table-result.component.html',
})
export class TableResultComponent extends RefundActionBaseComponent implements OnInit{
  match = input.required<Match>();
  #notifyService = inject(NotifyService);
  hedgeMatchDetail: HedgeMatchDetail;
  applyHedgeMatch: boolean;
  resultDetails: ResultDetail[];
  matchDetail: MatchDetail;
  permission: Permission;
  extraInningId = ResourceIds.extraInning;


  ngOnInit(): void {
    this.hedgeMatchDetail = this.match().hedgeMatchDetail;
    this.applyHedgeMatch = this.hedgeMatchDetail !== null;
    this.resultDetails = this.match().resultDetails;
    this.matchDetail = this.match().matchDetail;
    this.permission = this.match().permission;
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
      this.refundHedgeMatch(query);
      this.messageBoxService.closePopup();
    } else {
      this.toastrService.error(result.errMsg);
    }
  }
}
