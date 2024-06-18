import * as _ from 'lodash';
import { Component, Injector } from '@angular/core';
import { ResultDetail, GroupMap, Permission, SaveScoreQuery, MatchDetail } from '../../models/sportsbook-sop';
import { ItemsSelect, ModalDialogMessage, MultipleSelect, ResultSettingQuery } from '../../models';
import { BackgroundColor, CalculateAction, ResultSettingType, ResultStatusId, SettlementStatusId, TicketStatusText } from '../../constants';
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
        this.ticketStatusSelected = value.length > 0 ? value.map(item => item.value).join() : "";
        this.autoUncheckAfterFilter();
    }

    public onSelectResultsStatus(value: ItemsSelect[]) {
        this.resultStatusSelected = value.length > 0 ? value.map(item => item.value).join() : "";
        this.autoUncheckAfterFilter();
    }

    public onSelectResultType(value: ItemsSelect[]) {
        this.resultTypeSelected = value.length > 0 ? value.map(item => item.value).join() : "";
        this.autoUncheckAfterFilter();
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
        return resultStatusId === ResultStatusId.ManualCompleted && settlementStatusId === SettlementStatusId.Refund;
    }

    public onCollapsedClick(map: GroupMap) {
        map.collapsed = !map.collapsed;
    }

    public getResultSettingIcon(holdResult: boolean) {
        if (this.permission.canCalculate || this.permission.canUncalculate || this.permission.canRefund) {
            return holdResult ? 'icon-yes' : 'icon-no';
        } else {
            return holdResult ? BackgroundColor.iconAutoDisabled : BackgroundColor.iconNoDisabled;
        }
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
        const scoresToSave = this.verificationBaseService.getChangedScores(resultDetails, originalResultDetail);
        const checkedScores = this.verificationBaseService.getOutsideScores(resultDetails);
        const query: SaveScoreQuery = {
            matchId: this.matchId,
            scoresToSave,
            checkedScores,
            apiKey: ApiKey
        };
        const result = await this.aioService.saveScore(query);
        if (!result.isSuccessful) {
            this.toastrService.error(result.errMsg);
        } else {
            if (_.isEqual(type, CalculateAction.calculate)) {
                func();
            } else {
                this.autoUncheckAfterFilter();
            }
        }
    }

    public verifyScoreSourcesAndCalculate(confirmChangedResults: () => void) {
        if(!this.verificationBaseService.allMapHaveScreenshotSource(this.resultDetails)) {
            this.toastrService.error(Language.sop.notScreenshot);
            return;
        }
 
        if(this.verificationBaseService.isExistMismatchedScoreScreenshot(this.resultDetails)) {
            this.toastrService.error(Language.sop.mismatchedScreenshot);
            return;
        }
        
        if (this.verificationBaseService.allResultsHaveScoreSources(this.resultDetails)) {
            this.confirmCalculateMismatchScores(confirmChangedResults);
        } else {
            if (!this.permission.isLeader) {
                this.toastrService.error(Language.eSports.nonLeader.insufficientSources);
            } else {
                this.confirmationDialogMessage.message = Language.eSports.leader.insufficientSources;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    this.confirmCalculateMismatchScores(confirmChangedResults);
                });
            }
        }
    }

    public confirmCalculateMismatchScores(confirmChangedResults: () => void) {
        if (this.verificationBaseService.isExistMismatchScore(this.resultDetails)) {
            if (!this.permission.isLeader) {
                this.toastrService.error(Language.eSports.nonLeader.mismatchedResult);
            } else {
                this.confirmationDialogMessage.message = Language.eSports.leader.mismatchedResult;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    confirmChangedResults();
                });
            }
        } else {
            confirmChangedResults();
        }
    }

    public isChangeSetting(resultDetail: ResultDetail, groupMap: GroupMap) {
        if (this.permission.canCalculate || this.permission.canUncalculate || this.permission.canRefund) {
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
        if (this.permission.canCalculate || this.permission.canUncalculate || this.permission.canRefund) {
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
        const isRunningResultStatus = _.find(this.resultDetails,
            (x: ResultDetail) => x.checked
                && (x.resultStatusId === ResultStatusId.RunningZero
                    || x.resultStatusId === ResultStatusId.RunningOne
                    || x.resultStatusId === ResultStatusId.RunningThree || x.resultStatusId === null));

        this.confirmationDialogMessage.message = isRunningResultStatus
            ? Language.UnCalculationConfirmMessageEarly2
            : Language.UnCalculationConfirmMessageEarly1;
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
            this.confirmationDialogMessage.message = Language.RefundConfirmMessageEarly;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                pushFunc();
            });
        }
    }

    public getClass(teamName: string) {
        return teamName === '' ? 'input-score' : 'team-score';
    }

    public getDropdownTooltip(result: string, maxLength: number) {
        const tooltip = _.isEqual(result, "H")
            ? this.matchDetail.homeName : _.isEqual(result, "A")
                ? this.matchDetail.awayName : '';
        return this.getTextTooltip(tooltip, maxLength);
    }

    public isConfirmed(resultDetail: ResultDetail) {
        return this.permission.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
    }

    public confirmRefund() {
        this.toastrService.clear();
        const resourceIds = _.join(this.selectedResources.map(item => item.resourceId), ',');
    
        const confirmRefundResources = this.selectedResources.map(x => ({...x,resourceName: x.betTypeName}));

        const existResultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund);
        if (existResultConfirmed) {
            this.undoConfirmedResult(this.selectedResources, this.matchDetail.matchId, resourceIds,confirmRefundResources);
        } else {
            this.aioService.changeConfirmResultSetting(
                Language.confirmRefund.confirmRefund, 
                this.matchDetail.matchId, 
                resourceIds, 
                true, 
                null,
                null,
                confirmRefundResources
            );
        }
    }

    public undoConfirmedResult(
        resultDetails: ResultDetail[], 
        matchId: number, 
        resourceIds: string,
        confirmRefundResources: any[]) {
        const resultNotConfirmed = _.find(resultDetails, item => !item.resultSettingData.isConfirmedRefund);
        if (_.isNil(resultNotConfirmed)) {
            this.aioService.changeConfirmResultSetting(Language.confirmRefund.undoConfirm, matchId, resourceIds, false, null,null,confirmRefundResources);
        } else {
            this.toastrService.error(Language.confirmRefund.differentStates);
        }
    }

    public allResultConfirmed() {
        const existResultNotConfirmed = _.find(this.selectedResources, item => !item.resultSettingData.isConfirmedRefund);
        if (!_.isNil(existResultNotConfirmed)) {
            return false;
        }
        return true;
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
        if (resultDetail.settlementStatusId !== SettlementStatusId.Calculated) {
            resultDetail.homeValue = '';
            resultDetail.awayValue = '';
        }

        this.verificationBaseService.autoFillEarlyResult(resultDetail);
        resultDetail.isScoreMismatched = this.verificationBaseService.isEarlyMismatchedWarning(resultDetail);
    }

    public async verifyRunningOdds(ResourceIds: string[], func: () => void) {
        const errorMessage = await this.aioService.checkingNoRunningOdds(this.matchId,
            ResourceIds, CalculateAction.earlyCalculate);
        if (_.isNil(errorMessage)) {
            func();
        } else {
            this.toastrService.error(errorMessage);
        }
    }
}
