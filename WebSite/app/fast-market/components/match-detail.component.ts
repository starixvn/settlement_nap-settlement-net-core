import { Component, inject, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { MessageBoxService } from '../../shared/services';
import { ModalDialogMessage, AutoSettingMatchQuery, AutoSettingLeagueQuery, Result } from '../../shared/models';
import { UrlHelper } from '../../helper';
import { RequestService } from '../services/request.service';
import { MatchDetail } from '../models';
import { Language, Icon, State } from '../constants';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { AutoSettleType } from '../../shared/constants/auto-settle-type.native';
import { ResourceType } from '../../shared/constants/resource-type.native';

@Component({
    selector: "match-detail",
    templateUrl: "./match-detail.component.html"
})

export class MatchDetailComponent implements OnInit {

    @Input() toastContainer: ToastContainerDirective;
    private readonly fastMarketAutoType = 3;
    private readonly requestService = inject(RequestService);
    private readonly messageBoxService = inject(MessageBoxService);
    private readonly toastService = inject(ToastrService);

    public matchDetail: MatchDetail;
    public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();



    public ngOnInit() {
        const matchId = Number(UrlHelper.getUrlParameter("matchId"));
        this.getMatchDetail(matchId);
        this.toastService.overlayContainer = this.toastContainer;
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
        this.toastService.clear();
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
            .subscribe((response: Result) => { this.processUpdateSettingResult(response); });
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

    public confirmUpdateLeagueRefund() {
        this.toastService.clear();

        const message = Language.updateLeagueRefundConfirmationMessage
            .replace(/EXPECTED_STATE/g, !this.matchDetail.isFMAutoRefundLeague ? 'ON' : 'OFF');

        const dialogModel = {
            title: Language.confirmationBoxTitle,
            message,
            checkboxLabel: 'Also apply to Running matches',
            requireCheckbox: true
        } as ModalDialogMessage;

        this.messageBoxService.confirm(dialogModel, (isChecked) => this.updateLeagueRefund(isChecked))

    }

    private updateLeagueRefund(isApplyAll: boolean) {
        const query = this.getLeagueRefundQuery(isApplyAll);

        this.requestService
            .updateAutoSettle(query)
            .subscribe((response: Result) => { this.processUpdateSettingResult(response); });
    }

    private getLeagueRefundQuery(isApplyAll: boolean) {
        const { matchId, leagueId } = this.matchDetail;
        const isCurrentlyEnabled = this.matchDetail.isFMAutoRefundLeague;
        
        const createSetting = (enabled: boolean) => ({
            settleType: AutoSettleType.AutoRefundFM,
            enabled,
            resourceType: ResourceType.Main,
            isApplyChildMatches: isApplyAll,
            waitingTime: 5
        });
        
        return {
            matchId,
            leagueId,
            typeObject: "League",
            isApplyAll,
            resultSettings: [createSetting(!isCurrentlyEnabled)],
            oldResultSettings: [createSetting(isCurrentlyEnabled)]
        };
    }



    public confirmUpdateMatchRefund() {
        this.toastService.clear();
        if (!this.matchDetail.autoSettingIcon.disabled) {
            this.warningDialogMessage.title = Language.confirmationBoxTitle;
            const message = Language.updateMatchRefundConfirmationMessage
                .replace(/EXPECTED_STATE/g, !this.matchDetail.isFMAutoRefund ? 'ON' : 'OFF');
            this.warningDialogMessage.message = message;


            this.messageBoxService.confirm(
                this.warningDialogMessage,
                () => this.updateMatchRefund());
        }
    }

    private updateMatchRefund() {
        const query = this.getAutoRefundQuery(this.matchDetail.isFMAutoRefund);

        this.requestService
            .updateAutoSettle(query)
            .subscribe((response: Result) => { this.processUpdateSettingResult(response); });
    }

    private getAutoRefundQuery(isEnabled: boolean) {
        return {
            matchId: this.matchDetail.matchId,
            leagueId: this.matchDetail.leagueId,
            typeObject: "Match",
            resultSettings: [
                {
                    settleType: AutoSettleType.AutoRefundFM,
                    enabled: !isEnabled,
                    resourceType: ResourceType.Main,
                    waitingTime: 5
                }
            ],
            oldResultSettings: [
                {
                    settleType: AutoSettleType.AutoRefundFM,
                    enabled: isEnabled,
                    resourceType: ResourceType.Main,
                    waitingTime: 5
                }
            ]
        }
    }

    private updateLeagueAutoSettle(isApplyAll: boolean) {
        const isEnabled = this.matchDetail.autoSettingIcon.league !== Icon.yes;
        const query = new AutoSettingLeagueQuery(this.matchDetail.leagueId, this.fastMarketAutoType, isEnabled, isApplyAll);
        this.requestService.updateLeagueAutoSettle(query)
            .subscribe((response: Result) => { this.processUpdateSettingResult(response); });
    }

    private processUpdateSettingResult(result: Result) {
        if (result.isSuccessful) {
            this.getMatchDetail(this.matchDetail.matchId);
        } else {
            this.toastService.error(result.errMsg);
        }
    }

    getAutoRefundClass(isEnabled: boolean, disabled: boolean) {
        const icon = isEnabled ? Icon.yes : Icon.no;
        return disabled ? `${icon}-disable` : icon;
    }
}