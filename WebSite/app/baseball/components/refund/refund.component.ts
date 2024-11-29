import { Component, inject } from '@angular/core';
import { SportTemplate } from '../../../shared/models/sportsbook-sop';
import { RefundStorage } from '../../services/refund/refund.storage';
import { MatchDetailComponent } from '../../../shared/components/sportsbook-sop/match-detail/match-detail.component';
import { ResourceNamePipe } from '../../pipes/resource-name.pipe';
import { TableResultComponent } from "./table-result/table-result.component";
import { TableSettleSdtComponent } from "./table-sdt/table-settle-sdt.component";
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
import { Match } from '../../models/match.model';
import { ResultDetail } from "../../../shared/models/sportsbook-sop/result-detail.model";
import { RefundService } from "../../services/refund/refund.service";
import { ConfirmRefundService } from "../../services/refund/confirm-refund.service";

@Component({
  selector: 'refund',
  standalone: true,
  imports: [MatchDetailComponent, TableResultComponent, TableSettleSdtComponent],
  providers: [RefundStorage, ResourceNamePipe,IntervalBackgroundPipe, RefundService, ConfirmRefundService],
  templateUrl: './refund.component.html'
})
export class RefundComponent implements SportTemplate{
  #storage = inject(RefundStorage);
  match: Match;
  resultDetails: ResultDetail[];
  async getMatch(matchId: number) {
     await this.#storage.fetchMatch(matchId);
     this.match = this.#storage.getMatch();
     this.resultDetails = this.#storage.getResultDetails();
  }
}
