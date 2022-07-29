import { Injectable } from '@angular/core';
import { DialogBoxService } from './../../shared/services';
import { DialogDataIframe, Match } from './../../shared/models';
import { Language } from './../../shared/language';
import * as _ from 'lodash';
import { CalculationStatus, EventStatus } from '../../shared/constants';
import { HandleActionsService } from './handle-actions.service';
import { RequestService } from './request.service';

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

    public openAndHandlePopup(source: string, title: string, width: string, height: string, match: Match) {
        const frameSrc = encodeURI(source);
        const dialogData = new DialogDataIframe(title, frameSrc);
        this.dialogBoxService.popup(dialogData, width, height).subscribe(result => {
            if (result) {
                this.handleChangedMatch(match);
            }
        });
    }

    private handleChangedMatch(match: Match) {
        match.isCalculatingSingle = CalculationStatus.waiting;
        match.showLink = false;
        match.newEventStatus = EventStatus.waiting;
    }
}
