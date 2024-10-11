import { MessageBoxService } from './../../services/message-box.service.native';
import { CalculateAction, ResourceIds, SettlementStatusId, SportType } from "../../constants";
import { Language } from "../../language.native";
import { AioService, BlockUIService } from "../../services";
import { ExternalResultDetail, HedgeMatchDetail, MatchDetail, Permission, ResultDetail, SettleQuery } from "../../models/sportsbook-sop";
import * as _ from "lodash";
import { Component, inject } from "@angular/core";
import { ToastrService } from "ngx-toastr";
import { ResourceItem } from '../../models';


type UndoConfirm = {
    resultDetails: ResultDetail[], 
    matchId: number, 
    resourceIds: string,
    hedgeMatchDetail: HedgeMatchDetail, 
    oldMatchDetail?: HedgeMatchDetail | null,
    confirmRefundResources?: ResourceItem[]
}

@Component({
    template: '',
})
export class RefundActionBaseComponent {
    aioService = inject(AioService);
    toastrService = inject(ToastrService);
    messageBoxService = inject(MessageBoxService);
    blockUIService = inject(BlockUIService);
    blockUI = true;
    resultDetails: ResultDetail[];
    matchDetail: MatchDetail;
    permission: Permission;
    hedgeMatchDetail: HedgeMatchDetail;
    applyHedgeMatch: boolean;
    isSDTSettle: boolean;
    isDirectly: boolean;
    isConfirmRefund: boolean;
    resourceConfirmedSdt: ExternalResultDetail[];
    isIgnoreForMatch3x3: boolean;
    readonly supportSdtSettle = [SportType.basketBall];

    get selectedResources(): ResultDetail[] {
        return this.resultDetails.filter((item) => item.checked);
    }

