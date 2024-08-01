import { TicketCountComponent } from './../../../shared/components/ticket-count/ticket-count.component';
import { Component, inject } from '@angular/core';
import { GroupMap, ResultDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import {  EarlySettlementStore } from '../../services/early-settlement/early-settlement.store';
import { ResourceNamePipe } from '../../pipes/resource-name.pipe';
import { MatchDetailComponent } from '../../../shared/components/sportsbook-sop/match-detail/match-detail.component';
import { CommonModule } from '@angular/common';
import { KickOffTime } from '../../constants/kick-off-time.constant';
import { TableResultHeaderComponent } from "./table-result/table-result-header/table-result-header.component";
import { TableResultBodyComponent } from './table-result/table-result-body/table-result-body.component';
import { EarlySettlementService } from '../../services/early-settlement/early-settlement.service';
import { TableResultFooterComponent } from './table-result/table-result-footer/table-result-footer.component';
import { ResettleCheckerComponent } from "../../../shared/components/resettle-checker/resettle-checker.component";

@Component({
  selector: 'early-settlement',
  standalone: true,
  imports: [MatchDetailComponent, TicketCountComponent, CommonModule, TableResultHeaderComponent, TableResultBodyComponent, TableResultFooterComponent, ResettleCheckerComponent],
  providers: [EarlySettlementStore, ResourceNamePipe, EarlySettlementService],
  templateUrl: './early-settlement.component.html',
})
export class EarlySettlementComponent implements SportTemplate{
  store = inject(EarlySettlementStore);
  match = this.store.match;
  isReadyMatch = false;
  mainResult: ResultDetail[];
  isResettleTickets = this.store.isReSettledTickets();
  async getMatch(matchId: number): Promise<void> {
    await this.store.fetchMatch(matchId);
    this.store.groupInning();
    this.isReadyMatch = this.match().matchDetail.playTime >= KickOffTime.playTime;
    this.mainResult = this.store.getMainResult();
  }

  refresh(){
    window.location.reload();
  }

  onResettleCheckboxChange(isChecked: boolean) {
    this.store.setReSettledTickets(isChecked);
  }

}
