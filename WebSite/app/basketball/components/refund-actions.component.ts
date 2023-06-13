import { GetTicketInfoQuery, Match, VoidBetInfo, VoidBetQuery, CashOutResultRefundQuery } from '../models';
import { Component, Injector, ViewChild, inject } from '@angular/core';
import { Language } from '../../shared/language.native';
import { BlockUIService } from '../../shared/services';
import { ModalDialogMessage } from '../../shared/models';
import { ScoreSourceType, SettlementStatusId, SportType } from '../../shared/constants';
import { BasketballApiKeys, ResourcesIds } from '../constants';
import * as _ from 'lodash';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { BasketballService, BetStatusService, VerificationService, CashOutService } from '../services';
import { ResultDetail, SettleQuery, SportTemplate } from '../../shared/models/sportsbook-sop';
import { ToastContainerDirective } from 'ngx-toastr';
import { RefundCommonModule } from '../../shared/modules/refund-common.module';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { CalculationMatchDetailComponent } from './calculation-match-detail.component';

@Component({
    selector: 'refund-actions',
    templateUrl: './refund-actions.component.html',
    standalone: true,
    imports: [RefundCommonModule, CalculationMatchDetailComponent, ResourceNameByIdPipe],
    providers: [VerificationService, BasketballService, ResourceNameByIdPipe, BetStatusService, CashOutService]
})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    verificationService = inject(VerificationService);
    basketballService = inject(BasketballService);
    cashOutService = inject(CashOutService);
    blockUIService= inject(BlockUIService);
    blockUI = true;
    match: Match;
    originalMatch: Match;
    matchId: number;
    resultDetailDisableInput: boolean[];
    disableScoreDirect: boolean;
    readonly overTimeId = ResourcesIds.ot;
    readonly isReSettledTickets: boolean;
    readonly confirmationDialogMessage = new ModalDialogMessage(Language.confirmationBox);

    get quarterResults() {
        return _.filter(this.resultDetails, (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.htScore)
            && !_.isEqual(map.resourceId, ResourcesIds.finalScore));
    }

    get overTimeResult() {
        return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.ot));
    }

    get fullTimeResult() {
        return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.finalScore));
    }

    async getMatch(matchId: number): Promise<void> {
        this.blockUIService.blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        const matchQuery = {
            matchId,
            sportType: SportType.basketBall,
            apikey: BasketballApiKeys.normalMatchRefund,
            settleType: "MNL"
        };
        this.toastrService.overlayContainer = this.toastContainer;
        this.match = await this.aioService.getMatch(matchQuery) as Match;
        this.originalMatch = _.cloneDeep(this.match);
        this.init();
    }


    init() {
        this.matchId = this.match.matchDetail.matchId;
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail != null;
        this.resultDetails = this.basketballService.getResultDetail(this.match.resultDetails);
        this.resultDetailDisableInput = new Array(this.resultDetails.length).fill(true);
        this.matchDetail = this.match.matchDetail;
        this.permission = this.match.permission;
        this.resourceConfirmedSdt = this.match.externalResults.find(r => r.sourceId === ScoreSourceType.confirmRefundSource)?.resultDetails ?? [];
        this.basketballService.getResourceExternalRefund(this.permission.isLeader, this.match.externalResults, this.resultDetails);
        this.isConfirmRefund = this.resultDetails.findIndex(result => result.resultSettingData.isConfirmedRefund || result.resultSettingData.isConfirmedRefundSdt) == -1;
        this.isSDTSettle = this.permission.isLeader ? this.initSDTSettle() : false;
        this.disableScoreDirect = this.verificationService.isTicketOnQuarter(this.resultDetails, this.match.resultDetails);
        this.resetHomeAway(this.resultDetails);
    }
    private resetHomeAway(resultDetails: ResultDetail[]) {
        resultDetails.forEach((map) => {
            map.homeValue = map.settlementStatusId === SettlementStatusId.Refund || map.settlementStatusId === SettlementStatusId.Running ? "" : map.homeValue;
            map.awayValue = map.settlementStatusId === SettlementStatusId.Refund || map.settlementStatusId === SettlementStatusId.Running ? "" : map.awayValue;
        });
    }

    async refund() {
        this.toastrService.clear();
        if (!this.verificationService.isPinGoalMatch(this.matchDetail.leagueGroupId) && this.existResultNotConfirmed()) {
            this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
            return;
        }

        if (this.isSDTSettle && this.existResultNotConfirmedSdt()) {
            this.toastrService.error(Language.confirmRefund.sdtErrorMessage);
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
            await this.voidBet(getTicketInfos);
            await this.cashOutResultRefund(this.resultDetails);
            await this.refundHedgeMatch(query);
            this.messageBoxService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async getTicketInfo(query: SettleQuery) {
        const getTicketQuery = new GetTicketInfoQuery(query.matchId, query.selectedResources.map(item => item.resourceId), false);
        return await this.cashOutService.getTicketInfo(getTicketQuery) as VoidBetInfo[];
    }

    private async voidBet(voidBetInfos: VoidBetInfo[]) {
        if (voidBetInfos.length > 0) {
            const voidBetQuery = new VoidBetQuery(this.matchDetail, false, voidBetInfos);
            await this.cashOutService.voidBet(voidBetQuery);
        }
    }

    private async cashOutResultRefund(resource: ResultDetail[]) {
        const final = resource.filter((map) => _.isEqual(map.resourceId, ResourcesIds.finalScore) && map.checked);
        const isVirtualMatch = this.verificationService.isPinGoalMatch(this.matchDetail.leagueGroupId) || this.verificationService.isSabaMatch(this.matchDetail.leagueGroupId);
        if (final.length > 0 && !isVirtualMatch && this.matchDetail.parentId === 0) {
            let half = 0;
            let betStatus = "0-0,0-0,0-0,0-0,0-0";
            if (this.cashOutService.isCalcHalftimeWithMatchTwoQuarters(this.matchDetail.betStatus, resource)) {
                betStatus = this.cashOutService.getDirectBetStatusOnRefund(resource);
            } else if (this.cashOutService.isNotCalcHalftimeWithMatchTwoQuarters(resource)) {
                half = 8;
            } else {
                half = this.cashOutService.getHalf(resource);
                betStatus = this.cashOutService.getBetStatus(resource);
            }

            const query = new CashOutResultRefundQuery(this.matchDetail.matchId, betStatus, half);
            await this.cashOutService.refund(query);
        }
    }

    changeScore(resultDetail: ResultDetail) {
        const firstResourceIndex = this.resultDetails.indexOf(resultDetail);
        const resultDetailAfter = this.resultDetails.slice(firstResourceIndex != -1 ? firstResourceIndex + 1 : 0);
        resultDetailAfter.forEach(resource => {
            if (resource.resourceId !== resultDetail.resourceId) {
                resource.awayValue = "";
                resource.homeValue = "";
            }
        });

    }

    inputDirectly() {
        let isDisable = false;
        if (this.isDirectly) {
            isDisable = true;
        }
        this.resultDetails.forEach((resultDetail, i) => {
            this.resultDetailDisableInput[i] = !this.isEnableResult(resultDetail);
        });

        this.quarterResults.forEach(result => {
            result.checked = false;
            result.disabled = isDisable;
        });
    }

    selectFullTimeCheckBox() {
        if (this.isSDTSettle && !this.isDirectly) {
            this.overTimeResult.checked = this.fullTimeResult.checked;
        } else {
            this.overTimeResult.checked = false;
        }
    }

    enableInput(resultDetail: ResultDetail = null, isFullTime: boolean = false) {
        if (_.isNull(resultDetail)) {
            for (let i = 0; i < this.resultDetails.length; i++) {
                this.resultDetailDisableInput[i] = !this.isEnableResult(this.resultDetails[i]);
            }
        } else {
            const resultDetailSelected = isFullTime ? this.fullTimeResult : resultDetail
            this.resultDetailDisableInput[this.resultDetails.indexOf(resultDetailSelected)] = !this.isEnableResult(resultDetailSelected);
        }
    }

    private isEnableResult(resultDetail: ResultDetail) {
        if (resultDetail.resourceId === ResourcesIds.htScore || resultDetail.resourceId === ResourcesIds.finalScore) {
            return this.isSDTSettle && this.isDirectly && resultDetail.checked;
        }

        if (resultDetail.resourceId == this.overTimeId) {
            return this.isSDTSettle && !this.isDirectly && this.overTimeResult.checked;
        }
        return this.isSDTSettle && resultDetail.checked && !this.isDirectly;
    }
}