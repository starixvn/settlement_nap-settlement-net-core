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
  isMercy: boolean;
  isAwayEnded: boolean;
  isSdtSettle: boolean;
  awayName: string;
  ngOnInit(): void {
    this.isMercy = this.#storage.isGetMercy();
    this.isAwayEnded = this.#storage.isGetAwayEnded();
    this.awayName = this.#storage.getMatchDetail().awayName;
    this.isSdtSettle = this.isAwayEnded || this.initSdtSettle();
    this.resetAllCheckboxMarkedTicket();
  }

  initSdtSettle() {
    const resultDetails = this.#storage.getResultDetails();
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