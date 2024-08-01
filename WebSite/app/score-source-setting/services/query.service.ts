import { Injectable } from "@angular/core";
import { GetOutsideSourceQuery, OutsideSource, UpdateLeagueSourceQuery, GetProviderQuery, UpdateProviderQuery } from "../models";
import { HttpRequestService } from "../../shared/services";
import { firstValueFrom } from 'rxjs';

@Injectable()
export class QueryService {
    private readonly settingApi = '/api/setting';
    constructor(private readonly httpRequestService: HttpRequestService) {}

    public getScoreSourcePermission() {
        const request = this.httpRequestService.getJson<boolean>(`${this.settingApi}/get-score-source-permission`);
        return firstValueFrom(request);
    }

    public getSources(query: GetOutsideSourceQuery) {
        return this.httpRequestService.postJson(query, `${this.settingApi}/get-outside-source`);
    }

    public add(query: OutsideSource) {
        return this.httpRequestService.postJson(query, `${this.settingApi}/add-outside-source`);
    }

    public updateOutsideSource(query: OutsideSource) {
        return this.httpRequestService.postJson(query, `${this.settingApi}/update-outside-source`);
    }

    public updateLeagueSources(query: UpdateLeagueSourceQuery) {
        return this.httpRequestService.postJson(query, `${this.settingApi}/update-league-outside-source`, false);
    }

    public getProviders(query: GetProviderQuery) {
        return this.httpRequestService.postJson(query, `${this.settingApi}/get-provider-source`);
    }

    public updateProvider(query: UpdateProviderQuery) {
        return this.httpRequestService.postJson(query, `${this.settingApi}/update-provider-source`);
    }
}