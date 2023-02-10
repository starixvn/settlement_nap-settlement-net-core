import { CommonModule } from "@angular/common";
import { Component, Injector, OnInit } from "@angular/core";
import { Outright } from "../../models/outright.model";
import { BlockUIService } from "../../../shared/services";
import { LogComponent } from "../popup/log.component";
import { FilterComponent } from "./filter.component";
import { LeagueTeamComponent } from "./league-team.component";
import { FilterRequest } from "../../models/filter-request.model";

@Component({
    selector: 'main-page',
    templateUrl: './main-page.component.html',
    standalone: true,
    imports: [CommonModule, FilterComponent, LeagueTeamComponent, LogComponent],
})
export default class MainPageComponent implements OnInit {

    public outright: Outright;
    public filterRequest: FilterRequest;

    constructor(protected injector: Injector) { }
    ngOnInit(): void {
    }
    public search(outright: Outright) {
        this.outright = outright;
    }

    public getRequest(request: FilterRequest) {
        this.filterRequest = request;
    }
}