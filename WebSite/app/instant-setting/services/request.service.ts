import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { HttpRequestService } from '../../shared/services';
import { Observable, firstValueFrom } from 'rxjs';
import { TimeSettingQuery, GetRemarkQuery, ChangeSettingQuery, RemarkAndPermission } from '../models';
import { AutoSettingLeagueQuery, AutoSettingMatchQuery, Result } from '../../shared/models';
import { SettingType } from '../constants';
import { LeagueSettings, ProviderSource, ResultSettings } from '../models/league-settings.model';

@Injectable()
export class RequestService {
    private settingApi = '/api/setting';
    private leagueSettingApi = '/api/league-settings'
    constructor(private readonly httpRequestService: HttpRequestService) {
    }

    public getRemarkInfo(matchId: string) {
        const query: GetRemarkQuery = {
            matchId
        };
        return this.httpRequestService.postJson(query, `${this.settingApi}/get-remark-info`);
    }

    public changeSetting(param: ChangeSettingQuery): Observable<RemarkAndPermission> {
        if (_.isEqual(param.type, SettingType.pending)) {
            return this.httpRequestService.postJson(param, `${this.settingApi}/mark-pending`);
        } else {
            return this.httpRequestService.postJson(param, `${this.settingApi}/mark-undecided`);
        }
    }

    public getLeagueName(leagueId: number) {
        return this.httpRequestService.getJson(`${this.settingApi}/get-league-name?leagueId=${leagueId}`);
    }

    public proceed(query: TimeSettingQuery) {
        return this.httpRequestService.postJson(query, `${this.settingApi}/proceed`);
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