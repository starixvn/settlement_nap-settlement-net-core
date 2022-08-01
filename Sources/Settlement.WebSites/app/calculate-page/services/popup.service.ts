import { Injectable } from '@angular/core';
import { DialogBoxService } from './../../shared/services';
import { DialogDataIframe, Match } from './../../shared/models';
import { Language } from './../../shared/language';
import * as _ from 'lodash';
import { CalculationStatus, EventStatus } from '../../shared/constants';
import { HandleActionsService } from './handle-actions.service';
import { RequestService } from './request.service';
import { MatchDetail } from '../../fast-market/models';
import { Icon } from '../../fast-market/constants';
import { CalculationMatch, League } from '../models';

@Injectable()
export class PopupService {
    public apiUrl = "";
    constructor(private readonly dialogBoxService: DialogBoxService,
        private readonly handleActionService: HandleActionsService,
        private readonly requestService: RequestService) { }
    public popupLog(matchCode: string, fromDate: string, toDate: string) {
        const src = `home/log?matchCode=${encodeURIComponent(matchCode)}&fromDate=${fromDate}&toDate=${toDate}&isShowMenu=false&productType=ALL`;
        const dialogData = new DialogDataIframe(Language.SettlementLog, src);
        this.dialogBoxService.popup(dialogData, '1011px', '800px');
    }

    public popupChangeRemark(match: Match) {
        const src = `apps/remark-setting?matchId=${match.matchId}&matchCode=${match.matchCode}`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.remarkSettingTitle, frameSrc);
        this.dialogBoxService.popup(dialogData, '500px', '270px').subscribe(() => {
            this.requestService.getRemarkInfo(match.matchId).subscribe((settingResult) => {
                this.handleActionService.handleChangeRemarkSetting(settingResult, match);
            });
        });
    }

    public popupFastMarkets(match: Match) {
        const src = `apps/fast-market?matchId=${match.matchId}`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.FastMarketTile, frameSrc);
        this.dialogBoxService.popup(dialogData, '985px', '921px').subscribe(result => {
            if (result) {
                this.handleChangedMatch(match);
            }

            this.requestService.getMatchDetail(Number(match.matchId)).subscribe((result: MatchDetail) => {
                match.enableFastMarket = _.includes(result.autoSettingIcon.match, Icon.yes)
            });
        });
    }

    public openAndHandlePopup(source: string, title: string, width: string, height: string, match: Match) {
        const frameSrc = encodeURI(source);
        const dialogData = new DialogDataIframe(title, frameSrc);
        this.dialogBoxService.popup(dialogData, width, height).subscribe(result => {
            if (result) {
                this.handleChangedMatch(match);
            }
        });
    }

    public openUpdatePayout(match: CalculationMatch) {
        const currentState = match.autoCalcSetting.isAutoPayoutForMatch ? 1 : match.autoCalcSetting.isDirectPayoutForMatch ? 5 : 0
        const src = `apps/auto-setting-match?matchId=${match.matchId}&currentState=${currentState}&pageType=AutoSettingMatch`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.payout.titlePopup, frameSrc);
        this.dialogBoxService.popupHasResponse(dialogData, '500px', '270px').subscribe(result => {
            if (!_.isUndefined(result)) {
                if (_.isEqual(Number(result), 1)) {
                    match.autoCalcSetting.isAutoPayoutForMatch = true;
                    match.autoCalcSetting.isDirectPayoutForMatch = false;
                } else if (_.isEqual(Number(result), 5)) {
                    match.autoCalcSetting.isAutoPayoutForMatch = false;
                    match.autoCalcSetting.isDirectPayoutForMatch = true;
                } else {
                    match.autoCalcSetting.isAutoPayoutForMatch = false;
                    match.autoCalcSetting.isDirectPayoutForMatch = false;
                }
            }
        }
        );
    }

    public openUpdatePayoutForLeague(league: League) {
        const currentState = league.matches[0].autoCalcSetting.isAutoPayoutForLeague ? 1 : league.matches[0].autoCalcSetting.isDirectPayoutForLeague ? 5 : 0
        const src = `apps/auto-setting-league?leagueId=${league.leagueId}&currentState=${currentState}&pageType=AutoSettingLeague`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.payout.titlePopupForLeague, frameSrc);
        this.dialogBoxService.popupHasResponse(dialogData, '500px', '270px').subscribe(result => {
            if (!_.isUndefined(Number(result))) {
                if (_.isEqual(Number(result), 1)) {
                    league.matches[0].autoCalcSetting.isAutoPayoutForLeague = true;
                    league.matches[0].autoCalcSetting.isDirectPayoutForLeague = false;
                } else if (_.isEqual(Number(result), 5)) {
                    league.matches[0].autoCalcSetting.isAutoPayoutForLeague = false;
                    league.matches[0].autoCalcSetting.isDirectPayoutForLeague = true;
                } else {
                    league.matches[0].autoCalcSetting.isAutoPayoutForLeague = false;
                    league.matches[0].autoCalcSetting.isDirectPayoutForLeague = false;
                }
            }
        }
        );
    }

    public openUpdateTime(league: League, isInstant: boolean) {
        const time = isInstant ? league.matches[0].instantWaitingTime : league.matches[0].directWaitingTime;
        const page = isInstant ? 'InstantTime' : 'DirectTime';
        const src = `apps/change-waiting-time?leagueId=${league.leagueId}&time==${time}&pageType=${page}`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.payout.titlePopupForLeague, frameSrc);
        this.dialogBoxService.popupHasResponse(dialogData, '600px', '310px').subscribe(result => {
            if (!_.isUndefined(result)) {
                if (isInstant) {
                    league.matches[0].instantWaitingTime = Number(result) ?? 0;
                } else {
                    league.matches[0].directWaitingTime = Number(result) ?? 0;
                }
            }
        }
        );
    }

    private handleChangedMatch(match: Match) {
        match.isCalculatingSingle = CalculationStatus.waiting;
        match.showLink = false;
        match.newEventStatus = EventStatus.waiting;
    }
}
