import { CommonModule } from '@angular/common';
import * as _ from 'lodash';
import { Component, Input, OnInit, Injector, inject } from '@angular/core';
import { Match } from '../models';
import { BasketballService } from '../services';
import { ResourcesIds } from '../constants';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { MatchDetail, ResultDetail } from '../../shared/models/sportsbook-sop';
import { SettlementStatusId } from '../../shared/constants';
import { ScoreBySettlementPipe } from '../../shared/pipes/score-by-settlement.pipe';
import { Language } from '../../shared/language.native';

@Component({
    selector: 'match-detail',
    templateUrl: './match-detail.component.html',
    standalone: true,
    imports: [CommonModule, ScoreBySettlementPipe]
})
export class MatchDetailComponent implements OnInit {
    @Input() match: Match;
    @Input() isEarlySettlement: boolean;
    matchDetail: MatchDetail;
    resultDetails: ResultDetail[];
    basketballService = inject(BasketballService);
    constructor(private readonly injector: Injector) { }

    ngOnInit() {
        this.matchDetail = this.match.matchDetail;
        this.resultDetails = this.basketballService.getResultDetail(this.match.resultDetails, false);
        this.resultDetails.forEach(item => {
            item.className = this.getClass(item);
            item.isDisplayedForMember = this.match.permission.isLeader || Number(item.settlementStatusId) !== SettlementStatusId.Running;
        });
        this.resetHomeAway();
    }

    private resetHomeAway() {
        this.resultDetails.forEach((map) => {
            const needReset = this.basketballService.isFinalSdt(map, this.resultDetails);
            map.homeValue = needReset ? "" : map.homeValue;
            map.awayValue = needReset ? "" : map.awayValue;
        });
    }

    getClass(resultDetail: ResultDetail) {
        let className = '';

        if (_.isEqual(resultDetail.resourceId, ResourcesIds.finalScore)) {
            className += 'final-score ';
        } else if (_.isEqual(resultDetail.resourceId, ResourcesIds.htScore)) {
            className += 'ht-score ';
        }

        return className + this.injector.get(IntervalBackgroundPipe).transform(resultDetail.settlementStatusId);
    }

    refresh() {
        window.location.reload();
    }
}