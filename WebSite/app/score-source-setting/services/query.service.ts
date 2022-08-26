import { Injectable } from "@angular/core";
import { GetOutsideSourceQuery, OutsideSource, UpdateLeagueSourceQuery, GetProviderQuery, UpdateProviderQuery } from "../models";
import { HttpRequestService } from "../../shared/services";

@Injectable()
export class QueryService {
    private settingApi = 'api/setting';
    constructor(private readonly httpRequestService: HttpRequestService) {}

    public getScoreSourcePermission() {
        return this.httpRequestService.getJson(`${this.settingApi}/get-score-source-permission`);
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