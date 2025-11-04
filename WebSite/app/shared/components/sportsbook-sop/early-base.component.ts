import * as _ from 'lodash';
import { Component, Injector } from '@angular/core';
import { ResultDetail, GroupMap, Permission, SaveScoreQuery, MatchDetail, ExternalResult, ExternalResultDetail } from '../../models/sportsbook-sop';
import { ItemsSelect, ModalDialogMessage, MultipleSelect, ResultSettingQuery } from '../../models';
import { BackgroundColor, CalculateAction, ResultSettingType, ResultStatusId, ScoreSourceType, SettlementStatusId, TicketStatusText } from '../../constants';
import { AioService, MessageBoxService } from '../../services';
import { VerificationBaseService } from '../../../core/services/verification-base.service';
import { Language } from '../../language.native';
import { ToastrService } from 'ngx-toastr';

@Component({
    template: '',
})
export class EarlyBaseComponent {
    public messageBoxService: MessageBoxService;
    public aioService: AioService;
    public toastrService: ToastrService;
    public blockUI = true;
    public matchId: number;
    public resultDetails: ResultDetail[];
    public groupMap: GroupMap[];
    public permission: Permission;
    public isDisabledCalculate = true;
    public isDisabledUnCalculate = true;
    public isDisabledSaveScore = true;
    public ticketsStatusSelect = new MultipleSelect();
    public resultStatusSelect = new MultipleSelect();
    public resultTypeSelect = new MultipleSelect();
    public ticketStatusSelected: string;
    public resultStatusSelected: string;
    public resultTypeSelected: string;
    public isReSettledTickets: boolean;
    public matchDetail: MatchDetail;
    public isShowRefundButton = false;
    public isRefundWithSettleDetermined = false;
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();

    constructor(protected injector: Injector,
        protected verificationBaseService: VerificationBaseService) {
        this.confirmationDialogMessage.title = Language.confirmationBox;
        this.aioService = this.injector.get(AioService);
        this.toastrService = this.injector.get(ToastrService);
        this.messageBoxService = this.injector.get(MessageBoxService);

    }

    public get selectedResources(): ResultDetail[] {
        return _.filter(this.resultDetails, (map: ResultDetail) => map.checked);
    }

    public onChangeBetType(item: ResultDetail, map: GroupMap) {
        item.isResultWarning = false;
        map.checked = map.resultDetail.every((resultItem) => {
            if (resultItem.isShow) {
                return resultItem.checked;
            }
            return true;
        });

        this.calculateAndUnCalculateButton();
    }

    public onChangeGroupMap(map: GroupMap) {
        map.resultDetail.forEach((item) => {
            if (item.isShow) {
                item.checked = item.resultSettingData.isHoldResult ? false : map.checked;
                item.isResultWarning = false;
            }
        });

        this.calculateAndUnCalculateButton();
    }

    public calculateAndUnCalculateButton() {
        const selectedItem = this.resultDetails.filter((x: ResultDetail) => x.checked).length > 0;
        this.isDisabledCalculate = !selectedItem;
        this.isDisabledUnCalculate = !selectedItem;
        this.isDisabledSaveScore = !selectedItem;
    }

    public onSelectTicketsStatus(value: ItemsSelect[]) {
        this.ticketStatusSelected = this.joinSelectedValues(value);
        this.autoUncheckAfterFilter();
    }

    public onSelectResultsStatus(value: ItemsSelect[]) {
        this.resultStatusSelected = this.joinSelectedValues(value);
        this.autoUncheckAfterFilter();
    }

    public onSelectResultType(value: ItemsSelect[]) {
        this.resultTypeSelected = this.joinSelectedValues(value);
        this.autoUncheckAfterFilter();
    }

    private joinSelectedValues(value: ItemsSelect[]): string {
        return value.length > 0 ? value.map(item => item.value).join() : "";
    }

    public autoUncheckAfterFilter() {
        this.resultDetails.forEach((map) => {
            map.checked = false;
        });
        this.groupMap.forEach(map => {
            map.checked = false;
        });

        this.calculateAndUnCalculateButton();
    }

