import { Injectable } from "@angular/core";
import { League, LeagueSettle, TeamSettle } from "../models";
import { LeagueRequest } from "../models/league-request.model";
import { HttpRequestService } from "../../shared/services";
import { firstValueFrom, Observable } from 'rxjs';
import { Result } from "../../shared/models";
import { FilterRequest } from "../models/filter-request.model";
import { Outright } from "../models/outright.model";
import { LogRequest } from "../models/log-request.model";
import { OutrightLog } from "../models/outright-log.model";

@Injectable()
export class OutrightService {
    private outrightApi = "api/outright";
    private settingApi = "";

    constructor(private httpRequestService: HttpRequestService) { }


    public getLeagues(request: LeagueRequest) {
        console.log('request', request);
        return this.httpRequestService.postJson<League[]>(request, `${this.outrightApi}/get-league`);
    }

    public getFilterView() {
        return this.httpRequestService.getJson(`${this.outrightApi}/get-filter-view`);
    }


    public filter(request: FilterRequest) {
        return this.httpRequestService.postJson<Outright>(request, `${this.outrightApi}/filter`)
    }

    public getMatches(leagueId: number, sportType: number, statusId: number) {
        const query = {
            leagueId,
            statusId,
            sportType
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

    public calculate(teams: TeamSettle[], deadHeat: number) {
        const query = {
            teams,
            deadHeat
        }
        const response = this.httpRequestService.postJson<Result>(query, `${this.outrightApi}/calculate`);
        return firstValueFrom(response);
    }

    public getLogs(request: LogRequest): Observable<OutrightLog> {
        return this.httpRequestService.postJson<OutrightLog>(request, `${this.outrightApi}/get-log`)
    }
}