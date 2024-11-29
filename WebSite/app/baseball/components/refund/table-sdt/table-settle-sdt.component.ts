import { FormsModule } from '@angular/forms';
import { Component, OnInit, inject } from '@angular/core';
import { SettlementStatusId, ResourceIds } from '../../../../shared/constants';
import { RefundStorage } from '../../../services/refund/refund.storage';
import * as _ from "lodash";
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
    this.isSdtSettle = this.#storage.isGetSettleSdt();
    this.awayName = this.#storage.getMatchDetail().awayName;
    this.resetAllCheckboxMarkedTicket();
  }

  changeSdtSettle() {
    if(this.isSdtSettle && this.isMercy) {
      this.isMercy = false;
    } 
    
    this.resetAllCheckboxMarkedTicket();
    this.renderInput();
  }

  changeMercy() {
    if(this.isSdtSettle && this.isMercy) {
      this.isSdtSettle = false;
      this.isAwayEnded = false;
    }

    this.resetAllCheckboxMarkedTicket();
    this.renderInput();
  }

  changeAwayEnded() {
    if(this.isAwayEnded) {
      this.isSdtSettle = true;
      this.isMercy = false;
    }
    this.resetAllCheckboxMarkedTicket();
    this.renderInput();
  }

  resetAllCheckboxMarkedTicket() {
    this.#storage.setSettleDetermine(this.isSdtSettle);
    this.#storage.setMercy(this.isMercy);
    this.#storage.setAwayEnded(this.isAwayEnded);
  }

  renderInput() {
    const resultDetails = this.#storage.getResultChecked();
    resultDetails.forEach((item) => {
      if (this.isSdtSettle) {
        item.disabled = false;
        if(_.isEqual(item.resourceId, ResourceIds.totalHits)) {
          item.disabled = true;
          item.checked = false;
        }
      } else if (this.isMercy && _.includes([ResourceIds.totalHits, ResourceIds.fullTime], item.resourceId)) {
          item.disabled = true;
          item.checked = false;
      } else {
        item.disabled = true;
      }
    });
  }
}