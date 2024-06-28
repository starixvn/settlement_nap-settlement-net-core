import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { HttpRequestService } from '../../shared/services';
import { firstValueFrom } from 'rxjs';
import { TimeSettingQuery, GetRemarkQuery, RemarkAndPermission } from '../models';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, Result } from '../../shared/models';
import { LeagueSettings, ProviderSource, ResultSettings } from '../../shared/models/league-settings.model';

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

    public changeHoldMatchSetting(param: any): Promise<RemarkAndPermission> {
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

    public getLeagueSetting(leagueId: number, sportType: number) {
        const query = {
            leagueId,
            sportType
        }
        const request = this.httpRequestService.postJson<LeagueSettings>(query, `${this.leagueSettingApi}/get-settings`);
        return firstValueFrom(request);
    }

    public updateLeagueSetting(oldSettings: LeagueSettings, newSettings: LeagueSettings, isApplyAll: boolean) {
        this.modifyLeagueSettingsQuery(oldSettings);
        this.modifyLeagueSettingsQuery(newSettings);

        let query = {
            oldSettings,
            newSettings,
            isApplyAll
        }

        const request = this.httpRequestService.postJson<Result>(query, `${this.leagueSettingApi}/update-settings`);
        return firstValueFrom(request);
    }


    private modifyLeagueSettingsQuery(leagueSettings: LeagueSettings) {
        const { providers, ...updatedSettings } = leagueSettings;
        const { mainResultSettings, earlyResultSettings } = updatedSettings;

        const parseAndUpdateProvider = (setting: ResultSettings) => {
            setting.primaryProvider = this.parseProvider(setting.primaryProvider, providers);
            setting.secondaryProvider = this.parseProvider(setting.secondaryProvider, providers);
        };

        parseAndUpdateProvider(mainResultSettings);
        parseAndUpdateProvider(earlyResultSettings);
    }

    private parseProvider(providerNames: string, providers: ProviderSource[]): string {
        let listNames = providerNames.split(', ');
        return providers.filter(p => listNames.indexOf(p.sourceName) !== -1).map(p => p.sourceId).join(',');
    }
}