import { Component, inject } from '@angular/core';
import {SportTemplate } from '../../../shared/models/sportsbook-sop';
import { RefundStore } from '../../services/refund/refund.store';
import { MatchDetailComponent } from '../../../shared/components/sportsbook-sop/match-detail/match-detail.component';
import { ResourceNamePipe } from '../../pipes/resource-name.pipe';
import { TableResultComponent } from "./table-result/table-result.component";

@Component({
  selector: 'refund',
  standalone: true,
  imports: [MatchDetailComponent, TableResultComponent],
  providers: [RefundStore, ResourceNamePipe],
  templateUrl: './refund.component.html',
  styles: ``
})
export class RefundComponent implements SportTemplate{
  store = inject(RefundStore);
  match = this.store.match;
  async getMatch(matchId: number) {
    await this.store.fetchMatch(matchId);
  }
}
