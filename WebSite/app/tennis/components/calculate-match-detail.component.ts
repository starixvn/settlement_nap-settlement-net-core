import { Component, OnInit, Input } from '@angular/core';
import { Match } from '../models';
import { MatDialog } from '@angular/material/dialog';
import { AioService } from '../../shared/services';
import { CalculationMatchDetailBaseComponent } from '../../shared/components/sportsbook-sop/calculation-match-detail-base.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'calculate-match-detail',
  templateUrl: './calculate-match-detail.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class CalculateMatchDetailComponent extends CalculationMatchDetailBaseComponent  implements OnInit {
  @Input() public match: Match;

  constructor(protected dialog: MatDialog,
    protected aioService: AioService) {
      super(dialog, aioService);
     }

  public ngOnInit() {
    this.matchDetail = this.match.matchDetail;
  }
}