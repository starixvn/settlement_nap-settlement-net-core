import { Component, Injector, OnInit } from '@angular/core';
import { Outright } from '../models/outright.model';
import { BlockUIService } from '../../shared/services';
import { FilterRequest } from '../models/filter-request.model';
import { FilterComponent } from './main-page/filter.component';
import { LeagueTeamComponent } from './main-page/league-team.component';
import { CommonModule } from '@angular/common';
import { LogComponent } from './popup/log.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: true,
    imports: [CommonModule, FilterComponent, LeagueTeamComponent, LogComponent],
    providers: [BlockUIService]
})
export default class AppComponent implements OnInit {
    public blockUI = false;
    public outright: Outright;
    public filterRequest: FilterRequest;

    constructor(protected injector: Injector) { }

    public ngOnInit() {
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
    }

    public search(outright: Outright) {
        this.outright = outright;
    }

    public getRequest(request: FilterRequest) {
        this.filterRequest = request;
    }
}
