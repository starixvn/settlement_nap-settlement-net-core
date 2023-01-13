import { Component, Input, OnInit } from '@angular/core';
import { Outright } from '../../models/outright.model';

@Component({
    selector: 'league-team',
    templateUrl: './league-team.component.html'
})
export class LeagueTeamComponent implements OnInit {
    @Input() outright: Outright

    public get leagueMatch() {
        console.log(this.outright)
        return this.outright?.leagueMatch ?? [];
    }
    constructor() { }

    ngOnInit(): void {
    }

}
