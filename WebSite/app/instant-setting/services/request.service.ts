import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { HttpRequestService } from '../../shared/services';
import { firstValueFrom } from 'rxjs';
import { TimeSettingQuery, GetRemarkQuery, ChangeSettingQuery, RemarkAndPermission, ChangeHoldMatchSettingQuery } from '../models';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, Result } from '../../shared/models';
import { AutoSettings, ProviderSource, ResultSettings } from '../../shared/models/league-settings.model';

@Injectable()
export class RequestService {
    private readonly settingApi = '/api/setting';
    private readonly leagueSettingApi = '/api/league-settings'
    constructor(private readonly httpRequestService: HttpRequestService) {
    }

    public getRemarkInfo(matchId: string) {
        const query: GetRemarkQuery = {
            matchId
        };
        const request = this.httpRequestService.postJson(query, `${this.settingApi}/get-remark-info`);

        return firstValueFrom(request);
    }

    public changeHoldMatchSetting(param: ChangeHoldMatchSettingQuery): Promise<RemarkAndPermission> {
       const request = this.httpRequestService.postJson<RemarkAndPermission>(param, `${this.settingApi}/update-holdmatch-setting`);

       return firstValueFrom(request);
    }

    public getLeagueName(leagueId: number) {
        const request = this.httpRequestService.getJson(`${this.settingApi}/get-league-name?leagueId=${leagueId}`);
        return firstValueFrom(request);
    }

    public proceed(query: TimeSettingQuery) {
        const request = this.httpRequestService.postJson(query, `${this.settingApi}/proceed`);
        return firstValueFrom(request);
    }

    public updateSettingMatch(query: AutoSettingMatchQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.settingApi}/update-setting-match`);
        return firstValueFrom(request);
    }

    public updateSettingLeague(query: AutoSettingLeagueQuery) {
        const request = this.httpRequestService.postJson<Result>(query, `${this.settingApi}/update-setting-league`);
        return firstValueFrom(request);
    }
}