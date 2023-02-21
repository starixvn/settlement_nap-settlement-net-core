import * as _ from 'lodash';
import { Component } from '@angular/core';
import { MatchDetail } from '../../models/sportsbook-sop';
import { AioService } from '../../services';
import { MatDialog } from '@angular/material/dialog';
import { ManageLeagueComponent } from '../../../score-source-setting/components';
import { LeagueOutsideSource } from '../../../score-source-setting/models';

@Component({
    selector: 'calculation-match-detail-base',
    template: '',
})
export class CalculationMatchDetailBaseComponent {
    public matchDetail: MatchDetail;

    constructor(
        protected dialog: MatDialog,
        protected aioService: AioService) {
    }

    public manageOutSideSourcePopup() {
        this.aioService.getLeagueSources(this.matchDetail.leagueId).subscribe((source: LeagueOutsideSource) => {
            source.leagueName = this.matchDetail.leagueName;
            source.leagueId = this.matchDetail.leagueId;
            source.sportName = this.matchDetail.sportName;
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