    public isCompleted(resultStatusId: number, settlementStatusId: number) {
        return resultStatusId === ResultStatusId.AutoCompleted
            || (resultStatusId === ResultStatusId.ManualCompleted
                && settlementStatusId === SettlementStatusId.Calculated);
    }

    public isRefunded(resultStatusId: number, settlementStatusId: number) {
        return resultStatusId === ResultStatusId.ManualCompleted && (settlementStatusId === SettlementStatusId.Refund || settlementStatusId === SettlementStatusId.RefundSettleDetermined);
    }

    public onCollapsedClick(map: GroupMap) {
        map.collapsed = !map.collapsed;
    }

    public getResultSettingIcon(holdResult: boolean) {
        if (this.hasModificationPermissions()) {
            return holdResult ? 'icon-yes' : 'icon-no';
        } else {
            return holdResult ? BackgroundColor.iconAutoDisabled : BackgroundColor.iconNoDisabled;
        }
    }

    private hasModificationPermissions(): boolean {
        return this.permission.canCalculate || this.permission.canUncalculate || this.permission.canRefund;
    }

    public onResettleCheckboxChange(isChecked: boolean) {
        this.isReSettledTickets = isChecked;
    }

    public hideTicketWaiting(groupMap: GroupMap[]) {
        groupMap.forEach(item => {
            item.resultDetail = item.resultDetail.filter(result => !_.isEqual(result.ticketStatus, TicketStatusText.noTicket));
        });
    }

    public setValueResult(resultDetail: ResultDetail, groupMap: GroupMap, isHoldResult: boolean) {
        resultDetail.resultSettingData.isHoldResult = isHoldResult;
        resultDetail.checked = false;
        groupMap.isHoldResult = groupMap.resultDetail.every(item => item.resultSettingData.isHoldResult);

        this.calculateAndUnCalculateButton();
    }

    public setValueGroup(groupMap: GroupMap, isHoldResult: boolean) {
        groupMap.resultDetail.forEach(item => {
            item.resultSettingData.isHoldResult = isHoldResult;
            item.checked = false;
        });
        groupMap.isHoldResult = isHoldResult;
        groupMap.checked = false;
        this.calculateAndUnCalculateButton();
    }

    public getTextTooltip(text: string, maxLength: number) {
        return text?.length > maxLength ? text : null;
    }

    public async doSaveResult(type: string, originalResultDetail: ResultDetail[], resultDetails: ResultDetail[],
        ApiKey: string, func: () => void) {
        const query = this.buildSaveScoreQuery(originalResultDetail, resultDetails, ApiKey);
        const result = await this.aioService.saveScore(query);
        
        if (!result.isSuccessful) {
            this.toastrService.error(result.errMsg);
        } else {
            this.handleSaveResultSuccess(type, func);
        }
    }

    private buildSaveScoreQuery(originalResultDetail: ResultDetail[], resultDetails: ResultDetail[], ApiKey: string): SaveScoreQuery {
        const scoresToSave = this.verificationBaseService.getChangedScores(resultDetails, originalResultDetail);
        const checkedScores = this.verificationBaseService.getOutsideScores(resultDetails);
        return {
            matchId: this.matchId,
            scoresToSave,
            checkedScores,
            apiKey: ApiKey
        };
    }

    private handleSaveResultSuccess(type: string, func: () => void) {
        if (_.isEqual(type, CalculateAction.calculate)) {
            func();
        } else {
            this.autoUncheckAfterFilter();
        }
    }

    public verifyScoreSourcesAndCalculate(confirmChangedResults: () => void) {
        if (!this.verificationBaseService.allMapHaveScreenshotSource(this.resultDetails)) {
            this.toastrService.error(Language.sop.notScreenshot);
            return;
        }

        if (this.verificationBaseService.isExistMismatchedScoreScreenshot(this.resultDetails)) {
            this.toastrService.error(Language.sop.mismatchedScreenshot);
            return;
        }

        if (this.verificationBaseService.allResultsHaveScoreSources(this.resultDetails)) {
            this.confirmCalculateMismatchScores(confirmChangedResults);
        } else {
            this.handleInsufficientSources(confirmChangedResults);
        }
    }

