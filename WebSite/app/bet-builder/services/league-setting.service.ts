import * as _ from 'lodash';
import { Injectable } from '@angular/core';
import { MessageBoxService } from '../../shared/services';
import { Resources, AutoSettingType } from '../constants';
import { MatchDetail, LeagueMatches } from '../models';
import { ModalDialogMessage, AutoSettingLeagueQuery } from '../../shared/models';
import { RequestService } from './request.service';
@Injectable()
export class LeagueSettingService {
    private readonly modalDialogMessage = new ModalDialogMessage();

    constructor(
        private readonly messageBoxService: MessageBoxService,
        private readonly requestService: RequestService) {
        this.modalDialogMessage.title = "Update Auto Setting";
    }

    public getConfirmMessage(isAuto: boolean) {
        let confirmMessage: string;
        if (isAuto) {
            confirmMessage = Resources.confirmUpdateAutoSettingLeague
                .replace('OLD_VALUE', "ON")
                .replace(/NEW_VALUE/g, "OFF");
        } else {
            confirmMessage = Resources.confirmUpdateAutoSettingLeague
                .replace('OLD_VALUE', "OFF")
                .replace(/NEW_VALUE/g, "ON");
        }

        return confirmMessage;
    }

    public async updateLeague(league: LeagueMatches, isApplyAll: boolean) {
        const query = new AutoSettingLeagueQuery(
            Number(league.leagueId),
            AutoSettingType.BetBuilder,
            !league.isAutoSettingForLeague,
            isApplyAll
        );
        const result = await this.requestService.updateLeague(query).toPromise();
        if (result.isSuccessful) {
            this.reSetMatchOfLeague(league, result.childMatchIds);
        } else {
            this.modalDialogMessage.message = result.errMsg;
            this.messageBoxService.alert(this.modalDialogMessage);
        }
    }

    private reSetMatchOfLeague(league: LeagueMatches, updatedMatchIds: string) {
        const isAuto = !league.isAutoSettingForLeague;
        league.isAutoSettingForLeague = isAuto;

        if (!_.isEmpty(updatedMatchIds)) {
            this.reSetMatch(league.matches, updatedMatchIds, isAuto);
        }
    }

    private reSetMatch(matches: MatchDetail[], updatedMatchIds: string, isAuto: boolean) {
        const matchIds = updatedMatchIds.split(",");
        _.forEach(matches, (match: MatchDetail) => {
            if (matchIds.indexOf(match.matchId.toString()) > -1) {
                match.autoCalcSetting.isAutoSettingForMatch = isAuto;
            }
        });
    }
}