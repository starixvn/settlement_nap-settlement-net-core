import { Injectable } from '@angular/core';
import { MatchDetail } from '../models';
import { MessageBoxService } from '../../shared/services';
import { ModalDialogMessage, AutoSettingMatchQuery } from '../../shared/models';
import { AutoSettingType } from '../constants';
import { RequestService } from './request.service';
@Injectable()
export class MatchSettingService {
    private readonly modalDialogMessage = new ModalDialogMessage();

    constructor(private readonly messageBoxService: MessageBoxService,
        private readonly requestService: RequestService) {
        this.modalDialogMessage.title = "Update Auto Setting";
    }

    public async updateMatch(match: MatchDetail) {
        const query = new AutoSettingMatchQuery(
            Number(match.matchId),
            AutoSettingType.BetBuilder,
            !match.autoCalcSetting.isAutoSettingForMatch
        );

        const result = await this.requestService.updateMatch(query).toPromise();
        if (result.isSuccessful) {
            match.autoCalcSetting.isAutoSettingForMatch = !match.autoCalcSetting.isAutoSettingForMatch;
        } else {
            this.modalDialogMessage.message = result.errMsg;
            this.messageBoxService.alert(this.modalDialogMessage);
        }
    }
}

