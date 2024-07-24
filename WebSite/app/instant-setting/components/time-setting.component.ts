import { Component, OnInit } from '@angular/core';
import { UrlHelper } from '../../helper';
import * as _ from 'lodash';
import { RequestService } from "../services/request.service";
import { MessageBoxService } from '../../shared/services';
import { ModalDialogMessage, Result } from '../../shared/models';
import { Language } from '../../shared/language.native';
import { League, TimeSettingQuery } from '../models';
import { AutoType } from '../constants/auto-type';
import { OnlyIntegerDirective } from '../../shared/directives';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ZeroFallbackDirective } from '../../shared/directives/zero-fall-back.directive.native';
@Component({
    selector: 'time-setting',
    templateUrl: './time-setting.component.html',
    imports: [ZeroFallbackDirective, OnlyIntegerDirective, FormsModule, CommonModule],
    providers: [RequestService],
    standalone: true,
})
export class TimeSettingComponent implements OnInit {
    pageType: string;
    leagueId: number;
    time: number;
    leagueName: string;
    autoType: number;
    errorMessage: string;
    refundWaitingTime: number
    originalRefundWaitingTime: number;
    originalTime: number;
    private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(
        private readonly requestService: RequestService,
        private readonly messageBoxService: MessageBoxService) {
        this.warningDialogMessage.title = Language.InstantSetting.WarningTitle;
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    async ngOnInit() {
        this.pageType = UrlHelper.getUrlParameter("pageType");
        this.leagueId = Number(UrlHelper.getUrlParameter("leagueId"));
        this.leagueName = await this.requestService.getLeagueName(this.leagueId).then((league: League) => {
            return league.leagueName;
        });

        this.time = this.originalTime =  Number(UrlHelper.getUrlParameter("time"));
        this.refundWaitingTime = this.originalRefundWaitingTime = Number(UrlHelper.getUrlParameter("refundWaitingTime"));
        const autoTypeByUrl = UrlHelper.getUrlParameter("autoType");
        this.autoType = _.isEmpty(autoTypeByUrl) ? this.getAutoType() : Number(autoTypeByUrl);
    }

    cancel() {
        this.messageBoxService.closePopupNotChanged();
    }

     proceed() {
        this.confirmationDialogMessage.message = Language.InstantSetting.ConfirmMessageSetting;
        this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
            await this.updateRefundTime();
            await this.updateTime();
        });
    }

    private getAutoType() {
        return this.pageType === 'DirectTime' ? AutoType.direct : this.pageType === "AutoPayOut" ? AutoType.autoPayout : AutoType.instant;
    }

    private async updateRefundTime() {
        if ((this.autoType === AutoType.autoPayout || this.autoType === AutoType.direct) && this.refundWaitingTime !== this.originalRefundWaitingTime) {
            const query = new TimeSettingQuery(this.leagueId, this.refundWaitingTime, AutoType.refund);
            await this.requestService.proceed(query);
        }
    }

    private async updateTime(){
        const query = new TimeSettingQuery(this.leagueId, this.time, this.autoType);
        this.requestService.proceed(query).then((result: Result) => {
            if (result.isSuccessful) {
                parent.document.getElementById('dialog-response').setAttribute('value', `${query.waitingTime}, ${this.refundWaitingTime}`);
                this.messageBoxService.closePopup();
            } else {
                this.errorMessage = result.errMsg;
            }
        });
    }
}