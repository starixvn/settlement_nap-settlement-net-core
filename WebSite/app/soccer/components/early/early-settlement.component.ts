import { Component, ViewChild, Injector } from '@angular/core';
import * as _ from 'lodash';
import { UrlHelper } from '../../../helper';
import {
    ResultDetail,
    SettleQuery,
    GroupMap,
} from '../../models';
import { Match } from './models/match.model';
import {
    ResultStatusId,
    SettlementStatusId,
    CalculateAction,
    ResultSettingType,
    SportType,
    ScoreSourceType
} from '../../../shared/constants';
import { Language } from '../../../shared/language.native';
import { ModalDialogMessage, ResourceItem, ResultSettingQuery } from '../../../shared/models';
import { MessageBoxService, AioService } from '../../../shared/services';
import { Permission } from '../../../shared/models/sportsbook-sop';
import {
    GoalMethod,
    TimeGoal,
    BetTypes,
    TextBoxBetTypes,
    ScoreMiss,
    ScoreMissNotTaken,
    HitNotHit,
    OneXTwo,
    BothOneNeither,
    YesNo,
    BetTypesSettleDetermined,
    CheckedSettleDetermined,
    ResultValue
} from '../../constants';
import {
    VerifyCalculateService,
    VerifyRefundService,
    GroupBetTypeService,
    AutoFillService,
    PenaltyShootout1x2Service,
    PenaltyShootoutBothOneNeitherService,
    PenaltyShootoutService,
    PenaltyWoodWorkService,
    HelperService,
    VerifyService
} from './services';
import { Soccer } from '../soccer.model';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';

@Component({
    selector: 'early-settlement',
    templateUrl: './early-settlement.component.html',
    providers: [
        VerifyCalculateService,
        VerifyRefundService,
        VerifyService,
        GroupBetTypeService,
        AutoFillService,
        PenaltyShootout1x2Service,
        PenaltyShootoutBothOneNeitherService,
        PenaltyShootoutService,
        PenaltyWoodWorkService,
        HelperService
    ]
})
export class EarlySettlementComponent implements Soccer {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    private verifyCalculateService: VerifyCalculateService;
    private messageBoxService: MessageBoxService;
    private autoFillService: AutoFillService;
    private penaltyShootoutService: PenaltyShootoutService;
    private penaltyWoodWorkService: PenaltyWoodWorkService;
    private helperService: HelperService;
    private toastrService: ToastrService;
    private aioService: AioService;
    public match: Match;
    public isReSettledTickets: boolean;
    public isDisabledCalculate = true;
    public isDisabledUnCalculate = true;
    public confirmationDialogMessage = new ModalDialogMessage();
    public betTypeId = BetTypes;
    public matchId = Number(UrlHelper.getUrlParameter('matchId'));
    public groupMap: GroupMap[];
    public isShowRefundButton = false;
    constructor(protected injector: Injector)
    {
        this.confirmationDialogMessage.title = Language.confirmationBox;
        this.verifyCalculateService = this.injector.get(VerifyCalculateService);
        this.messageBoxService = this.injector.get(MessageBoxService);
        this.autoFillService = this.injector.get(AutoFillService);
        this.penaltyShootoutService = this.injector.get(PenaltyShootoutService);
        this.penaltyWoodWorkService = this.injector.get(PenaltyWoodWorkService);
        this.helperService = this.injector.get(HelperService);
        this.aioService = this.injector.get(AioService);
        this.toastrService = this.injector.get(ToastrService);
    }

    async getMatch(matchId: number) {
        this.toastrService.overlayContainer = this.toastContainer;
        this.match = await this.helperService.getMatch(matchId) as Match;
        this.groupMap = this.helperService.getGroupBetType(this.resultDetails);
        this.generateConfirmRefundSettleDetermined();
    }

