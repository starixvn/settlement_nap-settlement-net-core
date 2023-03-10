import { MessageBoxService } from './../../services/message-box.service.native';
import { CalculateAction, SettlementStatusId, TicketStatusText } from "../../constants";
import { Language } from "../../language.native";
import { AioService } from "../../services";
import { HedgeMatchDetail, MatchDetail, Permission, ResultDetail, SettleQuery } from "../../models/sportsbook-sop";
import * as _ from "lodash";
import { Component, Injector } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Component({
    template: '',
})
export class RefundActionBaseComponent {
    public aioService: AioService;
    public toastrService: ToastrService;
    public messageBoxService: MessageBoxService;
    public blockUI = true;
    protected aioService: AioService;
    protected toastrService: ToastrService;
    public resultDetails: ResultDetail[];
    public matchDetail: MatchDetail;
    public permission: Permission;
    public hedgeMatchDetail: HedgeMatchDetail;
    public applyHedgeMatch: boolean;

    constructor(protected inject: Injector) {
    }

    public get selectedResources(): ResultDetail[] {
        return this.resultDetails.filter((item) => item.checked);
    }

    protected generateCheckMarkedTicketsQuery() {
        return {
            matchId: this.matchDetail.matchId,
            selectedResources: this.selectedResources
        };
    }

    protected generateRefundQuery(apikey: string) {
        this.selectedResources.forEach((item) => {
            item.homeValue = "";
            item.awayValue = "";
        });
        const betStatus = this.getBetStatus();

        return new SettleQuery(this.matchDetail.matchId,
            this.selectedResources,
            CalculateAction.refund,
            false,
            betStatus,
            apikey);
    }

    public getBetStatus() {
        return "";
    }

    public isConfirmed(resultDetail: ResultDetail) {
        return this.permission.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    }

    public confirmRefund(hedgeMatchDetail: HedgeMatchDetail, applyHedgeMatch: boolean) {
        this.toastrService.clear();
        if (!applyHedgeMatch) {
            hedgeMatchDetail = new HedgeMatchDetail();
        }
        const resourceIds = _.join(this.selectedResources.map(item => item.resourceId), ',');
        const resultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund);
        if (_.isNil(resultConfirmed)) {
            this.confirmResult(this.selectedResources, this.matchDetail.matchId, resourceIds, hedgeMatchDetail);
        } else {
            this.undoConfirmedResult(this.selectedResources, this.matchDetail.matchId, resourceIds, hedgeMatchDetail);
        }
    }

    public undoConfirmedResult(resultDetails: ResultDetail[], matchId: number, resourceIds: string,
        hedgeMatchDetail: HedgeMatchDetail, oldMatchDetail: HedgeMatchDetail = null) {
        const resultNotConfirmed = _.find(resultDetails, item => !item.resultSettingData.isConfirmedRefund);
        if (_.isNil(resultNotConfirmed)) {
            this.aioService.changeConfirmResultSetting(Language.confirmRefund.undoConfirm, matchId, resourceIds, false,
                hedgeMatchDetail, oldMatchDetail);
        } else {
            this.toastrService.error(Language.confirmRefund.differentStates);
        }
    }

    public confirmResult(resultDetails: ResultDetail[], matchId: number, resourceIds: string,
        hedgeMatchDetail: HedgeMatchDetail, oldMatchDetail: HedgeMatchDetail = null) {
        const refundedResultHasNoRunningTicket = _.find(resultDetails, item =>
            item.settlementStatusId === SettlementStatusId.Refund && !_.isEqual(item.ticketStatus, TicketStatusText.running));
        if (_.isNil(refundedResultHasNoRunningTicket)) {
            this.aioService.changeConfirmResultSetting(Language.confirmRefund.confirmRefund, matchId, resourceIds, true,
                hedgeMatchDetail, oldMatchDetail);
        } else {
            this.toastrService.error(Language.confirmRefund.refundedNoRunningTicket);
        }
    }

    public existResultNotConfirmed() {
        const resultNotConfirmed = _.find(this.selectedResources, item => !item.resultSettingData.isConfirmedRefund);
        return !_.isNil(resultNotConfirmed);
    }

    public async refundHedgeMatch(query: SettleQuery) {
        const hedgeMatchId = this.applyHedgeMatch ? this.hedgeMatchDetail.matchId : 0;
        if (hedgeMatchId > 0) {
            query.matchId = hedgeMatchId;
            await this.aioService.push(query);
        } 
    }

    protected cloneResultDetail() {
        this.resultDetails.forEach((map) => {
            if (map.settlementStatusId === SettlementStatusId.Calculated) {
                map.originalHomeValue = _.clone(map.homeValue);
                map.originalAwayValue = _.clone(map.awayValue);
            } else {
                map.originalHomeValue = '0';
                map.originalAwayValue = '0';
            }
        });
    }
}