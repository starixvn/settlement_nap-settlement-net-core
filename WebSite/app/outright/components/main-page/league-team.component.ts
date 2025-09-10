import { UpdateDeadheatSettingComponent } from './../popup/update-deadheat-setting.component';
import { SportLeague } from './../../models/sport-league.model';
import { Team, TeamSettle } from './../../models/team.model';
import { CalculatePopupComponent } from './../popup/calculate-popup.component';
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FilterRequest } from '../../models/filter-request.model';
import { Outright } from '../../models/outright.model';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { DialogBoxService } from '../../../shared/services';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LogPopupComponent } from '../popup/log-popup.component';
import { LeagueMatch } from '../../models/league-match.model';
import { UncalculatePopupComponent } from '../popup/uncalculate-popup.component';
import * as _ from 'lodash';
import { Status } from '../../constants';
import { DeadHeatButton } from '../../constants/deatheat-button';

@Component({
    selector: 'league-team',
    templateUrl: './league-team.component.html',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatDialogModule, MatTooltipModule],
    providers: [DatePipe, DialogBoxService,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],

})
export class LeagueTeamComponent implements OnChanges {
    @Input() outright: Outright
    @Input() request: FilterRequest;

    private readonly runningStatus = "Running";

    private readonly settledStatus = [Status.won, Status.lose, Status.hide];
    constructor(public dialog: MatDialog,
        private readonly cdRef: ChangeDetectorRef) { }

    public get permission() {
        return this.outright.permission;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (!changes.outright.firstChange) {
            this.outright.sportLeague.forEach(sport => {
                sport.leagueMatch.forEach(league => this.checkButtonClass(league));
            });
        }
    }

    collapse(sport: SportLeague) {
        sport.collapsed = !sport.collapsed;
    }

    collapseLeague(leagueMatch: LeagueMatch) {
        leagueMatch.collapsed = !leagueMatch.collapsed;
    }

    changeSettingLeague(leagueMatch: LeagueMatch) {
        this.dialog.open(UpdateDeadheatSettingComponent, {
            data: {
                leagueId: leagueMatch.leagueId,
                deadHeatSetting: leagueMatch.deadHeat,
                sportType: leagueMatch.teams[0].sportType
            },
            width: '525px',
            height: '250px',
            hasBackdrop: true
        }).afterClosed().subscribe(newSetting => {
            if (!_.isUndefined(newSetting)) {
                leagueMatch.deadHeat = newSetting;
                this.checkButtonClass(leagueMatch);
            }
            this.cdRef.markForCheck();
        });
    }

    eventStatusColor(team: Team) {
        if (_.isEqual(team.status.toLocaleLowerCase(), Status.refund)) {
            return "refund";
        }
        if (_.includes(this.settledStatus, team.status.toLocaleLowerCase())) {
            return "calculated";
        }
        return "";
    }

    public viewLog(league: LeagueMatch, matchId: number | null = null) {
        this.dialog.open(LogPopupComponent, {
            data: {
                ...this.request,
                leagueId: league.leagueId,
                matchCode: !!matchId ? `${matchId}` : league.teams[0].matchCode,
                matchId
            },
            width: '1200px',
            height: '650px',
            panelClass: 'log-modalbox',
            hasBackdrop: true
        });
    }

    public calculatePopup(league: LeagueMatch) {
        this.dialog.open(CalculatePopupComponent, {
            data: {
                leagueId: league.leagueId,
                sportType: league.teams[0].sportType,
                eventDate: league.eventDate
            },
            width: '1130px',
            height: '100%',
            disableClose: true,
            hasBackdrop: true
        }).afterClosed().subscribe((teams: TeamSettle[]) => {
            if (teams) {
                teams.forEach(team => {
                    league.teams.find(t => _.isEqual(t.orId, team.matchId)).status = team.status;
                });
                this.checkButtonClass(league);
            }
            this.cdRef.markForCheck();
        });
    }

    public uncalculatePopup(league: LeagueMatch) {
        this.dialog.open(UncalculatePopupComponent, {
            data: {
                leagueId: league.leagueId,
                sportType: league.teams[0].sportType
            },
            width: '800px',
            height: '550px',
            disableClose: true,
            hasBackdrop: true
        }).afterClosed().subscribe((teamIds: string) => {
            if (teamIds) {
                const teams = _.split(teamIds, ',');
                teams.forEach(team => {
                    league.teams.find(t => _.isEqual(t.orId.toString(), team)).status = this.runningStatus;
                });
                this.checkButtonClass(league);
            }
            this.cdRef.markForCheck();
        });
    }

    UpperCaseFirstChar(string: string) {

        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    checkButtonClass(league: LeagueMatch) {
        if (_.isNull(league.deadHeat)) {
            league.deadHeatClass = DeadHeatButton.notSet;
            return;
        }
        league.deadHeatClass = league.deadHeat ? DeadHeatButton.yes : DeadHeatButton.no;
    }
}