    private generateConfirmRefundSettleDetermined()
    {
        var listResultDetailSdt = _.filter(this.resultDetails, item => item.resultSettingData.isConfirmedRefundSdt);
        if(this.permission.isLeader) {
            listResultDetailSdt.forEach(resultDetail => {
                const resource = this.match.externalResults.find(item => item.sourceId === ScoreSourceType.confirmRefundSource && item.resourceId === resultDetail.resourceId);
                if (resource) {
                    resultDetail.homeValue = resource.homeValue;
                    resultDetail.awayValue = resource.awayValue;
                    resultDetail.isSettleDetermined = resultDetail.resultSettingData.isConfirmedRefundSdt;
                }
            });
       }
       
    }
    public get resultDetails(): ResultDetail[] {
        return this.match.resultDetail;
    }

    public get selectedResources(): ResultDetail[] {
        return _.filter(this.resultDetails, (map: ResultDetail) => map.checked);
    }


    public get permission(): Permission {
        return this.match.permission;
    }

    public get isPenaltyShootoutMatch() {
        return this.match.matchDetail.childMatchType === 202;
    }

    public isCompleted(resultStatusId: number, settlementStatusId: number) {
        return resultStatusId === ResultStatusId.AutoCompleted
            || (resultStatusId === ResultStatusId.ManualCompleted
                && settlementStatusId === SettlementStatusId.Calculated);
    }

    public isRefunded(resultStatusId: number, settlementStatusId: number) {
        return resultStatusId === ResultStatusId.ManualCompleted
            && (settlementStatusId === SettlementStatusId.Refund
                || settlementStatusId === SettlementStatusId.RefundSettleDetermined);
    }

    public onChangeBetType(item: ResultDetail, map: GroupMap) {
        item.isResultWarning = false;
        this.disableCalculateAndUnCalculate();

        map.checked = map.resultDetail.every((resultItem) => resultItem.checked);

    }

    public onChangeGroupMap(map: GroupMap) {
        map.resultDetail.forEach((item) => {
            item.checked = item.resultSettingData.isHoldResult ? false : map.checked;
            item.isResultWarning = false;
        });

        this.disableCalculateAndUnCalculate();
    }

    public disableCalculateAndUnCalculate() {
        const canCalculate = _.find(this.resultDetails,
            (x: ResultDetail) => x.checked);
        this.isDisabledCalculate =  _.isEmpty(canCalculate);
        this.isDisabledUnCalculate =  _.isEmpty(canCalculate);
    }