    get HalfAndFullTimeResults() {
        return _.filter(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourceIds.halfTime)
            || _.isEqual(map.resourceId, ResourceIds.fullTime));
    }

    protected generateCheckMarkedTicketsQuery() {
        return {
            matchId: this.matchDetail.matchId,
            selectedResources: this.selectedResources
        };
    }

    protected generateRefundQuery(apikey: string) {
        if (!this.isSDTSettle) {
            this.selectedResources.forEach((item) => {
                item.homeValue = "";
                item.awayValue = "";
            });
        }

        const query = new SettleQuery(this.matchDetail,
            this.selectedResources,
            CalculateAction.refund,
            false,
            "",
            apikey);
        query.determinedType = this.isSDTSettle ? this.aioService.generateDeterminedType(this.resultDetails) : 0;
        query.isDirectly = this.isDirectly;
        return query;
    }

    isConfirmed(resultDetail: ResultDetail) {
        return this.permission.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    }

    confirmRefund(confirmRefundResources?: ResourceItem[]) {
        this.toastrService.clear();
        const hedgeMatchDetail = this.applyHedgeMatch ? this.hedgeMatchDetail : new HedgeMatchDetail();
        if (this.isSDTSettle) {
            this.confirmRefundSdt();
            return;
        }
        const resourceIds = _.join(this.selectedResources.map(item => item.resourceId), ',');
        const resultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund);
        if (_.isNil(resultConfirmed)) {
            this.aioService.changeConfirmResultSetting(
                Language.confirmRefund.confirmRefund,
                this.matchDetail.matchId, 
                resourceIds, 
                true,
                hedgeMatchDetail,
                null,
                confirmRefundResources);
        } else {
            this.undoConfirmedResult({
                resultDetails: this.selectedResources,matchId: 
                this.matchDetail.matchId, 
                resourceIds, 
                hedgeMatchDetail,
                oldMatchDetail: null,
                confirmRefundResources
            });
        }
    }

    undoConfirmedResult(undoConfirm: UndoConfirm) {
        const resultNotConfirmed = _.find(undoConfirm.resultDetails, item => !item.resultSettingData.isConfirmedRefund);
        
        if (_.isNil(resultNotConfirmed)) {
            this.aioService.changeConfirmResultSetting(
                Language.confirmRefund.undoConfirm, 
                undoConfirm.matchId, 
                undoConfirm.resourceIds, 
                false,
                undoConfirm.hedgeMatchDetail, 
                undoConfirm.oldMatchDetail,
                undoConfirm.confirmRefundResources);
        } else {
            this.toastrService.error(Language.confirmRefund.differentStates);
        }
    }

    undoConfirmedAllResult(confirmRefundResources?: ResourceItem[]) {
        this.toastrService.clear();
        const hedgeMatch = this.applyHedgeMatch ? this.hedgeMatchDetail : null;
        const refundNormal = this.resultDetails.filter(item => item.resultSettingData.isConfirmedRefund);
        if (refundNormal.length > 0) {
            const resourceIds = refundNormal.map(resource => resource.resourceId).join(',');
            this.aioService.changeConfirmResultSetting(Language.confirmRefund.undoConfirmAll, this.matchDetail.matchId, resourceIds, false,
                hedgeMatch,null,confirmRefundResources);
        } else {
            const resultConfirmed = this.resultDetails.filter(item => item.resultSettingData.isConfirmedRefundSdt)
            const resourceItems = resultConfirmed.map(item => new ResourceItem(item.resourceId, item.resourceName, item.homeValue, item.awayValue))
            this.aioService.changeConfirmResultSDTSetting(this.matchDetail.matchId, resourceItems, false, hedgeMatch);
        }
    }

    confirmRefundSdt() {
        const selectedResources = this.selectedResources;
        const resultDetails = this.isDirectly ? this.HalfAndFullTimeResults : this.resultDetails
        const firstSelectedResourceIndex = resultDetails.indexOf(selectedResources[0]);
        const hedgeMatch = this.applyHedgeMatch ? this.hedgeMatchDetail : null;
        const isFirstResourceEmpty = _.isEmpty(selectedResources[0].awayValue) || _.isEmpty(selectedResources[0].homeValue);

        if (isFirstResourceEmpty) {
            this.toastrService.error(Language.warningInputScore);
        } else if (this.validateResourceBeforeFirstSelected(firstSelectedResourceIndex, resultDetails)
            || this.validateResourceFrom2nd(firstSelectedResourceIndex, resultDetails)) {
            this.toastrService.error(Language.confirmRefund.sdtErrorMessage);
        } else {
            const resourceItems = selectedResources.map(item => new ResourceItem(item.resourceId, item.resourceName, item.homeValue, item.awayValue))
            this.aioService.changeConfirmResultSDTSetting(this.matchDetail.matchId, resourceItems, true, hedgeMatch, this.isIgnoreForMatch3x3);
        }
    }

    private validateResourceBeforeFirstSelected(firstResourceIndex: number, resultDetails: ResultDetail[]) {
        if (this.isDirectly && this.isIgnoreForMatch3x3) {
            return false;
        }
        const resultDetailBefore = resultDetails.slice(0, firstResourceIndex);
        return resultDetailBefore.some(resource => resource.settlementStatusId !== SettlementStatusId.Calculated);
    }

    private validateResourceFrom2nd(firstResourceIndex: number, resultDetails: ResultDetail[]) {
        const resultDetailAfter = resultDetails.slice(firstResourceIndex + 1);
        const isExistValueNotEmptyAfter = resultDetailAfter.some(resource => !_.isEmpty(resource.awayValue) || !_.isEmpty(resource.homeValue));
        const isExistValueNotCheckedAfter = resultDetailAfter.some(result => {
            if (result.resourceId === ResourceIds.fullTime) {
                return this.isDirectly && !result.checked;
            }
            return !result.checked && !this.isDirectly
        });

        return isExistValueNotCheckedAfter || isExistValueNotEmptyAfter;
    }

    existResultNotConfirmed() {
        if (this.supportSdtSettle.indexOf(this.matchDetail.sportType) > -1) {
            return _.every(this.selectedResources, item => !item.resultSettingData.isConfirmedRefund && !item.resultSettingData.isConfirmedRefundSdt);
        }

        const resultNotConfirmed = _.find(this.selectedResources, item => !item.resultSettingData.isConfirmedRefund);
        return !_.isNil(resultNotConfirmed);
    }

    existResultNotConfirmedSdt() {
        if (this.selectedResources.length !== this.resourceConfirmedSdt.length) {
            return true;
        }
        const resultValueNotConfirmed = !this.selectedResources.every(result => {
            const resource = this.resourceConfirmedSdt.find(x => x.resourceId === result.resourceId);
            return !_.isUndefined(resource) && result.resultSettingData.isConfirmedRefundSdt
                && _.isEqual(result.homeValue, resource.homeValue)
                && _.isEqual(result.awayValue, resource.awayValue)
        });
        return resultValueNotConfirmed;
    }

    existResultNotConfirmedNormal() {
        const resultNotConfirmed = _.find(this.selectedResources, item => !item.resultSettingData.isConfirmedRefund);
        return !_.isNil(resultNotConfirmed);
    }

    async refundHedgeMatch(query: SettleQuery) {
        const hedgeMatchId = this.applyHedgeMatch ? this.hedgeMatchDetail.matchId : 0;
        if (hedgeMatchId > 0) {
            query.matchId = hedgeMatchId;
            await this.aioService.push(query);
        }
    }

    initSDTSettle() {
        const existResultConfirmedSDT = this.resultDetails.some(item => item.resultSettingData.isConfirmedRefundSdt);
        if (existResultConfirmedSDT) {
            return true;
        }

        const resultConfirmNormal = this.resultDetails.some(item => item.resultSettingData.isConfirmedRefund);

        if (resultConfirmNormal) {
            return false;
        }

        return this.resultDetails.some(item => item.settlementStatusId === SettlementStatusId.Calculated);
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