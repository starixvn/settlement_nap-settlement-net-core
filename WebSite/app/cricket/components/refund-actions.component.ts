
import { Component, ViewChild, Injector } from '@angular/core';
import { ToastContainerDirective } from 'ngx-toastr';
import * as _ from 'lodash';
import { MessageBoxService, BlockUIService } from '../../shared/services';
import { CalculateAction } from '../../shared/constants';
import { MarkedTicketsModel, ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language.native';
import { SettleQuery, SettleChildMatchQuery, Match
} from '../models';
import { ApiKeys } from '../constants';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { SportTemplate } from '../../shared/models/sportsbook-sop';
import { RefundCommonModule } from '../../shared/modules/refund-common.module';
import { ResultNameByIdPipe } from '../pipes';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { MatchDetailComponent } from './match-detail.component';

@Component({
    selector: 'refund-actions',
    templateUrl: 'refund-actions.component.html',
    standalone: true,
    imports: [RefundCommonModule, MatchDetailComponent, ResultNameByIdPipe, IntervalBackgroundPipe],
    providers: [ResultNameByIdPipe]
})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public match: Match;
    private readonly isReSettledTickets: boolean;
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    constructor(protected injector: Injector) {
        super(injector);
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    async getMatch(matchId: number): Promise<void> {
        this.initService();
        const matchQuery = {
            matchId,
            apikey: ApiKeys.NormalMatch,
            settleType: "MNL"
        };
        this.toastrService.overlayContainer = this.toastContainer;
        this.match = await this.aioService.getMatch(matchQuery) as Match;
        this.setMatchInfo();
    }

    private initService(){
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.toastrService.overlayContainer = this.toastContainer;
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
        const res = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets);
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
            this.match.permission.isLeader, false);
        const result = await this.aioService.push(query);
        if (result.isSuccessful) {
            await this.handleChildMatch(query, result.childMatchIds);
            await this.settleHedgeMatch(query);
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async settleHedgeMatch(settleQuery: SettleQuery) {
        const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
        if (hedgeMatchId > 0) {
            settleQuery.matchId = hedgeMatchId;
            settleQuery.isHedgeMatch = true;
            const result = await this.aioService.push(settleQuery);
            if (result.isSuccessful) {
                this.messageBoxService.closePopup();
            } else {
                this.toastrService.error(result.errMsg);
            }
        } else {
            this.messageBoxService.closePopup();
        }
    }

    private async handleChildMatch(settleQuery: SettleQuery, childMatchIds: string) {
        if (!_.isEmpty(childMatchIds)) {
            const settleChildMatchQuery = new SettleChildMatchQuery(childMatchIds, settleQuery.selectedResources,
                settleQuery.actionName, settleQuery.isReSettledTickets);
            await this.aioService.pushChildMatch(settleChildMatchQuery);
        }
    }
}
