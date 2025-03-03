import { Injectable } from '@angular/core';
import { DialogBoxService } from './../../shared/services';
import { DialogDataIframe, Match } from './../../shared/models';
import { Language } from '../../shared/language.native';
import * as _ from 'lodash';
import { CalculationStatus, EventStatus } from '../../shared/constants';
import { HandleActionsService } from './handle-actions.service';
import { RequestService } from './request.service';
import { MatchDetail } from '../../fast-market/models';
import { Icon } from '../../fast-market/constants';
import { CalculationMatch, League } from '../models';
import { HttpParams } from '@angular/common/http';
import { AutoSettleSetting } from '../models/auto-settle-settings';
import { Observable } from 'rxjs';

@Injectable()
export class PopupService {
    constructor(private readonly dialogBoxService: DialogBoxService,
        private readonly handleActionService: HandleActionsService,
        private readonly requestService: RequestService) { }

    public popupLog(matchCode: string, fromDate: string, toDate: string) {
        const src = `/home/log?matchCode=${encodeURIComponent(matchCode)}&fromDate=${fromDate}&toDate=${toDate}&isShowMenu=false&productType=ALL`;
        const dialogData = new DialogDataIframe(Language.SettlementLog, src);
        this.dialogBoxService.popup(dialogData, '1011px', '800px');
    }

    public popupChangeRemark(match: Match) {
        const src = `/apps/remark-setting?matchId=${match.matchId}&matchCode=${match.matchCode}`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.remarkSettingTitle, frameSrc);
        this.dialogBoxService.popup(dialogData, '400px', '270px').subscribe(() => {
            this.requestService.getRemarkInfo(match.matchId).subscribe((settingResult) => {
                this.handleActionService.handleChangeRemarkSetting(settingResult, match);
            });
        });
    }

    public popupFastMarkets(match: Match) {
        const src = `/apps/fast-market?matchId=${match.matchId}`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.FastMarketTile, frameSrc);
        this.dialogBoxService.popup(dialogData, '985px', '925px').subscribe(async result => {
            if (result) {
                this.handleChangedMatch(match);
            }

            const matchDetail = await this.requestService.getMatchDetail(Number(match.matchId)) as MatchDetail;
            match.enableFastMarket = _.includes(matchDetail.autoSettingIcon.match, Icon.yes)
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
        const src = `/apps/auto-setting-match?matchId=${match.matchId}&currentState=${currentState}&pageType=AutoSettingMatch`;
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
        });
    }

    public openUpdatePayoutForLeague(league: League) {
        const currentState = league.autoCalcSetting.isAutoPayoutForLeague ? 1 : league.autoCalcSetting.isDirectPayoutForLeague ? 5 : 0
        const src = `/apps/auto-setting-league?leagueId=${league.leagueId}&currentState=${currentState}&pageType=AutoSettingLeague`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.payout.titlePopupForLeague, frameSrc);
        this.dialogBoxService.popupHasResponse(dialogData, '500px', '270px').subscribe(result => {
            if (!_.isUndefined(result)) {
                const isEnable = Number(result.split(',')[0]);
                if (_.isEqual(isEnable, 1)) {
                    league.autoCalcSetting.isAutoPayoutForLeague = true;
                    league.autoCalcSetting.isDirectPayoutForLeague = false;
                } else if (_.isEqual(isEnable, 5)) {
                    league.autoCalcSetting.isAutoPayoutForLeague = false;
                    league.autoCalcSetting.isDirectPayoutForLeague = true;
                } else {
                    league.autoCalcSetting.isAutoPayoutForLeague = false;
                    league.autoCalcSetting.isDirectPayoutForLeague = false;
                }

                this.handleActionService.updateAutoPayoutForMatch(league, _.isEqual(result.split(',')[1], 'true'));
            }
        });
    }

    openSoccerAutoSettings(league: League, match: CalculationMatch | null = null) : Observable<string> {
        const uriParams = this.getParams(league, match);
        console.log('openSoccerAutoSettings',uriParams.toString());
        const src = `/apps/soccer-auto-setting-league?${uriParams.toString()}`;
        const frameSrc = encodeURI(src);
        const title = match ? Language.payout.titlePopup : Language.payout.titlePopupForLeague;
        const dialogData = new DialogDataIframe(title, frameSrc);
        
        return this.dialogBoxService.popupHasResponse(dialogData, '500px', '270px');
    }


    private getParams(league: League, match: CalculationMatch | null = null) {
        let uriParams = new HttpParams();

        if (match) {
            uriParams = uriParams
                .set('matchId', match.matchId)
                .set('leagueId', league.leagueId)
                .set('isAutoPayoutForMatch', match.autoCalcSetting.isAutoPayoutForMatch)
                .set('isDirectPayoutForMatch', match.autoCalcSetting.isDirectPayoutForMatch)
                .set('enabledAutoRefundMatch', match.enabledAutoRefundMatch || false)
                .set('refundWaitingTimeMatch', match.refundWaitingTimeMatch)
                .set('directWaitingTimeMatch', match.directWaitingTimeMatch)
                .set('typeObject', 'Match').set('pageType', 'SoccerAutoSettings');
        } else {
            uriParams = uriParams
                .set('leagueId', league.leagueId)
                .set('isAutoPayoutForLeague', league.autoCalcSetting.isAutoPayoutForLeague)
                .set('isDirectPayoutForLeague', league.autoCalcSetting.isDirectPayoutForLeague)
                .set('enabledAutoRefund', league.enabledAutoRefund || false)
                .set('refundWaitingTime', league.refundWaitingTime)
                .set('directWaitingTime', league.directWaitingTime)
                .set('typeObject', 'League')
                .set('pageType', 'SoccerAutoSettings');
        }

        // uriParams.set('pageType', 'SoccerAutoSettings');

        return uriParams;
    }

    public openUpdateTime(league: League, isInstant: boolean) {
        const time = isInstant ? league.instantWaitingTime : league.directWaitingTime;
        const refundWaitingTime = league.refundWaitingTime ?? 0;
        const page = isInstant ? 'InstantTime' : 'DirectTime';
        const src = `/apps/change-waiting-time?leagueId=${league.leagueId}&time=${time}&refundWaitingTime=${refundWaitingTime}&pageType=${page}`;
        const frameSrc = encodeURI(src);
        const dialogData = new DialogDataIframe(Language.payout.titlePopupForLeague, frameSrc);
        this.dialogBoxService.popupHasResponse(dialogData, '600px', '310px').subscribe(result => {
            if (!_.isUndefined(result)) {
                const results = result.split(',');
                if (isInstant) {
                    league.instantWaitingTime = Number(results[0]) ?? 0;
                } else {
                    league.directWaitingTime = Number(results[0]) ?? 0;
                    league.refundWaitingTime = Number(results[1]) ?? 0;
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
