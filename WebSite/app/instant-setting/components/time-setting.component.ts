import { Component, OnInit } from '@angular/core';
import { UrlHelper } from '../../helper';
import * as _ from 'lodash';
import { RequestService } from "../services/request.service";
import { MessageBoxService } from '../../shared/services';
import { ModalDialogMessage, Result } from '../../shared/models';
import { Language } from '../../shared/language';
import { League, TimeSettingQuery } from '../models';
import { AutoType } from '../constants/auto-type';
@Component({
    selector: 'time-setting',
    templateUrl: './time-setting.component.html',
    providers: [RequestService],
})
export class TimeSettingComponent implements OnInit {
    public pageType: string;
    public leagueId: number;
    public time: number;
    public leagueName: string;
    public autoType: number;
    public errorMessage: string;
    private readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public readonly warningDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(
        private readonly requestService: RequestService,
        private readonly messageBoxService: MessageBoxService) {
        this.warningDialogMessage.title = Language.InstantSetting.WarningTitle;
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    public async ngOnInit() {
        this.pageType = UrlHelper.getUrlParameter("pageType");
        this.leagueId = Number(UrlHelper.getUrlParameter("leagueId"));
        this.leagueName = await this.requestService.getLeagueName(this.leagueId).toPromise().then((league: League) => {
            return league.leagueName;
        });

        this.time = Number(UrlHelper.getUrlParameter("time"));
        const autoTypeByUrl = UrlHelper.getUrlParameter("autoType");
        this.autoType = _.isEmpty(autoTypeByUrl) ? this.getAutoType() : Number(autoTypeByUrl);
    }

    public proceed() {
        if (this.verifyTimeSetting()) {
            this.confirmProceed();
        }
    }

    public cancel() {
        this.messageBoxService.closePopupNotChanged();
    }

    private verifyTimeSetting() {
        const minTime = 1;
        const maxTime = 300;
        if (this.time < minTime || this.time > maxTime) {
            this.warningDialogMessage.message = Language.InstantSetting.InvalidTimeSetting;
            this.messageBoxService.alert(this.warningDialogMessage);
            return false;
        }

        return true;
    }

    private confirmProceed() {
        this.confirmationDialogMessage.message = Language.InstantSetting.ConfirmMessageSetting;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            const query = new TimeSettingQuery(this.leagueId, this.time, this.autoType);
            this.requestService.proceed(query).subscribe((result: Result) => {
                if (result.isSuccessful) {
                    parent.document.getElementById('dialog-response').setAttribute('value', query.waitingTime.toString());
                   this.messageBoxService.closePopup();
                } else {
                    this.errorMessage = result.errMsg;
                }
            });
        });
    }

    private getAutoType() {
        return this.pageType === 'DirectTime' ? AutoType.direct : this.pageType === "AutoPayOut"? AutoType.autoPayout :  AutoType.instant;
    }
}