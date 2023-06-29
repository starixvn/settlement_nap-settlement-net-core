import { GetTicketInfoQuery, Match, VoidBetInfo, VoidBetQuery, CashOutResultRefundQuery } from '../models';
import { Component, ViewChild, inject } from '@angular/core';
import { Language } from '../../shared/language.native';
import { BlockUIService } from '../../shared/services';
import { ModalDialogMessage } from '../../shared/models';
import { BackgroundColor, ScoreSourceType, SettlementStatusId, SportType, TicketStatus, TicketStatusText } from '../../shared/constants';
import { BasketballApiKeys, ResourcesIds } from '../constants';
import * as _ from 'lodash';
import { RefundActionBaseComponent } from '../../shared/components/sportsbook-sop/refund-action-base.component';
import { BasketballService, BetStatusService, VerificationService, CashOutService, GenerateCashOutService } from '../services';
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
    providers: [VerificationService, BasketballService, ResourceNameByIdPipe, BetStatusService, CashOutService, GenerateCashOutService]
})
export class RefundActionsComponent extends RefundActionBaseComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    verificationService = inject(VerificationService);
    basketballService = inject(BasketballService);
    cashOutService = inject(CashOutService);
    blockUIService = inject(BlockUIService);
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
        this.resetHomeAwayAndAddClass(this.resultDetails);
    }
    private resetHomeAwayAndAddClass(resultDetails: ResultDetail[]) {
        resultDetails.forEach((map) => {
            if (!this.permission.isLeader || !map.resultSettingData.isConfirmedRefundSdt) {
                const needReset = this.basketballService.isFinalSdt(map, this.quarterResults) || map.settlementStatusId === SettlementStatusId.Refund || map.settlementStatusId === SettlementStatusId.Running;
                map.homeValue = needReset ? "" : map.homeValue;
                map.awayValue = needReset ? "" : map.awayValue;
            }
            map.className = this.basketballService.getIntervalBackground(map.settlementStatusId);
        });
    }

    async refund() {
        this.toastrService.clear();
        if (this.isInputScoreEmpty()) {
            this.toastrService.error(Language.warningInputScore);
            return;
        }

        const isPinGoal = this.verificationService.isPinGoalMatch(this.matchDetail.leagueGroupId);
        if (!isPinGoal && this.existResultNotConfirmed()) {
            this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
            return;
        }

        if (!isPinGoal && (this.isSDTSettle ? this.existResultNotConfirmedSdt() : this.existResultNotConfirmedNormal())) {
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
            this.confirmationDialogMessage.message = this.isSDTSettle ? Language.RefundConfirmSdtMessage : Language.RefundConfirmMessage;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.doRefund();
            });
        }
    }

    private isInputScoreEmpty(): boolean {
        const selectedResources = this.selectedResources;
        return this.isSDTSettle && (_.isEmpty(selectedResources[0].awayValue) || _.isEmpty(selectedResources[0].homeValue));
    }

    private async doRefund() {
        const query = this.generateRefundQuery(BasketballApiKeys.settle);
        const getTicketInfos = await this.getTicketInfo(query, query.determinedType);
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

    private async getTicketInfo(query: SettleQuery, determinedType: number) {
        const getTicketQuery = new GetTicketInfoQuery(query.matchId, query.selectedResources.map(item => item.resourceId), false, determinedType);
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
            let betStatus = "";

            if (this.isSDTSettle) {
                half = this.cashOutService.getHalfForSettleDetermined(this.matchDetail.betStatus, resource);
                betStatus = this.cashOutService.getBetStatusForSettleDetermined(this.matchDetail.betStatus, resource);
            } else {
                half = this.cashOutService.getHalf(this.matchDetail.betStatus, resource);
                betStatus = this.cashOutService.getBetStatus(this.matchDetail.betStatus, resource);
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
        resultDetail.className = this.inputClass(resultDetail);
    }

    inputDirectly() {
        let isDisable = false;
        if (this.isDirectly) {
            isDisable = true;
        }
        this.isIgnoreForMatch3x3 = isDisable ? this.isIgnoreForMatch3x3 : false;
        this.resultDetails.forEach((resultDetail, i) => {
            this.resultDetailDisableInput[i] = !this.isEnableResult(resultDetail);
        });

        this.quarterResults.forEach(result => {
            result.checked = false;
            result.disabled = isDisable;
        });

        this.selectFullTimeCheckBox();
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

    private inputClass(resultDetail: ResultDetail) {
        if ((!resultDetail.resultSettingData.isConfirmedRefund && !resultDetail.resultSettingData.isConfirmedRefundSdt) ||
            _.isEmpty(resultDetail.awayValue) || _.isEmpty(resultDetail.homeValue)) {
            return this.basketballService.getIntervalBackground(resultDetail.settlementStatusId);
        }
        const externalResource = this.resourceConfirmedSdt.find(r => r.resourceId === resultDetail.resourceId);
        if (externalResource) {
            return _.isEqual(resultDetail.awayValue, externalResource.awayValue)
                && _.isEqual(resultDetail.homeValue, externalResource.homeValue)
                ? this.basketballService.getIntervalBackground(resultDetail.settlementStatusId) : BackgroundColor.scoreSdtNotConsistent;
        }
        return BackgroundColor.scoreSdtNotConsistent;
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