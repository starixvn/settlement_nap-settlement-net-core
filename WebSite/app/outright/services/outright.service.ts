
import { Injectable } from "@angular/core";
import { LeagueSettle, SportLeague, SportLeagueFilter, Team, TeamSettle } from "../models";
import { HttpRequestService } from "../../shared/services";
import { firstValueFrom, Observable } from 'rxjs';
import { FilterRequest, InitFilter, SportLeagueRequest } from "../models/filter-request.model";
import { LogRequest } from "../models/log-request.model";
import { OutrightLog } from "../models/outright-log.model";
import { ResultOutright } from "../../outright/models/result-outright.model";
import { Result } from "../../shared/models";

@Injectable()
export class OutrightService {
    private readonly outrightApi = "/api/outright";

    constructor(private readonly httpRequestService: HttpRequestService) { }

    public getSportLeague(sportLeagueRequest: SportLeagueRequest) {
        const request = this.httpRequestService.postJson<SportLeagueFilter>(sportLeagueRequest, `${this.outrightApi}/get-sport-league`, false);
        return firstValueFrom(request);
    }

    public getFilterView() {
        const request = this.httpRequestService.getJson<InitFilter>(`${this.outrightApi}/get-filter-view`);
        return firstValueFrom(request);
    }


    public filter(filterRequest: FilterRequest) {
        const request =  this.httpRequestService.postJson<SportLeague>(filterRequest, `${this.outrightApi}/filter`);
        return firstValueFrom(request);
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

    public saveScore(teams: Team[]) {
        const query = {
            teams
        }
        const response = this.httpRequestService.postJson<Result>(query, `${this.outrightApi}/save-score`);
        return firstValueFrom(response);
    }

    public getLogs(request: LogRequest): Observable<OutrightLog[]> {
        return this.httpRequestService.postJson<OutrightLog[]>(request, `${this.outrightApi}/get-log`, true)
    }

    public updateDeatHeat(leagueId: number, deadHeat: boolean | null) {
        const updateRequest = {
            leagueId,
            deadHeat
        }
        const request = this.httpRequestService.postJson(updateRequest, `${this.outrightApi}/update-deadheat-setting`, true);
        return firstValueFrom(request);
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