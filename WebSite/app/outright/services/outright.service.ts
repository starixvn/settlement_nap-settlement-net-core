
import { Injectable } from "@angular/core";
import { LeagueSettle, SportLeague, TeamSettle } from "../models";
import { HttpRequestService } from "../../shared/services";
import { firstValueFrom, Observable } from 'rxjs';
import { FilterRequest, InitFilter, SportLeagueRequest } from "../models/filter-request.model";
import { Outright } from "../models/outright.model";
import { LogRequest } from "../models/log-request.model";
import { OutrightLog } from "../models/outright-log.model";
import { ResultOutright } from "../../outright/models/result-outright.model";

@Injectable()
export class OutrightService {
    private outrightApi = "/api/outright";

    constructor(private httpRequestService: HttpRequestService) { }

    public getSportLeague(sportLeagueRequest: SportLeagueRequest) {
        const request = this.httpRequestService.postJson<SportLeague>(sportLeagueRequest, `${this.outrightApi}/get-sport-league`, false);
        return firstValueFrom(request);
    }

    public getFilterView() {
        const request = this.httpRequestService.getJson<InitFilter>(`${this.outrightApi}/get-filter-view`);
        return firstValueFrom(request);
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
        const response = this.httpRequestService.postJson<ResultOutright>(query, `${this.outrightApi}/uncalculate`);
        return firstValueFrom(response);
    }

    public calculate(teams: TeamSettle[], deadHeat: number) {
        const query = {
            teams,
            deadHeat
        }
        const response = this.httpRequestService.postJson<ResultOutright>(query, `${this.outrightApi}/calculate`);
        return firstValueFrom(response);
    }

    public getLogs(request: LogRequest): Observable<OutrightLog[]> {
        return this.httpRequestService.postJson<OutrightLog[]>(request, `${this.outrightApi}/get-log`)
    }

    public checkVoidTickets(orId: number) {
        const response = this.httpRequestService.postJson<boolean>({
            orId
        }, `${this.outrightApi}/check-void-tickets`);

        return firstValueFrom(response);
    }

    public getDeadHeatSetting(leagueId: number) {
        const response = this.httpRequestService.postJson<number | null>({ leagueId }, `${this.outrightApi}/get-deadheat-setting`);
        return firstValueFrom(response);
    }
}