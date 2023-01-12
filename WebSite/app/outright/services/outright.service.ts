import { Injectable } from "@angular/core";
import { League } from "../models";
import { LeagueRequest } from "../models/league-request.model";
import { HttpRequestService } from "../../shared/services";

@Injectable()
export class OutrightService {
    private outrightApi = "api/outright";
    private settingApi = "";

    constructor(private httpRequestService: HttpRequestService) {}

    public getSports(params: any) {
        return []
    }

    public getLeagues(request: LeagueRequest) {
        return this.httpRequestService.postJson<League[]>(request,`${this.outrightApi}/get-league`);
    }

    public getFilterView() {
        return this.httpRequestService.getJson(`${this.outrightApi}/get-filter-view`);
    }

    // public getStatus() {
    //     return []
    // }

    public getLeagueMatches() {
        
    }
}