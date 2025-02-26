import { Component, OnInit, Input } from '@angular/core';
import { MatchDetail, Match } from '../early/models';
import { PageType } from '../../../shared/constants';
import { ScoreBySettlementPipe } from '../../../shared/pipes/score-by-settlement.pipe';
import { DatePipe } from '@angular/common';

@Component({
    selector: 'match-detail',
    standalone: true,
    imports: [ScoreBySettlementPipe, DatePipe],
    templateUrl: './match-detail.component.html',
})

export class MatchDetailComponent implements OnInit {
    @Input() match: Match;
    @Input() pageType: string ;
     matchDetail: MatchDetail;
     pageTypeEnum = PageType;
     ngOnInit() {
        this.matchDetail = this.match.matchDetail;
    }

     refresh() {
        window.location.reload();
    }
}