import { CommonModule } from '@angular/common';
import * as _ from 'lodash';
import { Component, Input, OnInit, Injector } from '@angular/core';
import { Match } from '../models';
import { BasketballService } from '../services';
import { ResourcesIds } from '../constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { MatchDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { SettlementStatusId } from '../../shared/constants';
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';

@Component({
    selector: 'match-detail',
    templateUrl: './match-detail.component.html',
    standalone: true,
    imports: [CommonModule, ScoreBySettlementPipe]
})
export class MatchDetailComponent implements OnInit {
    @Input() public match: Match;
    @Input() public isEarlySettlement: boolean;
    public matchDetail: MatchDetail;
    public resultDetail: ResultDetail[];
    constructor(private readonly injector: Injector) { }

    public ngOnInit() {
        this.matchDetail = this.match.matchDetail;
        this.resultDetail = this.injector.get(BasketballService).getResultDetail(this.match.resultDetails, false);
        this.resultDetail.forEach(item => {
            item.className = this.getClass(item);
            item.isDisplayedForMember = this.match.permission.isLeader || Number(item.settlementStatusId) !== SettlementStatusId.Running;
        });
    }

    public getClass(resultDetail: ResultDetail) {
        let className = '';

        if (_.isEqual(resultDetail.resourceId, ResourcesIds.finalScore)) {
            className += 'final-score ';
        } else if (_.isEqual(resultDetail.resourceId, ResourcesIds.htScore)) {
            className += 'ht-score ';
        }

        return className + this.injector.get(IntervalBackgroundPipe).transform(resultDetail.settlementStatusId);
    }

    public refresh() {
        window.location.reload();
    }
}