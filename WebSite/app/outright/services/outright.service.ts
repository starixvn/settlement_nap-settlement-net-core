import { Injectable } from "@angular/core";
import { League } from "../models";
import { LeagueRequest } from "../models/league-request.model";
import { HttpRequestService } from "../../shared/services";
import { Observable } from "rxjs";
import { Outright } from "../models/outright.model";
import { FilterRequest } from "../models/filter-request.model";

@Injectable()
export class OutrightService {
    private outrightApi = "api/outright";
    private settingApi = "";

    constructor(private httpRequestService: HttpRequestService) {}


    public getLeagues(request: LeagueRequest) {
        return this.httpRequestService.postJson<League[]>(request,`${this.outrightApi}/get-league`);
    }

    public getFilterView() {
        return this.httpRequestService.getJson(`${this.outrightApi}/get-filter-view`);
    }


    public filter(request: FilterRequest): Observable<Outright> {
        return this.httpRequestService.postJson<Outright>(request,`${this.outrightApi}/filter`)
    }
}