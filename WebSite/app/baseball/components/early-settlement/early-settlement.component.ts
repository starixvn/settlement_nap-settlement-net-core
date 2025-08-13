import { TicketCountComponent } from './../../../shared/components/ticket-count/ticket-count.component';
import { Component, inject } from '@angular/core';
import { ResultDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import {  EarlySettlementStorage } from '../../services/early-settlement/early-settlement.storage';
import { ResourceNamePipe } from '../../pipes/resource-name.pipe';
import { MatchDetailComponent } from '../../../shared/components/sportsbook-sop/match-detail/match-detail.component';
import { CommonModule } from '@angular/common';
import { TableResultHeaderComponent } from "./table-result/table-result-header/table-result-header.component";
import { TableResultBodyComponent } from './table-result/table-result-body/table-result-body.component';
import { EarlySettlementService } from '../../services/early-settlement/early-settlement.service';
import { TableResultFooterComponent } from './table-result/table-result-footer/table-result-footer.component';
import { ResettleCheckerComponent } from "../../../shared/components/resettle-checker/resettle-checker.component";
import { IntervalBackgroundPipe } from '../../../shared/pipes/interval-background.pipe';
import { Language } from '../../../shared/language.native';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'early-settlement',
  standalone: true,
  imports: [MatchDetailComponent, TicketCountComponent,CommonModule, TableResultHeaderComponent, TableResultBodyComponent, TableResultFooterComponent, ResettleCheckerComponent],
  providers: [EarlySettlementStorage, ResourceNamePipe, EarlySettlementService,IntervalBackgroundPipe],
  templateUrl: './early-settlement.component.html',
})
export class EarlySettlementComponent implements SportTemplate{
  private readonly storage = inject(EarlySettlementStorage);
  readonly #toastrService = inject(ToastrService);

  match = this.storage.match;
  mainResult: ResultDetail[];
  isResettleTickets = this.storage.isReSettledTickets;

  async getMatch(matchId: number): Promise<void> {
    await this.storage.fetchMatch(matchId);
    this.storage.groupInning();
    this.mainResult = this.storage.getMainResult();

    if (!this.storage.isReadyMatch()) {
      this.#toastrService.error(Language.minimumPlayTimeNotReached);
    }
  }

  refresh(){
    window.location.reload();
  }

  onResettleCheckboxChange(isChecked: boolean) {
    this.storage.setReSettledTickets(isChecked);
  }

}
