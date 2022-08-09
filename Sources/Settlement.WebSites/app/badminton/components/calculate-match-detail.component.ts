import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { Match } from '../models';
import { MatDialog } from '@angular/material/dialog';
import { AioService } from '../../shared/services';
import { CalculationMatchDetailBaseComponent } from '../../shared/components/sportsbook-sop/calculation-match-detail-base.component';
@Component({
  selector: 'calculate-match-detail',
  templateUrl: './calculate-match-detail.component.html',
})
export class CalculateMatchDetailComponent extends CalculationMatchDetailBaseComponent implements OnInit {
  @Input() public match: Match;
  constructor(protected dialog: MatDialog,
    protected aioService: AioService) {
      super(dialog, aioService);
    }

  public ngOnInit() {
    this.matchDetail = this.match.matchDetail;
  }
}