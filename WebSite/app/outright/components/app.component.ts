import { CalculatePopupComponent } from './popup/calculate-popup.component';
import { Component, OnInit } from '@angular/core';
import { Outright } from '../models/outright.model';
import { BlockUIService } from '../../shared/services';
import { UncalculatePopupComponent } from './popup/uncalculate-popup.component';
import { FilterRequest } from '../models/filter-request.model';
import { FilterComponent } from './main-page/filter.component';
import { LeagueTeamComponent } from './main-page/league-team.component';
import { CommonModule } from '@angular/common';
import { LogComponent } from './popup/log.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [CommonModule, UncalculatePopupComponent, FilterComponent, LeagueTeamComponent, LogComponent],
    providers: [BlockUIService]
})
export default class AppComponent implements OnInit {
    public blockUI = false;
    public outright: Outright;
    public filterRequest: FilterRequest;

    constructor(private readonly blockUIService: BlockUIService,
    ) { }

    public ngOnInit() {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    }

    public search(outright: Outright) {
        this.outright = outright;
    }

    public getRequest(request: FilterRequest) {
        this.filterRequest = request;
    }
}
