import { FormsModule } from '@angular/forms';
import { Component, input, OnInit, inject } from '@angular/core';
import { Match } from '../../../models/match.model';
import { MatchDetail } from '../../../../shared/models/sportsbook-sop';
import { SettlementStatusId } from '../../../../shared/constants';
import { RefundStorage } from '../../../services/refund/refund.storage';

@Component({
  selector: 'table-sdt',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './table-settle-sdt.component.html',
})
export class TableSettleSdtComponent implements OnInit{
  #storage = inject(RefundStorage);
  match = input.required<Match>();
  mercy = input.required<boolean>();
  awayEnded = input.required<boolean>();
  matchDetail: MatchDetail;
  isMercy: boolean;
  isAwayEnded: boolean;
  isSdtSettle: boolean;
  ngOnInit(): void {
    this.isMercy = this.mercy();
    this.isAwayEnded = this.awayEnded();
    this.matchDetail = this.match().matchDetail;
    this.isSdtSettle = this.isAwayEnded || this.initSdtSettle();
    this.resetAllCheckboxMarkedTicket();
  }

  initSdtSettle() {
    const resultDetails = this.match().resultDetails;
    const existResultConfirmedSDT = resultDetails.some(item => item.resultSettingData.isConfirmedRefundSdt);
    if (existResultConfirmedSDT) {
        return true;
    }

    const resultConfirmNormal = resultDetails.some(item => item.resultSettingData.isConfirmedRefund);

    if (resultConfirmNormal) {
        return false;
    }

    return resultDetails.some(item => item.settlementStatusId === SettlementStatusId.Calculated);
  }

  changeSdtSettle() {
    if(this.isSdtSettle && this.isMercy) {
      this.isMercy = false;
    } else {
      this.isAwayEnded = false;
    }

    this.resetAllCheckboxMarkedTicket();
  }

  changeMercy() {
    if(this.isSdtSettle && this.isMercy) {
      this.isSdtSettle = false;
      this.isAwayEnded = false;
    }

    this.resetAllCheckboxMarkedTicket();
  }

  changeAwayEnded() {
    if(this.isAwayEnded) {
      this.isSdtSettle = true;
      this.isMercy = false;
    }

    this.resetAllCheckboxMarkedTicket();
  }

  resetAllCheckboxMarkedTicket() {
    this.#storage.setSettleDetermine(this.isSdtSettle);
    this.#storage.setMercy(this.isMercy);
    this.#storage.setAwayEnded(this.isAwayEnded);
  }
}