    public unCalculate() {
        this.clearErrorMessage();
        const selectedResultDetails = this.selectedResources;
        const isRunningResultStatus = _.find(selectedResultDetails, (x: ResultDetail) =>
            x.resultStatusId === ResultStatusId.RunningZero
            || x.resultStatusId === ResultStatusId.RunningOne
            || x.resultStatusId === ResultStatusId.RunningThree
            || x.resultStatusId === null);

        this.confirmationDialogMessage.message = isRunningResultStatus
            ? Language.UnCalculationConfirmMessageEarly2
            : Language.UnCalculationConfirmMessageEarly1;

        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            selectedResultDetails.forEach((item) => {
                item.homeValue = "";
                item.awayValue = "";
                item.isSettleDetermined = this.isBetTypeSettleDetermined(item.betType)
                    && item.isSettleDetermined;
            });
            const query = new SettleQuery(this.matchId,
                CalculateAction.unCalculate,
                selectedResultDetails,
                this.isReSettledTickets);
            this.push(query);
        });
    }
    public async confirmRefund() {
        this.toastrService.clear();
        const existResultConfirmed = _.find(this.selectedResources, item => (item.resultSettingData.isConfirmedRefund || item.resultSettingData.isConfirmedRefundSdt));
        if (existResultConfirmed) {
            this.undoConfirmedResult(this.selectedResources, this.matchId);
        } else {
            const errorMessage = await this.verifyBeforeRefund(this.selectedResources);
            if (_.isEmpty(errorMessage)) {
                this.changeConfirmResultSetting(Language.confirmRefund.confirmRefund, this.matchId, true);
            } else {
                this.toastrService.error(errorMessage);
            }
        }
    }

    private undoConfirmedResult(resultDetails: ResultDetail[], matchId: number) {
        const resultConfirmed = _.filter(resultDetails, item => (item.resultSettingData.isConfirmedRefund || item.resultSettingData.isConfirmedRefundSdt));
        if (resultConfirmed.length === resultDetails.length) {
            this.changeConfirmResultSetting(Language.confirmRefund.undoConfirm, matchId, false);
        } else {
            this.toastrService.error(Language.confirmRefund.differentStates);
        }
    }

    private changeConfirmResultSetting(message: string, matchId: number, isEnabled: boolean) {
        this.confirmationDialogMessage.message = message;
        this.messageBoxService.confirm(this.confirmationDialogMessage, async() => {
            await this.changeConfirmResultByType(matchId, isEnabled);
        });
    }

    private async changeConfirmResultByType(matchId: number, isEnabled: boolean) {
        const resourceIds = _.join(this.selectedResources.map(item => item.resourceId), ',');
        const resourceItems = this.selectedResources.map(item => new ResourceItem(item.resourceId, item.resourceName, item.homeValue, item.awayValue))
        const query = new ResultSettingQuery(matchId, ResultSettingType.confirmRefundSDT, isEnabled, resourceIds, resourceItems);
        this.aioService.changeResultSetting(query).finally(() => this.messageBoxService.closePopupNotChanged());
    }

    private isExistedConfirmRefund() {
        const existResultNotConfirmed = _.find(this.selectedResources, item => !item.resultSettingData.isConfirmedRefund && !item.resultSettingData.isConfirmedRefundSdt);
        if (!_.isNil(existResultNotConfirmed)) {
            return false;
        }
        return true;
    }
    public async refund() {
        this.clearErrorMessage();
        if (this.isExistedConfirmRefund()) {
           await this.doRefund();
        } else {
            this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
        }
    }

    private async doRefund() {
        const resultStatus = await this.helperService.checkingStatus(this.matchId, CalculateAction.refund);
        if(resultStatus.isSuccessful) {
            const selectedResultDetails = this.selectedResources;
            this.correctSettleDeterminedForRefund(selectedResultDetails);
            const errorMessage = await this.verifyBeforeRefund(selectedResultDetails);
            if (_.isEmpty(errorMessage)) {
                this.confirmationDialogMessage.message = Language.RefundConfirmMessageEarly;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    const query = new SettleQuery(this.matchId,
                        CalculateAction.refund, selectedResultDetails, this.isReSettledTickets);
                    this.push(query);
                });
            } else {
                this.toastrService.error(errorMessage);
            }
        } else {
            this.toastrService.error(resultStatus.errMsg);
        }
    }

    private async verifyBeforeRefund(selectedResultDetails: ResultDetail[]) {
        const query = {
            matchId: this.matchId,
            selectedResources: selectedResultDetails
        };

        const result = await this.aioService.checkMarkedTickets(query);
        return result.isExistMarkedTicket
                ? Language.MarkedTicket
                : this.verifyCalculateService.verifyPenaltyBettypeBeforeRefund(selectedResultDetails,  this.resultDetails, this.match.externalResults);
    }

    public async calculate() {
        this.clearErrorMessage();
        const selectedResultDetails = this.selectedResources;
        const resultStatus = await this.helperService.checkingStatus(this.matchId, CalculateAction.calculate);

        if(resultStatus.isSuccessful) {
            const errorMessage = this.verifyBeforeCalculation(selectedResultDetails);
            if (_.isEmpty(errorMessage)) {
                this.confirmChangedResults(selectedResultDetails);
            } else {
                this.toastrService.error(errorMessage);
            }
        } else {
            this.toastrService.error(resultStatus.errMsg);
        }
    }

    private verifyBeforeCalculation(selectedResultDetails: ResultDetail[]) {
        let errorMessage = this.verifyCalculateService.verifyInputValue(selectedResultDetails);
        if (!_.isEmpty(errorMessage)) {
            return errorMessage;
        }

        errorMessage = this.verifyCalculateService.verifyPenaltyBettypeBeforeCalculation(selectedResultDetails, this.resultDetails);
        if (!_.isEmpty(errorMessage)) {
            return errorMessage;
        }

        errorMessage = this.verifyCalculateService.verifyCornerBettypeBeforeCalculation(selectedResultDetails);
        return _.isEmpty(errorMessage) ? "" : errorMessage;
    }

    private async confirmChangedResults(resultDetails: ResultDetail[]) {
        if (this.isReSettledTickets) {
            await this.confirmCalculation(resultDetails);
        } else {
            const query = {
                matchId: this.matchId,
                sportType: SportType.soccer,
            };
            const lastedMatchResult = await this.aioService.getLastestMatchResult(query) as ResultDetail[];
            const needConfirm = this.verifyCalculateService.isChangedScore(resultDetails, lastedMatchResult);

            if (needConfirm) {
                this.confirmationDialogMessage.message = Language.recalculateNotification;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    this.isReSettledTickets = true;
                });
            } else {
               await this.confirmCalculation(resultDetails);
            }
        }
    }

    private async confirmCalculation(selectedResultDetails: ResultDetail[]) {
        this.correctSettleDeterminedForCalculation(selectedResultDetails);
        this.confirmationDialogMessage.message = Language.CalculationConfirmMessageEarly;
        this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
            const query = new SettleQuery(this.matchId,
                CalculateAction.calculate, selectedResultDetails, this.isReSettledTickets);
            await this.push(query);
        });
    }

    private async push(query: SettleQuery) {
        const result = await this.helperService.settle(query);
        if (result.errCode === 0) {
            this.helperService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    public getListResult(betType: string, roundId: number) {
        switch (betType) {
            case this.betTypeId.ExtraTimeNextGoalMethod:
            case this.betTypeId.FirstGoalMethod:
                return GoalMethod;
            case this.betTypeId.TimeOfFirstGoal:
                return TimeGoal;
            case this.betTypeId.HomePenaltyShootout:
            case this.betTypeId.AwayPenaltyShootout:
                return this.resultValuePenaltyShootoutByRound(roundId);
            case this.betTypeId.PenaltyWoodwork:
                return HitNotHit;
            case this.betTypeId.PenaltyShootout1X2:
                return OneXTwo;
            case this.betTypeId.PenaltyShootoutBothOneNeither:
                return BothOneNeither;
            case this.betTypeId.PenaltyShootoutSuddenDead:
                return YesNo;
            default:
                return [];
        }
    }

    private resultValuePenaltyShootoutByRound(roundId: number) {
        return roundId > 5 ? ScoreMiss : ScoreMissNotTaken;
    }

    public isTextBoxControl(betType: string) {
        return _.includes(TextBoxBetTypes, betType);
    }

    public resultOnChange(item: ResultDetail) {
        if (item.map > 0 && item.map <= 5) {
            this.autoFillService.autoFillResult(this.resultDetails, item);
        }

        item.isResultWarning = false;
    }

    public woodworkOnChange(item: ResultDetail) {
        item.isNotTaken = this.penaltyShootoutService.isSelectedNotTaken(item.homeValue)
            || this.penaltyShootoutService.isSelectedNotTaken(item.awayValue);
        item.isResultWarning = false;
        item.isInvalidValue = this.penaltyWoodWorkService.isInvalidResult(this.resultDetails, item);
        item.isSettleDetermined = !item.isInvalidValue && item.isNotTaken;
    }

    public resultOnChangeFirstTen(item: ResultDetail) {
        if (item.map === 6) {
            this.autoFillService.changeValueOnPenaltyFirstTen(this.resultDetails, item);
        }
    }

    public onCollapsedClick(map: GroupMap) {
        map.collapsed = !map.collapsed;
    }

    private clearErrorMessage() {
        this.toastrService.clear();
        _.forEach(this.resultDetails, (x) => {
            x.isInvalidSelectedProceed = false;
            x.isResultWarning = false;
        });
    }

    public isBetTypeSettleDetermined(betType: string) {
        return _.includes(BetTypesSettleDetermined, betType);
    }

    public tooltipRefundSettleDetermined(settlementStatusId: number) {
        return settlementStatusId === 7 ? "Refund with Settle Determined Tickets" : "";
    }

    private correctSettleDeterminedForRefund(resultDetails: ResultDetail[]) {
        resultDetails.forEach((item) => {
            item.isSettleDetermined = this.isBetTypeSettleDetermined(item.betType)
                && item.isSettleDetermined;
        });
    }

    private correctSettleDeterminedForCalculation(resultDetails: ResultDetail[]) {
        resultDetails.forEach((item) => {
            item.isSettleDetermined = _.includes(CheckedSettleDetermined, item.betType)
                && item.isSettleDetermined;
        });
    }

    public onResettleCheckboxChange(isChecked: boolean) {
        this.isReSettledTickets = isChecked;
    }

    public setAllResults() {
        this.resultDetails.forEach((item) => {
            item.isNotTaken = false;
            item.isInvalidValue = false;
            item.isSettleDetermined = false;
            if (_.includes([BetTypes.HomePenaltyShootout, BetTypes.AwayPenaltyShootout], item.betType)) {
                item.homeValue = ResultValue.NotTaken;
                item.isNotTaken = true;
            }

            if (_.includes([BetTypes.PenaltyWoodwork, BetTypes.PenaltyShootout1X2, BetTypes.PenaltyShootoutBothOneNeither], item.betType)
                || item.map === 8) {
                item.homeValue = "";
                item.awayValue = "";
            }

            if (_.includes([BetTypes.PenaltyShootoutOddEven, BetTypes.PenaltyShootoutExactTotalGoals], item.betType)) {
                item.homeValue = "0";
                item.awayValue = "0";
            }

            if (_.includes([BetTypes.PenaltyShootoutHomeScore, BetTypes.PenaltyShootoutAwayScore], item.betType)) {
                item.homeValue = "0";
            }

            if (_.isEqual(BetTypes.PenaltyShootoutCombo, item.betType)) {
                item.homeValue = "NNNNN";
                item.awayValue = "NNNNN";
            }
        });
    }

    public getResultSettingIcon(holdResult: boolean) {
        return holdResult ? 'icon-yes' : 'icon-no';
    }

    public isChangeSetting(resultDetail: ResultDetail, groupMap: GroupMap) {
        const query = new ResultSettingQuery(this.match.matchDetail.matchId, ResultSettingType.holdResult,
            !resultDetail.resultSettingData.isHoldResult, resultDetail.resourceId);
        this.confirmationDialogMessage.message = Language.holdResultConfirmMessage;

        this.messageBoxService.confirm(this.confirmationDialogMessage, async() => {
            const result = await this.aioService.changeResultSetting(query) as boolean;
            this.setValueResult(resultDetail, groupMap, result);
        });
    }

    public changeSettingGroup(groupMap: GroupMap) {
        const resourceIds = _.join(groupMap.resultDetail.map(item => item.resourceId), ',');
        const query = new ResultSettingQuery(this.match.matchDetail.matchId, ResultSettingType.holdResult,
            !groupMap.isHoldResult, resourceIds);
        this.confirmationDialogMessage.message = Language.holdResultGroupConfirmMessage;

        this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
            const result = await this.aioService.changeResultSetting(query) as boolean;
            this.setValueGroup(groupMap, result);
        });
    }

    private setValueGroup(groupMap: GroupMap, isHoldResult: boolean) {
        groupMap.resultDetail.forEach(item => {
            item.resultSettingData.isHoldResult = isHoldResult;
            item.checked = false;
        });
        groupMap.isHoldResult = isHoldResult;
        groupMap.checked = false;
        this.disableCalculateAndUnCalculate();
    }

    private setValueResult(resultDetail: ResultDetail, groupMap: GroupMap, isHoldResult: boolean) {
        resultDetail.resultSettingData.isHoldResult = isHoldResult;
        resultDetail.checked = false;
        groupMap.isHoldResult = groupMap.resultDetail.every(item => item.resultSettingData.isHoldResult);
        this.disableCalculateAndUnCalculate();
    }
}