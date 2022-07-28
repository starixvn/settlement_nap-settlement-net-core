import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { MessageBoxService } from '../../shared/services';
import { ModalDialogMessage, AutoSettingMatchQuery, AutoSettingLeagueQuery } from '../../shared/models';
import { UrlHelper } from '../../helper';
import { RequestService } from '../services/request.service';
import { MatchDetail, Result } from '../models';
import { Language, Icon, State } from '../constants';

@Component({
    selector: "match-detail",
    templateUrl: "./match-detail.component.html"
})

export class MatchDetailComponent implements OnInit {
    private readonly fastMarketAutoType = 3;
    public matchDetail: MatchDetail;
    public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();

    constructor(
        private readonly requestService: RequestService,
        private readonly messageBoxService: MessageBoxService) {
    }

    public ngOnInit() {
        const matchId = Number(UrlHelper.getUrlParameter("matchId"));
        this.getMatchDetail(matchId);
    }

    private getMatchDetail(matchId: number) {
        this.requestService.getMatchDetail(matchId).subscribe(
            (matchDetail: MatchDetail) => {
                matchDetail.matchAutoSettingTooltip = this.getAutoSettingTooltip(matchDetail.autoSettingIcon.match);
                matchDetail.leagueAutoSettingTooltip = this.getAutoSettingTooltip(matchDetail.autoSettingIcon.league);
                this.matchDetail = matchDetail;
            });
    }

    private getAutoSettingTooltip(iconClassName: string): string {
        switch (iconClassName) {
            case Icon.yes:
                return Language.disableAutoSettleTooltip;

            case Icon.no:
                return Language.enableAutoSettleTooltip;

            default:
                return '';
        }
    }

    public confirmUpdateMatchAutoSettle() {
        if (!this.matchDetail.autoSettingIcon.disabled) {
            this.warningDialogMessage.title = Language.confirmationBoxTitle;
            this.warningDialogMessage.message = Language.updateMatchConfirmationMessage;
            this.messageBoxService.confirm(this.warningDialogMessage, () => this.updateMatchAutoSettle());
        }
    }

    private updateMatchAutoSettle() {
        const isEnabled = this.matchDetail.autoSettingIcon.match !== Icon.yes;
        const query = new AutoSettingMatchQuery(this.matchDetail.matchId, this.fastMarketAutoType, isEnabled);

        this.requestService.updateMatchAutoSettle(query)
            .subscribe((response: Result) => { this.processUpdateSettingResult(true, response); });
    }

    public confirmUpdateLeagueAutoSettle() {
        if (!this.matchDetail.autoSettingIcon.disabled) {
            const currentState = this.matchDetail.autoSettingIcon.league === Icon.yes ? State.on : State.off;
            const expectedState = currentState === State.on ? State.off : State.on;
            this.warningDialogMessage.title = Language.confirmationBoxTitle;
            this.warningDialogMessage.message = Language.updateLeagueConfirmationMessage
                .replace('CURRENT_STATE', currentState)
                .replace(/EXPECTED_STATE/g, expectedState);
            this.warningDialogMessage.hasActionOnNoBtn = true;

            this.messageBoxService.confirm(
                this.warningDialogMessage,
                () => this.updateLeagueAutoSettle(true),
                () => this.updateLeagueAutoSettle(false));
        }
    }

    private updateLeagueAutoSettle(isApplyAll: boolean) {
        const isEnabled = this.matchDetail.autoSettingIcon.league !== Icon.yes;
        const query = new AutoSettingLeagueQuery(this.matchDetail.leagueId, this.fastMarketAutoType, isEnabled, isApplyAll);
        const changeOnMatch = isApplyAll
            && this.matchDetail.autoSettingIcon.league === this.matchDetail.autoSettingIcon.match;

        this.requestService.updateLeagueAutoSettle(query)
            .subscribe((response: Result) => { this.processUpdateSettingResult(changeOnMatch, response); });
    }

    private processUpdateSettingResult(changeOnMatch: boolean, result: Result) {
        if (result.isSuccessful) {
            this.changeColorOnManualCalculatePage(changeOnMatch);
            this.getMatchDetail(this.matchDetail.matchId);
        } else {
            this.warningDialogMessage.title = Language.alertBoxTitle;
            this.warningDialogMessage.message = result.errMsg;
            this.messageBoxService.alert(this.warningDialogMessage);
        }
    }

    public changeColorOnManualCalculatePage(changeOnMatch: boolean) {
        if (changeOnMatch) {
            const matchInfo = this.matchDetail;
            const autoSettleStatus = !_.includes(matchInfo.autoSettingIcon.match, Icon.yes);
            const key = 'Sportsbook';
            this.changeColorOnParentPage(matchInfo.matchId, autoSettleStatus, key);
        }
    }

    public changeColorOnParentPage(matchId: number, autoSettleStatus: boolean, key: string) {
        window.parent[key].changeColorAutoSettleColumnAfterClosePopup(matchId, autoSettleStatus);
    }
}