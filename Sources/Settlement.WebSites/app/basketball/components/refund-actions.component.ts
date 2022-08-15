import { GetTicketInfoQuery, Match, ResultDetail, SettleQuery, VoidBetInfo, VoidBetQuery } from '../models';
import { Component, ViewChild } from '@angular/core';
import { Language } from '../../shared/language';
import { MessageBoxService, ClosePopupService, AioService } from '../../shared/services';
import { Result, MarkedTicketsModel, ModalDialogMessage } from '../../shared/models';
import { SportType } from '../../shared/constants';
import { BasketballApiKeys, ResourcesIds } from '../constants';
import * as _ from 'lodash';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { BasketballService, VerificationService } from '../services';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';

@Component({
    selector: 'refund-actions',
    templateUrl: './refund-actions.component.html',
})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public match: Match;
    public originalMatch: Match;
    public matchId: number;
    public resultDetail: ResultDetail[];
    public readonly isReSettledTickets: boolean;
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(private readonly verificationService: VerificationService,
        private readonly messageBoxService: MessageBoxService,
        protected closePopupService: ClosePopupService,
        protected aioService: AioService,
        protected toastrService: ToastrService,
        private readonly basketballService: BasketballService) {
        super(closePopupService, aioService, toastrService);
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    async getMatch(matchId: number): Promise<void> {
        const matchQuery = {
            matchId,
            sportType: SportType.basketBall,
            apikey: BasketballApiKeys.normalMatch,
            settleType: "MNL"
        };
        this.toastrService.overlayContainer = this.toastContainer;
        this.match = await this.aioService.getMatch(matchQuery).toPromise() as Match;
        this.originalMatch = _.cloneDeep(this.match);
        this.init();
    }

    public init() {
        this.matchId = this.match.matchDetail.matchId;
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail != null;
        this.resultDetails = this.basketballService.getResultDetail(this.match.resultDetails);
        this.resultDetails = this.resultDetails.filter(item => item.resourceId !== ResourcesIds.ot);
        this.matchDetail = this.match.matchDetail;
        this.permission = this.match.permission;
    }

    public async refund() {
        this.toastrService.clear();
        if (!this.verificationService.isPinGoalMatch(this.matchDetail.leagueGroupId) && this.existResultNotConfirmed()) {
            this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
            return;
        }
        const paramsCheckRefund = {
            matchId: this.matchId,
            selectedResources: this.selectedResources,
            isMergedParlay: true,
        };
        const res = await this.aioService.checkMarkedTickets(paramsCheckRefund).toPromise() as MarkedTicketsModel;
        if (res.isExistMarkedTicket) {
            this.toastrService.error(Language.MarkedTicket);
        } else {
            this.confirmationDialogMessage.message = Language.RefundConfirmMessage;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.doRefund();
            });
        }
    }

    private async doRefund() {
        const query = this.generateRefundQuery(BasketballApiKeys.settle);
        const getTicketInfos = await this.getTicketInfo(query);
        const result = await this.aioService.push(query).toPromise() as Result;
        if (result.errCode === 0) {
            this.undoVoidBet(getTicketInfos);
            this.refundHedgeMatch(query);
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async getTicketInfo(query: SettleQuery) {
        const getTicketQuery = new GetTicketInfoQuery(query, false);
        return await this.aioService.getTicketInfo(getTicketQuery).toPromise() as VoidBetInfo[];
    }

    private async undoVoidBet(voidBetInfos: VoidBetInfo[]) {
        if (voidBetInfos.length > 0) {
            const voidBetQuery = new VoidBetQuery(this.matchDetail, false, voidBetInfos);
            await this.aioService.voidBet(voidBetQuery).toPromise();
        }
    }
}