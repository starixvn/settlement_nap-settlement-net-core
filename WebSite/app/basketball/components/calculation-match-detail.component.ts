import { CommonModule } from '@angular/common';
import * as _ from 'lodash';
import {
    Match,
} from '../models';
import { Component, Input, OnInit } from '@angular/core';
import { MatchDetail } from '../../shared/models/sportsbook-sop';
import { AioService } from '../../shared/services';
import { MatDialog } from '@angular/material/dialog';
import { CalculationMatchDetailBaseComponent } from '../../shared/components/sportsbook-sop/calculation-match-detail-base.component';
@Component({
    selector: 'calculation-match-detail',
    templateUrl: './calculation-match-detail.component.html',
    standalone: true,
    imports: [CommonModule]
})
export class CalculationMatchDetailComponent extends CalculationMatchDetailBaseComponent implements OnInit {
    @Input() match: Match;
    @Input() isCalculate: boolean;
    public matchDetail: MatchDetail;

    constructor(protected basketBallDialog: MatDialog,
        protected basketBallAioService: AioService) {
        super(basketBallDialog, basketBallAioService);
    }

    public ngOnInit() {
        this.matchDetail = this.match.matchDetail;
    }
}