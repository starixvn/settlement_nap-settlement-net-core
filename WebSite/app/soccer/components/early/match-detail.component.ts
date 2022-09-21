import { Component, OnInit, Input } from '@angular/core';
import { MatchDetail, Match } from './models';

@Component({
    selector: 'match-detail',
    templateUrl: './match-detail.component.html',
})

export class MatchDetailComponent implements OnInit {
    @Input() public match: Match;
    public matchDetail: MatchDetail;
    public ngOnInit() {
        this.matchDetail = this.match.matchDetail;
    }

    public refresh() {
        window.location.reload();
    }
}