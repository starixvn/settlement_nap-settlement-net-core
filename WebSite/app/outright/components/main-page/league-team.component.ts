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

@Component({
    selector: 'league-team',
    templateUrl: './league-team.component.html',
    standalone: true,
    imports: [CommonModule, MatDialogModule],
    providers: [DatePipe, DialogBoxService, DynamicHeightDirective,
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

    public viewLog(matchCode: string) {
        this.dialog.open(LogComponent, {
            data: {
                ...this.request,
                matchCode: `${matchCode}`
            },
            width: '1000px'
        });
    }

}
