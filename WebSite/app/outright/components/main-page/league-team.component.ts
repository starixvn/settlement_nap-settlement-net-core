import { Component, Input, OnInit } from '@angular/core';
import { FilterRequest } from '../../models/filter-request.model';
import { Outright } from '../../models/outright.model';
import { CommonModule, DatePipe } from '@angular/common';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomNgbDateParserFormatter } from '../../../shared/components/date-picker/custom-ngb-date-parser-formatter';
import { DialogBoxService } from '../../../shared/services';
import { DynamicHeightDirective } from '../../../shared/directives';

@Component({
    selector: 'league-team',
    templateUrl: './league-team.component.html',
    standalone: true,
    imports: [CommonModule,],
    providers: [DatePipe, DialogBoxService, DynamicHeightDirective,
        { provide: NgbDateParserFormatter, useFactory: () => new CustomNgbDateParserFormatter('MMM dd, y') }],

})
export class LeagueTeamComponent implements OnInit {
    @Input() outright: Outright
    @Input() request: FilterRequest;


    public get leagueMatch() {
        return this.outright?.leagueMatch ?? [];
    }
    constructor() { }

    ngOnInit(): void {
    }

    public viewLog() {
        console.log(this.request);

    }

}
