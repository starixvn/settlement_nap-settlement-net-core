import { FormsModule } from '@angular/forms';
import { Component, inject } from '@angular/core';
import { SportTemplate } from '../../../shared/models/sportsbook-sop';
import { MatchDetailComponent } from '../../../shared/components/sportsbook-sop/match-detail/match-detail.component';
import { CommonModule } from '@angular/common';
import { TicketCountComponent } from '../../../shared/components/ticket-count/ticket-count.component';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
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
import { Language } from '../../../shared/language.native';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'calculate',
  standalone: true,
  imports: [MatchDetailComponent, TicketCountComponent, ResettleCheckerComponent,
     CommonModule, FormsModule, TableResultHeaderComponent, TableResultBodyComponent, TableResultFooterComponent],
  providers: [IntervalBackgroundPipe, ResultRowStateService, ResourceNamePipe, CalculateService,IntervalCalculationService],
  templateUrl: './calculate.component.html'
})
export class CalculateComponent implements SportTemplate {
  readonly #storage = inject(CalculateStorage);
  readonly #toastrService = inject(ToastrService);

  applyHedgeMatch: boolean;
  match: Match;
  isResettleTickets = this.#storage.isReSettledTickets;
  
  async getMatch(matchId: number) {
    await this.#storage.fetchMatch(matchId);
    this.#storage.resetHomeAway();
    this.#storage.mapTicketStatusExtraInning();
    this.match = this.#storage.getMatch();
    this.applyHedgeMatch = this.#storage.getApplyingHedgeMatch();
    if(!this.#storage.isReadyMatch()) {
      this.#toastrService.error(Language.minimumPlayTimeNotReached);
    }
  }

  onResettleCheckboxChange(isChecked: boolean) {
    this.#storage.setReSettledTickets(isChecked);
  }

  changeApplyHedgeMatch(isChecked: boolean) {
    this.#storage.setIsApplyHedgeMatch(isChecked);
  }
}