    private handleInsufficientSources(confirmChangedResults: () => void) {
        if (!this.permission.isLeader) {
            this.toastrService.error(Language.eSports.nonLeader.insufficientSources);
        } else {
            this.confirmationDialogMessage.message = Language.eSports.leader.insufficientSources;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.confirmCalculateMismatchScores(confirmChangedResults);
            });
        }
    }

    public confirmCalculateMismatchScores(confirmChangedResults: () => void) {
        if (this.verificationBaseService.isExistMismatchScore(this.resultDetails)) {
            this.handleMismatchedScores(confirmChangedResults);
        } else {
            confirmChangedResults();
        }
    }

    private handleMismatchedScores(confirmChangedResults: () => void) {
        if (!this.permission.isLeader) {
            this.toastrService.error(Language.eSports.nonLeader.mismatchedResult);
        } else {
            this.confirmationDialogMessage.message = Language.eSports.leader.mismatchedResult;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                confirmChangedResults();
            });
        }
    }

    public isChangeSetting(resultDetail: ResultDetail, groupMap: GroupMap) {
        if (this.hasModificationPermissions()) {
            this.toastrService.clear();
            const query = new ResultSettingQuery(this.matchId, ResultSettingType.holdResult,
                !resultDetail.resultSettingData.isHoldResult, resultDetail.resourceId);
            this.confirmationDialogMessage.message = Language.holdResultConfirmMessage;

            this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
                const result = await this.aioService.changeResultSetting(query);
                this.setValueResult(resultDetail, groupMap, result);
            });
        }
    }

    public changeSettingGroup(groupMap: GroupMap) {
        if (this.hasModificationPermissions()) {
            const resourceIds = _.join(groupMap.resultDetail.map(item => item.resourceId), ',');
            const query = new ResultSettingQuery(this.matchId, ResultSettingType.holdResult,
                !groupMap.isHoldResult, resourceIds);
            this.confirmationDialogMessage.message = Language.holdResultGroupConfirmMessage;

            this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
                this.aioService.changeResultSetting(query).then((result) => {
                    this.setValueGroup(groupMap, result);
                });
            });
        }
    }

    public getUncalculateMessage() {
        const isRunningResultStatus = this.hasRunningResultStatus();
        this.confirmationDialogMessage.message = isRunningResultStatus
            ? Language.UnCalculationConfirmMessageEarly2
            : Language.UnCalculationConfirmMessageEarly1;
    }

    private hasRunningResultStatus(): boolean {
        return !!_.find(this.resultDetails, (x: ResultDetail) => 
            x.checked && this.isRunningStatus(x.resultStatusId));
    }

    private isRunningStatus(resultStatusId: number | null): boolean {
        return resultStatusId === ResultStatusId.RunningZero
            || resultStatusId === ResultStatusId.RunningOne
            || resultStatusId === ResultStatusId.RunningThree
            || resultStatusId === null;
    }

    public async checkMarkedTickets(resultDetails: ResultDetail[], pushFunc: () => void) {
        const paramsCheckingMarkedTickets = {
            matchId: this.matchId,
            selectedResources: resultDetails
        };
        const res = await this.aioService.checkMarkedTickets(paramsCheckingMarkedTickets);
        if (res.isExistMarkedTicket) {
            this.toastrService.error(Language.MarkedTicket);
        } else {
            this.showRefundConfirmation(pushFunc);
        }
    }

    private showRefundConfirmation(pushFunc: () => void) {
        this.confirmationDialogMessage.message = this.isRefundWithSettleDetermined ? Language.RefundConfirmSdtMessage : Language.RefundConfirmMessageEarly;
        this.messageBoxService.confirm(this.confirmationDialogMessage, pushFunc);
    }

    public getClass(teamName: string) {
        return teamName === '' ? 'input-score' : 'team-score';
    }

    public getDropdownTooltip(result: string, maxLength: number) {
        const tooltip = this.getTeamNameFromResult(result);
        return this.getTextTooltip(tooltip, maxLength);
    }

    private getTeamNameFromResult(result: string): string {
        if (_.isEqual(result, "H")) {
            return this.matchDetail.homeName;
        }
        if (_.isEqual(result, "A")) {
            return this.matchDetail.awayName;
        }
        return '';
    }

    public isConfirmed(resultDetail: ResultDetail) {
        return this.permission.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    }

    public confirmRefund(SDTConfirmMessage = '') {
        this.toastrService.clear();
        const resourceIds = this.getResourceIds();
        const confirmRefundResources = this.getConfirmRefundResources();
        const existResultConfirmed = this.hasConfirmedResult();
        
        if (existResultConfirmed) {
            this.undoConfirmedResult(this.selectedResources, this.matchDetail.matchId, resourceIds, confirmRefundResources);
        } else {
            this.executeConfirmRefund(resourceIds, confirmRefundResources, SDTConfirmMessage);
        }
    }

    private getResourceIds(): string {
        return _.join(this.selectedResources.map(item => item.resourceId), ',');
    }

    private getConfirmRefundResources() {
        return this.selectedResources.map(x => ({ ...x, resourceName: x.betTypeName }));
    }

    private hasConfirmedResult(): boolean {
        return !!_.find(this.selectedResources, item => 
            item.resultSettingData.isConfirmedRefundSdt || item.resultSettingData.isConfirmedRefund);
    }

    private executeConfirmRefund(resourceIds: string, confirmRefundResources: ResultDetail[], SDTConfirmMessage = '') {
        if (this.isRefundWithSettleDetermined) {
           this.confirmationDialogMessage.message = SDTConfirmMessage;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                const query = new ResultSettingQuery(this.matchDetail.matchId, ResultSettingType.confirmRefundSDT, true, resourceIds, confirmRefundResources);
                this.aioService.changeResultSetting(query).then().finally(this.messageBoxService.closePopupNotChanged);
            });
        } else {
            this.aioService.changeConfirmResultSetting({
                message: Language.confirmRefund.confirmRefund,
                matchId: this.matchDetail.matchId,
                resourceIds,
                isEnabled: true,
                hedgeMatchDetail: null,
                oldMatchDetail: null,
                confirmRefundResources,
                selectedResources: this.selectedResources,
                isSettleDetermined: this.isRefundWithSettleDetermined
            });
        }
    }

    public undoConfirmedResult(
        resultDetails: ResultDetail[],
        matchId: number,
        resourceIds: string,
        confirmRefundResources: ResultDetail[]) {
        const allResultConfirmed = this.areAllResultsConfirmed(resultDetails);
        if (allResultConfirmed) {
            this.executeUndoConfirmRefund(matchId, resourceIds, confirmRefundResources);
        } else {
            this.toastrService.error(Language.confirmRefund.differentStates);
        }
    }

    private areAllResultsConfirmed(resultDetails: ResultDetail[]): boolean {
        return _.every(resultDetails, item => 
            this.isRefundWithSettleDetermined 
                ? item.resultSettingData.isConfirmedRefundSdt 
                : item.resultSettingData.isConfirmedRefund);
    }

    private executeUndoConfirmRefund(matchId: number, resourceIds: string, confirmRefundResources: ResultDetail[]) {
        if (this.isRefundWithSettleDetermined) {
            this.aioService.changeConfirmResultSDTSetting(
                matchId, 
                ResultSettingType.confirmRefundSDT, 
                confirmRefundResources, 
                false, 
                null
            );
        } else {
            this.aioService.changeConfirmResultSetting({
                message: Language.confirmRefund.undoConfirm,
                matchId,
                resourceIds,
                isEnabled: false,
                hedgeMatchDetail: null,
                oldMatchDetail: null,
                confirmRefundResources,
                selectedResources: null,
                isSettleDetermined: this.isRefundWithSettleDetermined
            });
        }
    }

    public allResultConfirmed() {
        return !_.find(this.selectedResources, item => !item.resultSettingData.isConfirmedRefund);
    }

    public allResultConfirmedSdt(externalScores: ExternalResult[]) {
        if (!this.isRefundWithSettleDetermined) {
            return false;
        }
        
        const resultConfirmedSdt = externalScores.find(item => item.sourceId === ScoreSourceType.confirmRefundSource);
        if (_.isNil(resultConfirmedSdt)) {
            return false;
        }
        
        return this.selectedResources.every(item => {
            if (item.resultSettingData.isConfirmedRefundSdt) {
                const resultConfirmed = resultConfirmedSdt.resultDetails.find(x => x.resourceId === item.resourceId);
                return resultConfirmed && resultConfirmed.homeValue === item.homeValue;
            }
            return false;
        });
    }

    public checkResultIsMatched(resultDetail: ResultDetail) {
        resultDetail.isScoreMismatched = this.verificationBaseService.isEarlyMismatchedWarning(resultDetail);
    }

    public autoFillResultOnLoad(resultDetails: ResultDetail[]) {
        _.forEach(resultDetails, (resultDetail) => {
            this.verifyAndAutoFillResult(resultDetail);
        });
    }

    public verifyAndAutoFillResult(resultDetail: ResultDetail) {
        this.matchDetail.isSavedScore = false;
        if (resultDetail.settlementStatusId !== SettlementStatusId.Calculated && resultDetail.settlementStatusId !== SettlementStatusId.RefundSettleDetermined) {
            resultDetail.homeValue = '';
            resultDetail.awayValue = '';
        }

        this.verificationBaseService.autoFillEarlyResult(resultDetail);
        resultDetail.isScoreMismatched = this.verificationBaseService.isEarlyMismatchedWarning(resultDetail);
    }

    public async verifyRunningOdds(ResourceIds: string[], func: () => void) {
        const errorMessage = await this.aioService.checkingNoRunningOdds(
            this.matchId, ResourceIds, CalculateAction.earlyCalculate);
        
        if (_.isNil(errorMessage)) {
            func();
        } else {
            this.toastrService.error(errorMessage);
        }
    }

    autoFillConfirmedSDT(isLeader: boolean, externalResults: ExternalResult[], resultDetails: ResultDetail[]) {
        const resultConfirmRefund = externalResults.find(r => r.sourceId === ScoreSourceType.confirmRefundSource);
        if (isLeader && resultConfirmRefund) {
            this.fillConfirmedResults(resultDetails, resultConfirmRefund.resultDetails);
        }
    }

    setRefundButtonWhenExistConfirmedSDT(resultDetails: ResultDetail[]) {
        const resultConfirmRefund = resultDetails.some(r => r.resultSettingData.isConfirmedRefundSdt);
        if (resultConfirmRefund) {
            this.isShowRefundButton = true;
            this.isRefundWithSettleDetermined = true;
        }
    }
    onShowRefundButtonChange(){
        if(!this.isShowRefundButton){
            this.isRefundWithSettleDetermined = false;
        }
    }

    private fillConfirmedResults(resultDetails: ResultDetail[], externalResults: ExternalResultDetail[]) {
        resultDetails.forEach(result => {
            if (result.resultSettingData.isConfirmedRefundSdt) {
                this.resourceConfirmed(externalResults, result);
            }
        });
    }

    private resourceConfirmed(externalResults: ExternalResultDetail[], resultDetail: ResultDetail) {
        const resource = externalResults.find(resultConfirmed => resultConfirmed.resourceId === resultDetail.resourceId);
        if (resource) {
            resultDetail.homeValue = resultDetail.confirmedSdtHomeValue = resource.homeValue;
            resultDetail.awayValue = resultDetail.confirmedSdtAwayValue = resource.awayValue;
        }
    }
}
