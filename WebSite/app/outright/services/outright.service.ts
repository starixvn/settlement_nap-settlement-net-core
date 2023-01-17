import { Injectable } from "@angular/core";
import { League, LeagueSettle } from "../models";
import { LeagueRequest } from "../models/league-request.model";
import { HttpRequestService } from "../../shared/services";
import { firstValueFrom, Observable } from 'rxjs';
import { Result } from "../../shared/models";
import { FilterRequest } from "../models/filter-request.model";
import { Outright } from "../models/outright.model";

@Injectable()
export class OutrightService {
    private outrightApi = "api/outright";

    constructor(private httpRequestService: HttpRequestService) { }


    public getLeagues(request: LeagueRequest) {
        return this.httpRequestService.postJson<League[]>(request, `${this.outrightApi}/get-league`);
    }

    public getFilterView() {
        return this.httpRequestService.getJson(`${this.outrightApi}/get-filter-view`);
    }


    public filter(request: FilterRequest){
        return this.httpRequestService.postJson<Outright>(request,`${this.outrightApi}/filter`)
    }

    public getMatches(leagueId: number, statusId: number) {
        const query = {
            leagueId,
            statusId
        }
        const response = this.httpRequestService.postJson<LeagueSettle>(query, `${this.outrightApi}/get-league-info`);
        return firstValueFrom(response);
    }

    public uncalculate(matchIds: string, teamIds: string) {
        const query = {
            matchIds,
            teamIds
        }
        const response = this.httpRequestService.postJson<Result>(query, `${this.outrightApi}/uncalculate`);
        return firstValueFrom(response);
    }
}