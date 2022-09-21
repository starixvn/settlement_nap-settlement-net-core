import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { MessageBoxService, ClosePopupService, AioService } from '../../shared/services';
import { CalculateAction } from '../../shared/constants';
import { Result, MarkedTicketsModel, ModalDialogMessage, ResultCommand } from '../../shared/models';
import { Language } from '../../shared/language';
import {
    SettleQuery, NetPositionQuery, SettleChildMatchQuery, Match
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
        protected aioService: AioService) {
        super(aioService, toastrService);
        this.confirmationDialogMessage.title = Language.confirmationBox;
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
        const result = await this.aioService.push(query).toPromise() as Result;
        if (result.isSuccessful) {
            this.handleChildMatch(query, result.childMatchIds);
            this.handelNetPosition(query, result.resultCommand);
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async handelNetPosition(query: SettleQuery, resultCommand: ResultCommand[]) {
        if (!_.isNil(resultCommand) && resultCommand.length > 0) {
            const netPositionQuery = new NetPositionQuery(this.matchDetail.matchId, query.actionName, resultCommand, true);
            const result = await this.cricketService.netPosition(netPositionQuery).toPromise() as Result;
            if (result.isSuccessful) {
                this.settleHedgeMatch(query);
            } else {
                this.toastrService.error(result.errMsg);
            }
        } else {
            this.settleHedgeMatch(query);
        }
    }

    private async settleHedgeMatch(settleQuery: SettleQuery) {
        const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
        if (hedgeMatchId > 0) {
            settleQuery.matchId = hedgeMatchId;
            const result = await this.aioService.push(settleQuery).toPromise() as Result;
            if (result.resultCommand.length > 0) {
                const netPositionQuery = new NetPositionQuery(hedgeMatchId, CalculateAction.unCalculate, result.resultCommand, false);
                const resultHedgeMatch =await this.cricketService.netPosition(netPositionQuery).toPromise() as Result;
                if (resultHedgeMatch.isSuccessful) {
                    this.messageBoxService.closePopup();
                } else {
                    this.toastrService.error(result.errMsg);
                }
            } else {
                this.messageBoxService.closePopup();
            }
        } else {
            this.messageBoxService.closePopup();
        }
    }

    private async handleChildMatch(settleQuery: SettleQuery, childMatchIds: string) {
        if (!_.isEmpty(childMatchIds)) {
            const settleChildMatchQuery = new SettleChildMatchQuery(childMatchIds, settleQuery.selectedResources,
                settleQuery.actionName, settleQuery.isReSettledTickets);
            await this.aioService.pushChildMatch(settleChildMatchQuery).toPromise();
        }
    }
}
