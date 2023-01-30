import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopupService } from '../../services/popup.service';
import { FilterRequest } from '../../models/filter-request.model';
import { Outright } from '../../models/outright.model';

@Component({
    selector: 'league-team',
    templateUrl: './league-team.component.html'
})
export class LeagueTeamComponent implements OnInit {
    @Input() outright: Outright
    @Input() request: FilterRequest;


    public get leagueMatch() {
        return this.outright?.leagueMatch ?? [];
    }
    constructor(private popupService: PopupService) { }

    ngOnInit(): void {
    }

    public viewLog() {

    }

}
