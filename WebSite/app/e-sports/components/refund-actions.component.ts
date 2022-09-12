import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { MessageBoxService, ClosePopupService, AioService } from '../../shared/services';
import { Result, MarkedTicketsModel, ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language';
import { Match, SettleQuery } from '../models';
import { HedgeMatchDetail, SportTemplate } from '../../shared/models/sportsbook-sop';
import { ApiKeys } from '../constants';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';

@Component({
    selector: 'refund-actions',
    templateUrl: 'refund-actions.component.html',
})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public match: Match;
    public isRefundOldMatch: boolean;
    public oldMatchDetail: HedgeMatchDetail;
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(
        private readonly messageBoxService: MessageBoxService,
        protected toastrService: ToastrService,
        protected aioService: AioService) {
        super(aioService, toastrService);
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    async getMatch(matchId: number): Promise<void> {
        const matchQuery = {
            matchId,
            apikey: ApiKeys.NormalMatch,
            settleType: "MNL"
        };
        this.toastrService.overlayContainer = this.toastContainer;

        this.match = await this.aioService.getMatch(matchQuery).toPromise() as Match;
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.oldMatchDetail = this.match.oldMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail != null;
        this.isRefundOldMatch = this.oldMatchDetail != null;
        this.resultDetails = this.match.resultDetails;
        this.matchDetail = this.match.matchDetail;
        this.permission = this.match.permission;
    }

    public async refund() {
        const paramsCheckingMarkedTickets = this.generateCheckMarkedTicketsQuery();
        const response = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets).toPromise() as MarkedTicketsModel;
        this.toastrService.clear();
        if(this.existResultNotConfirmed()) {
            this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
        } else if (response.isExistMarkedTicket) {
            this.toastrService.error(Language.MarkedTicket);
        } else {
            this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.doRefund();
            });
        }
    }

    private async doRefund() {
        const query = this.generateRefundQuery(ApiKeys.Settle);
        const result = await this.aioService.push(query).toPromise() as Result;
        if (result.errCode === 0) {
            await this.refundHedgeMatch(query);
            await this.refundOldMatch(query);
            this.messageBoxService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    public async refundHedgeMatch(query: SettleQuery) {
        const hedgeMatchId = this.applyHedgeMatch ? this.hedgeMatchDetail.matchId : 0;
        if (hedgeMatchId > 0) {
            query.matchId = hedgeMatchId;
            this.aioService.push(query).toPromise();
        }
    }

    private async refundOldMatch(query: SettleQuery) {
        const oldMatchId = this.isRefundOldMatch ? this.oldMatchDetail.matchId : 0;
        if (oldMatchId > 0) {
            query.matchId = oldMatchId;
            await this.aioService.push(query).toPromise();
        }
    }

    public confirmRefund(hedgeMatchDetail: HedgeMatchDetail, applyHedgeMatch: boolean,
            oldMatchDetail: HedgeMatchDetail = null, applyOldMatch: boolean = null) {
        this.toastrService.clear();
        if (!applyHedgeMatch) {
            hedgeMatchDetail = new HedgeMatchDetail();
        }

        if (!applyOldMatch) {
            oldMatchDetail = new HedgeMatchDetail();
        }
        const resourceIds = _.join(this.selectedResources.map(item => item.resourceId), ',');
        const resultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund);
        if (_.isNil(resultConfirmed)) {
            this.confirmResult(this.selectedResources, this.matchDetail.matchId, resourceIds, hedgeMatchDetail, oldMatchDetail);
        } else {
            this.undoConfirmedResult(this.selectedResources, this.matchDetail.matchId, resourceIds,
                                                hedgeMatchDetail, oldMatchDetail);
        }
    }
}
