import { GetTicketInfoQuery, Match, ResultDetail, SettleQuery, VoidBetInfo, VoidBetQuery } from '../models';
import { Component, Injector, ViewChild } from '@angular/core';
import { Language } from '../../shared/language.native';
import { MessageBoxService, AioService, BlockUIService } from '../../shared/services';
import { ModalDialogMessage } from '../../shared/models';
import { SportType } from '../../shared/constants';
import { BasketballApiKeys, ResourcesIds } from '../constants';
import * as _ from 'lodash';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { BasketballService, BetStatusService, VerificationService } from '../services';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { MatchDetailComponent } from './match-detail.component';
import { RefundCommonModule } from '../../shared/modules/refund-common.module';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';

@Component({
    selector: 'refund-actions',
    templateUrl: './refund-actions.component.html',
    standalone: true,
    imports: [RefundCommonModule, MatchDetailComponent, ResourceNameByIdPipe],
    providers: [VerificationService, BasketballService, ResourceNameByIdPipe, BetStatusService  ]
})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public blockUI = true;
    public match: Match;
    public originalMatch: Match;
    public matchId: number;
    public resultDetail: ResultDetail[];
    public readonly isReSettledTickets: boolean;
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(
        protected inject: Injector,
        private readonly verificationService: VerificationService,
        private readonly messageBoxService: MessageBoxService,
        protected aioService: AioService,
        protected toastrService: ToastrService,
        private readonly basketballService: BasketballService) {
        super(aioService, toastrService);
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    async getMatch(matchId: number): Promise<void> {
        this.inject.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI  = event);
        const matchQuery = {
            matchId,
            sportType: SportType.basketBall,
            apikey: BasketballApiKeys.normalMatch,
            settleType: "MNL"
        };
        this.toastrService.overlayContainer = this.toastContainer;
        this.match = await this.aioService.getMatch(matchQuery) as Match;
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
            selectedResources: this.selectedResources
        };
        const res = await this.aioService.checkMarkedTickets(paramsCheckRefund);
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
        const result = await this.aioService.push(query);
        if (result.errCode === 0) {
            this.undoVoidBet(getTicketInfos);
            this.refundHedgeMatch(query);
            this.messageBoxService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async getTicketInfo(query: SettleQuery) {
        const getTicketQuery = new GetTicketInfoQuery(query, false);
        return await this.aioService.getTicketInfo(getTicketQuery) as VoidBetInfo[];
    }

    private async undoVoidBet(voidBetInfos: VoidBetInfo[]) {
        if (voidBetInfos.length > 0) {
            const voidBetQuery = new VoidBetQuery(this.matchDetail, false, voidBetInfos);
            await this.aioService.voidBet(voidBetQuery);
        }
    }
}