import { Component, inject, Input, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { MessageBoxService } from '../../shared/services';
import { ModalDialogMessage, AutoSettingMatchQuery, AutoSettingLeagueQuery, Result } from '../../shared/models';
import { UrlHelper } from '../../helper';
import { RequestService } from '../services/request.service';
import { MatchDetail } from '../models';
import { Language, Icon, State } from '../constants';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';

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
        if (!this.matchDetail.autoSettingIcon.disabled) {
            const dialogModel = {
                title: Language.confirmationBoxTitle,
                message: Language.updateLeagueRefundConfirmationMessage,
                checkboxLabel: 'Apply to Un-Calculated matches',
                requireCheckbox: true
            } as ModalDialogMessage;
 

            this.messageBoxService.confirm(
                dialogModel,
                () => this.updateLeagueRefund(true),
                () => this.updateLeagueRefund(false));
        }
    }

    private updateLeagueRefund(isApplyAll: boolean) {
        const query = {
            matchId: this.matchDetail.matchId,
            leagueId: this.matchDetail.leagueId,
            typeObject: "League",
            isApplyAll: isApplyAll,
            resultSettings: [
                {
                    settleType: "FMRefund",
                    enable: true,
                    resourceType: "Main",
                    isApplyChildMatches: true,
                }
            ]
        }

        this.requestService
            .updateAutoSettle(query)
            .subscribe((response: Result) => { this.processUpdateSettingResult(response); });
    }

    public confirmUpdateMatchRefund() {
        this.toastService.clear();
        if (!this.matchDetail.autoSettingIcon.disabled) {
            this.warningDialogMessage.title = Language.confirmationBoxTitle;
            this.warningDialogMessage.message = Language.updateMatchRefundConfirmationMessage;


            this.messageBoxService.confirm(
                this.warningDialogMessage,
                () => {},
                () => {});
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
}