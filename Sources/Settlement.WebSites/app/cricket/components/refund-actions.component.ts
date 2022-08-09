import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { MessageBoxService, ClosePopupService, AioService } from '../../shared/services';
import { CalculateAction } from '../../shared/constants';
import { Result, MarkedTicketsModel, ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language';
import {
    SettleQuery, NetPositionQuery,
    ResultCricket, SettleChildMatchQuery, Match
} from '../models';
import { ApiKeys } from '../constants';
import { CricketService } from '../services';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { SportTemplate } from '../../shared/models/sportsbook-sop';

@Component({
    selector: 'refund-actions',
    templateUrl: 'refund-actions.component.html',
})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public match: Match;
    private readonly isReSettledTickets: boolean;
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(
        private readonly messageBoxService: MessageBoxService,
        private readonly cricketService: CricketService,
        protected toastrService: ToastrService,
        protected closePopupService: ClosePopupService,
        protected aioService: AioService) {
        super(closePopupService, aioService, toastrService);
    }

    async getMatch(matchId: number, rootUrl: string): Promise<void> {
        const matchQuery = {
            matchId,
            apikey: ApiKeys.NormalMatch,
            settleType: "MNL"
        };
        this.toastrService.overlayContainer = this.toastContainer;
        this.cricketService.rootUrl = rootUrl;
        this.match = await this.aioService.getMatch(matchQuery).toPromise() as Match;
        this.setMatchInfo();
    }

    private setMatchInfo() {
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail !== null;
        this.resultDetails = this.match.resultDetails;
        this.matchDetail = this.match.matchDetail;
        this.permission = this.match.permission;
    }

    public async refund() {
        this.toastrService.clear();
        const paramsCheckingMarkedTickets = this.generateCheckMarkedTicketsQuery();
        const res = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets).toPromise() as MarkedTicketsModel;
        if (this.existResultNotConfirmed()) {
            this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
        } else if (res.isExistMarkedTicket) {
            this.toastrService.error(Language.MarkedTicket);
        } else {
            this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.doRefund();
            });
        }
    }

    private async doRefund() {
        const selectedResources = this.match.resultDetails.filter((item) => item.checked);
        selectedResources.forEach((item) => {
            item.homeValue = "";
            item.awayValue = "";
        });
        const query = new SettleQuery(this.match.matchDetail.matchId,
            selectedResources,
            CalculateAction.refund,
            this.isReSettledTickets,
            this.match.permission.isLeader);
        const result = await this.aioService.push(query).toPromise() as ResultCricket;
        if (result.isSuccessful) {
            await this.handleChildMatch(result.childMatchIds, query);
            this.handelNetPosition(CalculateAction.refund, result.serviceCommand, query);
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async handelNetPosition(type: string, serviceCommand: string, query: SettleQuery) {
        if (!_.isNil(serviceCommand) && !_.isEmpty(serviceCommand)) {
            const netPositionQuery = new NetPositionQuery(this.match.matchDetail.matchId, type, false, serviceCommand);
            const result = await this.cricketService.netPosition(netPositionQuery).toPromise() as Result;
            if (result.isSuccessful) {
                this.pushHedgeMatch(query);
            } else {
                this.toastrService.error(result.errMsg);
            }
        } else {
            this.pushHedgeMatch(query);
        }
    }
    private async handelNetPositionHedgeMatch(type: string, matchId: number, serviceCommand: string) {
        if (!_.isNil(serviceCommand) && !_.isEmpty(serviceCommand)) {
            const query = new NetPositionQuery(matchId, type, true, serviceCommand);
            await this.cricketService.netPosition(query).toPromise();
        }
    }

    private async pushHedgeMatch(query: SettleQuery) {
        const matchId = query.matchId;
        const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
        if (hedgeMatchId > 0) {
            query.matchId = hedgeMatchId;
            const result = await this.aioService.push(query).toPromise() as Result;
            await this.handelNetPositionHedgeMatch(CalculateAction.refund, hedgeMatchId, result.serviceCommand);
            this.closePopupService.closePopup(matchId);
        } else {
            this.closePopupService.closePopup(matchId);
        }
    }

    private async handleChildMatch(childMatchIds: string, settleQuery: SettleQuery) {
        if (!_.isEmpty(childMatchIds)) {
            const settleChildMatchQuery = new SettleChildMatchQuery(childMatchIds, settleQuery.selectedResources,
                settleQuery.actionName, settleQuery.isReSettledTickets);
            await this.aioService.pushChildMatch(settleChildMatchQuery).toPromise();
        }
    }
}
