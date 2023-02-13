import { TeamSettle } from './../../models/team.model';
import { CalculatePopupComponent } from './../popup/calculate-popup.component';
import { Component, Input, OnInit } from '@angular/core';
import { FilterRequest } from '../../models/filter-request.model';
import { Outright } from '../../models/outright.model';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { DialogBoxService } from '../../../shared/services';
import { DynamicHeightDirective } from '../../../shared/directives';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LogPopupComponent } from '../popup/log-popup.component';
import { LeagueMatch } from '../../models/league-match.model';
import { UncalculatePopupComponent } from '../popup/uncalculate-popup.component';
import * as _ from 'lodash';

@Component({
    selector: 'league-team',
    templateUrl: './league-team.component.html',
    standalone: true,
    imports: [CommonModule, MatDialogModule, DynamicHeightDirective],
    providers: [DatePipe, DialogBoxService,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],

})
export class LeagueTeamComponent implements OnInit {
    @Input() outright: Outright
    @Input() request: FilterRequest;

    private readonly runningStatus = "Running";
    constructor(public dialog: MatDialog) { }


    public get leagueMatch() {
        return this.outright?.leagueMatch ?? [];
    }

    public get permission() {
        return this.outright.permission;
    }

    ngOnInit(): void {
    }

    public viewLog(league: LeagueMatch, matchId: number | null = null) {
        this.dialog.open(LogPopupComponent, {
            data: {
                ...this.request,
                leagueId: league.leagueId,
                matchCode: !!matchId ? `${matchId}` : league.teams[0].matchCode,
                matchId
            },
            width: '1000px',
            height: '600px'
        });
    }

    public calculatePopup(league: LeagueMatch) {
        this.dialog.open(CalculatePopupComponent, {
            data: {
                leagueId: league.leagueId,
                sportType: league.teams[0].sportType
            },
            width: '910px',
            height: '550px',
            disableClose: true
        }).afterClosed().subscribe((teams: TeamSettle[]) => {
            if (teams) {
                teams.forEach(team => {
                    league.teams.find(t => _.isEqual(t.orId, team.matchId)).status = team.status;
                });
            }
        });
    }

    public uncalculatePopup(league: LeagueMatch) {
        this.dialog.open(UncalculatePopupComponent, {
            data: {
                leagueId: league.leagueId,
                sportType: league.teams[0].sportType
            },
            width: '770px',
            height: '500px',
            disableClose: true
        }).afterClosed().subscribe((teamIds: string) => {
            if (teamIds) {
                const teams = _.split(teamIds, ',');
                teams.forEach(team => {
                    league.teams.find(t => _.isEqual(t.orId.toString(), team)).status = this.runningStatus;
                });
            }
        });
    }
}
