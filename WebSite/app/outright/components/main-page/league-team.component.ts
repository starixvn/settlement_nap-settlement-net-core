import { CalculatePopupComponent } from './../popup/calculate-popup.component';
import { Component, Input, OnInit } from '@angular/core';
import { FilterRequest } from '../../models/filter-request.model';
import { Outright } from '../../models/outright.model';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbDateParserFormatter, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { DialogBoxService } from '../../../shared/services';
import { DynamicHeightDirective } from '../../../shared/directives';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LogComponent } from '../popup/log.component';
import { LeagueMatch } from '../../models/league-match.model';
import { UncalculatePopupComponent } from '../popup/uncalculate-popup.component';

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

    constructor(
        public dialog: MatDialog,
    ) { }


    public get leagueMatch() {
        return this.outright?.leagueMatch ?? [];
    }

    ngOnInit(): void {
    }

    public viewLog(league: LeagueMatch, matchId: number | null = null) {
        this.dialog.open(LogComponent, {
            data: {
                ...this.request,
                leagueId: league.leagueId,
                matchCode: !!matchId ? `${matchId}` : league.teams[0].matchCode,
            },
            width: '1000px',
            height: '550px'
        });
    }

    public calculatePopup(league: LeagueMatch) {
        this.dialog.open(CalculatePopupComponent, {
            data: {
                leagueId: league.leagueId,
                sportType: league.teams[0].sportType
            },
            width: '910px',
            height: '550px'
        });
    }

    public uncalculatePopup(league: LeagueMatch) {
        this.dialog.open(UncalculatePopupComponent, {
            data: {
                leagueId: league.leagueId,
                sportType: league.teams[0].sportType
            },
            width: '770px',
            height: '500px'
        });
    }
}
