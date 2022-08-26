import { Component, OnInit, Input } from '@angular/core';
import * as _ from 'lodash';
import { MatchDetail } from '../../shared/models/sportsbook-sop';
import { Match } from '../models';
import { MatDialog } from '@angular/material/dialog';
import { AioService } from '../../shared/services';
import { CalculationMatchDetailBaseComponent } from '../../shared/components/sportsbook-sop/calculation-match-detail-base.component';
@Component({
    selector: 'calculation-match-detail',
    templateUrl: './calculation-match-detail.component.html',
})
export class CalculationMatchDetailComponent extends CalculationMatchDetailBaseComponent  implements OnInit {
    @Input() public match: Match;
    public matchDetail: MatchDetail;

    constructor(protected dialog: MatDialog,
        protected aioService: AioService) {
            super(dialog, aioService);
        }

    public ngOnInit() {
        this.matchDetail = this.match.matchDetail;
    }
}