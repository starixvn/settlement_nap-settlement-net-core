import { Component, OnInit } from '@angular/core';
import { LeagueMatch } from '../../models/league-match.model';

@Component({
    selector: 'page',
    templateUrl: './page.component.html'
})
export class PageComponent implements OnInit {

    leagueMatches: LeagueMatch[] = [];
    
    constructor() { }

    ngOnInit(): void {
    }

}
