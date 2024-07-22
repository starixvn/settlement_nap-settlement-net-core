import { FormsModule } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { SportTemplate } from '../../../shared/models/sportsbook-sop';
import { MatchDetailComponent } from '../../../shared/components/sportsbook-sop/match-detail/match-detail.component';
import { KickOffTime } from '../../constants/kick-off-time.constant';
import { CommonModule } from '@angular/common';
import { TicketCountComponent } from '../../../shared/components/ticket-count/ticket-count.component';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
import { CalculateStore } from '../../services/calculate/calculate.store';
import { NotReadyMatchComponent } from "../../../shared/components/not-ready-match/not-ready-match.component";
import { TableResultHeaderComponent } from './table-result/table-result-header/table-result-header.component';
import { TableResultBodyComponent } from './table-result/table-result-body/table-result-body.component';
import { TableResultFooterComponent } from './table-result/table-result-footer/table-result-footer.component';
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
import { ResultRowStateService } from '../../services/result-row-state.service';
import { ResourceNamePipe } from '../../pipes/resource-name.pipe';
@Component({
  selector: 'calculate',
  standalone: true,
  imports: [MatchDetailComponent, TicketCountComponent, ResettleCheckerComponent,
     CommonModule, FormsModule, NotReadyMatchComponent, TableResultHeaderComponent, TableResultBodyComponent, TableResultFooterComponent],
  providers: [IntervalBackgroundPipe, ResultRowStateService, ResourceNamePipe],
  templateUrl: './calculate.component.html'
})
export class CalculateComponent implements SportTemplate {
  private store = inject(CalculateStore);
  isReadyMatch = false;
  applyHedgeMatch: boolean;
  isResettleTickets = this.store.isReSettledTickets();
  match = this.store.match;
  async getMatch(matchId: number) {
    await this.store.fetchMatch(matchId);
    this.isReadyMatch = this.match().matchDetail.playTime >= KickOffTime.playTime;
    this.store.resetHomeAway();
  }

  onResettleCheckboxChange(isChecked: boolean) {
    this.store.setReSettledTickets(isChecked);
  }

  changeApplyHedgeMatch(isChecked: boolean) {
    this.store.setIsApplyHedgeMatch(isChecked);
  }
}
