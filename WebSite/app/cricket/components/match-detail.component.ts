import { Component, OnInit, Input } from '@angular/core';
import { ModalDialogMessage } from '../../shared/models';
import { Match, MatchDetail } from '../models';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { ResourcesIds } from '../constants';
import * as _ from 'lodash';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { SettlementStatusId } from '../../shared/constants';

@Component({
    selector: 'match-detail',
    templateUrl: './match-detail.component.html',
})
export class MatchDetailComponent implements OnInit {
    @Input() public match: Match;
    @Input() public isEarlySettlement: boolean;

    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public matchDetail: MatchDetail;

    constructor(
        private readonly intervalBackgroundPipe: IntervalBackgroundPipe) { }

    public ngOnInit() {
        this.matchDetail = this.match.matchDetail;
        this.homeScore.forEach(item => item.isDisplayedForMember = this.match.permission.isLeader
            || Number(item.settlementStatusId) !== SettlementStatusId.Running);
        this.awayScore.forEach(item => item.isDisplayedForMember = this.match.permission.isLeader
            || Number(item.settlementStatusId) !== SettlementStatusId.Running);
        this.matchScore.isDisplayedForMember = this.match.permission.isLeader
            || Number(this.matchScore.settlementStatusId) !== SettlementStatusId.Running;
    }

    reloadPage() {
        window.location.reload();
    }

    public get matchScore(): ResultDetail {
        return this.match.resultDetails.find((item: ResultDetail) => item.resourceId === ResourcesIds.final);
    }

    public get homeScore(): ResultDetail[] {
        return _.filter(this.match.resultDetails, map => map.resourceId.substr(0, 1) === 'H');
    }

    public get awayScore(): ResultDetail[] {
        return _.filter(this.match.resultDetails, map => map.resourceId.substr(0, 1) === 'A');
    }

    public getClass(resultDetail: ResultDetail) {
        const className = _.isEqual(resultDetail.resourceId, ResourcesIds.final) ? 'final-score ' : '';

        return className + this.intervalBackgroundPipe.transform(resultDetail.settlementStatusId);
    }

    private refresh() {
        window.location.reload();
    }
}
