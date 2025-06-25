import { Component, OnInit, Input, inject } from '@angular/core';
import { MatchDetail, Match } from '../early/models';
import { PageType } from '../../../shared/constants';
import { ScoreBySettlementPipe } from '../../../shared/pipes/score-by-settlement.pipe';
import { CommonModule, DatePipe } from '@angular/common';
import { LeagueOutsideSource } from '../../../score-source-setting/models';
import { ManageLeagueComponent } from '../../../score-source-setting/components';
import { AioService } from '../../../shared/services';
import { MatDialog } from '@angular/material/dialog';
import * as _ from 'lodash';

@Component({
    selector: 'match-detail',
    standalone: true,
    imports: [ScoreBySettlementPipe, DatePipe, CommonModule],
    templateUrl: './match-detail.component.html',
    styleUrls: ['./match-detail.component.less']
})

export class MatchDetailComponent implements OnInit {
    @Input() match: Match;
    @Input() pageType: string;
    aioService = inject(AioService);
    dialog = inject(MatDialog);
    matchDetail: MatchDetail;
    pageTypeEnum = PageType;
    ngOnInit() {
        this.matchDetail = this.match.matchDetail;
    }

    refresh() {
        window.location.reload();
    }

    manageOutSideSourcePopup() {
        this.aioService.getLeagueSources(this.match.matchDetail.leagueId).subscribe((source: LeagueOutsideSource) => {
            source.leagueName = this.match.matchDetail.leagueName;
            source.leagueId = this.match.matchDetail.leagueId;
            source.sportName = this.match.matchDetail.sportName;
            this.dialog.closeAll();
            this.dialog.open(ManageLeagueComponent, {
                width: '500px',
                data: source
            }).afterClosed().subscribe((result) => {
                if (result && _.isEqual(result.event, 'Save')) {
                    window.location.reload();
                }
            });
        });
    }
}