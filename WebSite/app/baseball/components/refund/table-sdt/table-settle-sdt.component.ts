import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ResourceIds } from '../../../../shared/constants';
import { RefundStorage } from '../../../services/refund/refund.storage';
import * as _ from "lodash";
import { ResultDetailBaseBall } from '../../../models';
@Component({
  selector: 'table-sdt',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './table-settle-sdt.component.html',
})
export class TableSettleSdtComponent implements OnInit{
  #storage = inject(RefundStorage);
  isMatchSeries = this.#storage.isMatchSeries();
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
    const resultDetails = this.#storage.getResultDetails();
    resultDetails.forEach((item) => {
      if (this.isSdtSettle) {
        this.renderInputSdtSettle(item);
      } else if (this.isMercy && _.includes([ResourceIds.totalHits, ResourceIds.fullTime], item.resourceId)) {
          item.disabled = true;
          item.checked = false;
      } else {
        item.disabled = true;
      }
    });
  }

  renderInputSdtSettle(item: ResultDetailBaseBall) {
    item.disabled = !item.checked;
      if(_.isEqual(item.resourceId, ResourceIds.totalHits)) {
        item.disabled = true;
        item.checked = false;
      }

      if(_.isEqual(item.resourceId, ResourceIds.extraInning)) { 
        item.disabled = !this.#storage.isSelectedMatch();
      }

      if(_.isEqual(item.resourceId, ResourceIds.fullTime)) {
        item.disabled = true;
      }
  }
}