import { Component, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { MarkedTicketsModel, ModalDialogMessage } from '../../../shared/models';
import { CalculateAction } from '../../../shared/constants';
import { HedgeMatchDetail, SportTemplate } from '../../../shared/models/sportsbook-sop';
import { RequestService } from '../../services/request.service';
import { MessageBoxService } from '../../../shared/services';
import { Language } from '../../../shared/language';
import { MatchDetail, OtherSportsMatch, QueryMatch } from '../../models';
import { OtherService } from './other.service';
@Component({
    selector: 'other-refund',
    templateUrl: './other-refund.component.html',
})
export class OtherRefundComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public actionName = CalculateAction;
    public matchDetail: MatchDetail;
    public hedgeMatchDetail: HedgeMatchDetail;
    public applyHedgeMatch: boolean;
    public confirmDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public hasRefundFt = false;
    constructor(private readonly requestService: RequestService,
        private readonly messageBoxService: MessageBoxService,
        private readonly toastrService: ToastrService,
        private readonly otherService : OtherService) {
        this.confirmDialogMessage.title = Language.RefundConfirmationBox;
    }

    async getMatch(matchId: number) {
        this.toastrService.overlayContainer = this.toastContainer;
        const query = new QueryMatch(matchId, true);
        const result = await this.requestService.getMatch(query).toPromise() as OtherSportsMatch;
        this.matchDetail = result.match.matchDetail;
        this.hedgeMatchDetail = result.match.hedgeMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail != null;
        this.hasRefundFt = this.otherService.showButtonBySportType(this.matchDetail.sportType);
    }

    public async refund(action: string, isParlay: boolean) {
        this.toastrService.clear();
        const params = {
            matchId: this.matchDetail.matchId,
            action: isParlay ? `MP-${action}` : action,
        };

        const result = await this.requestService.checkMarkedTickets(params).toPromise() as MarkedTicketsModel;
        if (result.isExistMarkedTicket) {
            this.toastrService.error(Language.MarkedTicket);
        } else {
            this.confirmDialogMessage.message = this.otherService.getMessageConfirmRefund(isParlay, action);
            this.messageBoxService.confirm(this.confirmDialogMessage, async () => {
                this.doRefund(action, isParlay);
            });
        }
    }

    private async doRefund(action: string, isParlay: boolean) {
        const response = await this.otherService.sendRequest(this.matchDetail, this.hedgeMatchDetail, action, isParlay);
        if (!response.isSuccessful) {
            this.toastrService.error(response.errMsg);
        } else {
            this.messageBoxService.closePopup();
        }
    }
}