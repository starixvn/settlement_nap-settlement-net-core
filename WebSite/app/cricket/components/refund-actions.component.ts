
import { Component, ViewChild, Injector, inject } from '@angular/core';
import { ToastContainerDirective } from 'ngx-toastr';
import * as _ from 'lodash';
import { MessageBoxService, BlockUIService } from '../../shared/services';
import { CalculateAction } from '../../shared/constants';
import { MarkedTicketsModel, ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language.native';
import { SettleQuery, SettleChildMatchQuery, Match, UpdateSettlementResultHistoryStatus
} from '../models';
import { ApiKeys } from '../constants';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { ResultDetail, SportTemplate } from '../../shared/models/sportsbook-sop';
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
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage(Language.confirmationBox);
    private resultNameByIdPipe = inject(ResultNameByIdPipe);

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
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
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

        this.setTeamResultSettle(selectedResources);
        
        const query = new SettleQuery(this.match.matchDetail.matchId,
            selectedResources,
            CalculateAction.refund,
            this.isReSettledTickets,
            this.match.permission.isLeader, false);
        const result = await this.aioService.push(query);
        if (!result.isSuccessful) {
            this.toastrService.error(result.errMsg);
            return;
        }

        await this.handleChildMatch(query, result.childMatchIds,result.settledSessionId);
        const resultSettleHedge =  await this.settleHedgeMatch(query);
       
        result.hasResultAmendment && await this.handleUpdateSettlementResultHistoryStatus(query,result.settledSessionId);
       
        if (!_.isEmpty(resultSettleHedge)) {
            this.toastrService.error(result.errMsg);
            return;
        }
        this.messageBoxService.closePopup();
    }

    private setTeamResultSettle(resultDetails: ResultDetail[]) {
        resultDetails.forEach(result => {
            result.homeId = `${this.match.matchDetail.homeId}`;
            result.awayId = `${this.match.matchDetail.awayId}`;
        });
      }

    private async settleHedgeMatch(settleQuery: SettleQuery) {
        const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
        let errMsg = "";
        if (hedgeMatchId > 0) {
            settleQuery.matchId = hedgeMatchId;
            settleQuery.isHedgeMatch = true;
            const result = await this.aioService.push(settleQuery);
            if (!result.isSuccessful) {
                errMsg = result.errMsg
            }
        }

        return errMsg;
    }

    private async handleChildMatch(settleQuery: SettleQuery, childMatchIds: string,parentSessionId: string) {
        if (!_.isEmpty(childMatchIds)) {
            const settleChildMatchQuery = new SettleChildMatchQuery(childMatchIds, settleQuery.selectedResources,
                settleQuery.actionName, settleQuery.isReSettledTickets);

                settleChildMatchQuery.sportType = settleQuery.sportType;
                settleChildMatchQuery.parentSessionId = parentSessionId;

                await this.aioService.pushChildMatch(settleChildMatchQuery);
        }
    }

    private async handleUpdateSettlementResultHistoryStatus(settleQuery: SettleQuery,sessionId: string) {
        const query = new UpdateSettlementResultHistoryStatus(settleQuery.matchId,sessionId)
        await this.aioService.updateSettlementResultHistoryStatus(query);
      }

    public get confirmRefundResources() {
        return this.selectedResources.map((x) => ({...x,resourceName: this.resultNameByIdPipe.transform(x.resourceId,this.matchDetail)}))
      }
}