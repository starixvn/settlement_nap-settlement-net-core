import { FormsModule } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { SportTemplate } from '../../../shared/models/sportsbook-sop';
import { MatchDetailComponent } from '../../../shared/components/sportsbook-sop/match-detail/match-detail.component';
import { KickOffTime } from '../../constants/kick-off-time.constant';
import { CommonModule } from '@angular/common';
import { TicketCountComponent } from '../../../shared/components/ticket-count/ticket-count.component';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
import { NotReadyMatchComponent } from "../../../shared/components/not-ready-match/not-ready-match.component";
import { TableResultHeaderComponent } from './table-result/table-result-header/table-result-header.component';
import { TableResultBodyComponent } from './table-result/table-result-body/table-result-body.component';
import { TableResultFooterComponent } from './table-result/table-result-footer/table-result-footer.component';
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
import { ResultRowStateService } from '../../services/result-row-state.service';
import { ResourceNamePipe } from '../../pipes/resource-name.pipe';
import { Match } from '../../models/match.model';
import { CalculateStorage } from '../../services/calculate/calculate.storage';
import { CalculateService } from '../../services/calculate/calculate.service';
import { IntervalCalculationService } from '../../../shared/services';
@Component({
  selector: 'calculate',
  standalone: true,
  imports: [MatchDetailComponent, TicketCountComponent, ResettleCheckerComponent,
     CommonModule, FormsModule, NotReadyMatchComponent, TableResultHeaderComponent, TableResultBodyComponent, TableResultFooterComponent],
  providers: [IntervalBackgroundPipe, ResultRowStateService, ResourceNamePipe, CalculateService,IntervalCalculationService],
  templateUrl: './calculate.component.html'
})
export class CalculateComponent implements SportTemplate {
  #storage = inject(CalculateStorage);

  isReadyMatch = false;
  applyHedgeMatch: boolean;
  match: Match;
  isResettleTickets = this.#storage.isReSettledTickets;
  
  async getMatch(matchId: number) {
    await this.#storage.fetchMatch(matchId);
    this.isReadyMatch = this.#storage.getMatchDetail().playTime >= KickOffTime.playTime;
    this.#storage.resetHomeAway();
    this.#storage.mapTicketStatusExtraInning();
    this.match = this.#storage.getMatch();
    this.applyHedgeMatch = this.#storage.getApplyingHedgeMatch();}

  onResettleCheckboxChange(isChecked: boolean) {
    this.#storage.setReSettledTickets(isChecked);
  }

  changeApplyHedgeMatch(isChecked: boolean) {
    this.#storage.setIsApplyHedgeMatch(isChecked);
  }
}
