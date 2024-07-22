import { Component } from '@angular/core';
import { SportTemplate } from '../../../shared/models/sportsbook-sop';

@Component({
  selector: 'early-settlement',
  standalone: true,
  imports: [],
  templateUrl: './early-settlement.component.html',
})
export class EarlySettlementComponent implements SportTemplate{
  getMatch(matchId: number): void {
    throw new Error('Method not implemented.');
  }

}
