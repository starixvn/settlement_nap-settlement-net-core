import * as _ from 'lodash';
import { Component, Input, OnInit } from '@angular/core';
import { Match } from '../models';
import { BasketballService } from '../services';
import { ResourcesIds } from '../constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { MatchDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { ResultStatus, SettlementStatusId } from '../../shared/constants';

@Component({
    selector: 'match-detail',
    templateUrl: './match-detail.component.html'
})
export class MatchDetailComponent implements OnInit {
    @Input() public match: Match;
    @Input() public isEarlySettlement: boolean;
    public matchDetail: MatchDetail;
    public resultDetail: ResultDetail[];
    constructor(private readonly basketballService: BasketballService,
                private readonly intervalBackgroundPipe: IntervalBackgroundPipe) { }

    public ngOnInit() {
        this.matchDetail = this.match.matchDetail;
        this.resultDetail = this.basketballService.getResultDetail(this.match.resultDetails, false);
        this.resultDetail.forEach(item => {
            item.className = this.getClass(item);
            item.isDisplayedForMember = this.match.permission.isLeader || Number(item.settlementStatusId) !== SettlementStatusId.Running;
        });
    }

    public getClass(resultDetail: ResultDetail) {
        let className = '';

        if (_.isEqual(resultDetail.resourceId, ResourcesIds.finalScore)) {
                className +=  'final-score ';
        } else if (_.isEqual(resultDetail.resourceId, ResourcesIds.htScore)) {
            className += 'ht-score ';
        }

        return className +  this.intervalBackgroundPipe.transform(resultDetail.settlementStatusId);
    }

    public refresh() {
        window.location.reload();
    }
}