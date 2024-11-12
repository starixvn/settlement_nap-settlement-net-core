import { inject, Injectable } from "@angular/core";
import { HttpRequestService } from "../../../shared/services";
import {HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {GetAutoSettleSettings, IAutoSettleSettingsResponse} from "./types";
import {AutoSettings} from "../../../shared/models/league-settings.model";

@Injectable()
export class AutoSettleSettingsService {
    private readonly  baseUrl = "/api/auto-settle-settings";
    private  readonly httpRequestService = inject(HttpRequestService);

    public getAutoSetting(query: GetAutoSettleSettings):Observable<IAutoSettleSettingsResponse> {
        const params = new HttpParams()
            .set("leagueId", query.leagueId)
            .set("sportType",query.sportType)
            .set("matchId",query.matchId)
            .set("typeObject",query.typeObject);

        const url = this.baseUrl + '/get-settings?' + params.toString();

       return this.httpRequestService.getJson<IAutoSettleSettingsResponse>(url)
    }

    public updateAutoSetting(command: IAutoSettleSettingsResponse) {
        return this.httpRequestService.postJson(command, `${this.baseUrl}/update-settings`)
    }
}