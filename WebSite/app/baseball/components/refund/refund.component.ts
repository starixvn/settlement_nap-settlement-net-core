import { Component, inject } from '@angular/core';
import {SportTemplate } from '../../../shared/models/sportsbook-sop';
import { RefundStorage } from '../../services/refund/refund.storage';
import { MatchDetailComponent } from '../../../shared/components/sportsbook-sop/match-detail/match-detail.component';
import { ResourceNamePipe } from '../../pipes/resource-name.pipe';
import { TableResultComponent } from "./table-result/table-result.component";
import { TableSettleSdtComponent } from "./table-sdt/table-settle-sdt.component";
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';

@Component({
  selector: 'refund',
  standalone: true,
  imports: [MatchDetailComponent, TableResultComponent, TableSettleSdtComponent],
  providers: [RefundStorage, ResourceNamePipe,IntervalBackgroundPipe],
  templateUrl: './refund.component.html'
})
export class RefundComponent implements SportTemplate{
  #storage = inject(RefundStorage);
  match = this.#storage.match;
  resultDetails = this.#storage.getResultDetails;
  mercy = this.#storage.isGetMercy;
  awayEnded = this.#storage.isGetAwayEnded;
  async getMatch(matchId: number) {
     await this.#storage.fetchMatch(matchId);
  }
}
