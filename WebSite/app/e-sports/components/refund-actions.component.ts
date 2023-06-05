import { RefundCommonModule } from './../../shared/modules/refund-common.module';
import { Component, ViewChild, Injector } from '@angular/core';
import { ToastContainerDirective } from 'ngx-toastr';
import * as _ from 'lodash';
import { BlockUIService } from '../../shared/services';
import { ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language.native';
import { Match  } from '../models';
import { HedgeMatchDetail, SettleQuery, SportTemplate } from '../../shared/models/sportsbook-sop';
import { ApiKeys } from '../constants';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { MatchDetailComponent } from './match-detail.component';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { VerificationBaseService } from '../../core/services/verification-base.service';

@Component({
    selector: 'refund-actions',
    templateUrl: 'refund-actions.component.html',
    standalone: true,
    imports: [RefundCommonModule, MatchDetailComponent, ResourceNameByIdPipe],
    providers: [VerificationBaseService]
})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public blockUI = true;
    public match: Match;
    public isRefundOldMatch: boolean;
    public oldMatchDetail: HedgeMatchDetail;
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    private readonly leaguePinGoal = 151;
    constructor(
        protected inject: Injector) {
        super(inject);
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
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.oldMatchDetail = this.match.oldMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail != null;
        this.isRefundOldMatch = this.oldMatchDetail != null;
        this.resultDetails = this.match.resultDetails;
        this.matchDetail = this.match.matchDetail;
        this.permission = this.match.permission;
    }

    public initService(){
        this.inject.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.toastrService.overlayContainer = this.toastContainer;
    }

    public async refund() {
        const paramsCheckingMarkedTickets = this.generateCheckMarkedTicketsQuery();
        const response = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets);
        this.toastrService.clear();
        if (this.matchDetail.leagueGroupId != this.leaguePinGoal && this.existResultNotConfirmed()) {
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
        const result = await this.aioService.push(query);
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
            this.aioService.push(query);
        }
    }

    private async refundOldMatch(query: SettleQuery) {
        const oldMatchId = this.isRefundOldMatch ? this.oldMatchDetail.matchId : 0;
        if (oldMatchId > 0) {
            query.matchId = oldMatchId;
            await this.aioService.push(query);
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
