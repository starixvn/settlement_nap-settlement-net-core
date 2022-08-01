import { Component, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { UrlHelper } from '../../../helper';
import {
    ResultDetail,
    Permission,
    SettleQuery,
    GroupMap,
} from '../../models';
import { Match } from './models/match.model';
import {
    ResultStatusId,
    SettlementStatusId,
    CalculateAction,
    ResultSettingType,
} from '../../../shared/constants';
import { Language } from '../../../shared/language';
import { ModalDialogMessage, Result, MarkedTicketsModel, ResultSettingQuery } from '../../../shared/models';
import { MessageBoxService } from '../../../shared/services';
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
    ResultValue,
    ApiKeys,
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
    public match: Match;
    public isReSettledTickets: boolean;
    public isDisabledCalculate = true;
    public isDisabledUnCalculate = true;
    public confirmationDialogMessage = new ModalDialogMessage();
    public betTypeId = BetTypes;
    public matchId = Number(UrlHelper.getUrlParameter('matchId'));
    public groupMap: GroupMap[];
    public isShowRefundButton = false;
    public apiUrl: string;
    constructor(
        private readonly verifyCalculateService: VerifyCalculateService,
        private readonly messageBoxService: MessageBoxService,
        private readonly autoFillService: AutoFillService,
        private readonly penaltyShootoutService: PenaltyShootoutService,
        private readonly penaltyWoodWorkService: PenaltyWoodWorkService,
        private readonly helperService: HelperService,
        private readonly toastrService: ToastrService
    ) {
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    async getMatch(matchId: number, apiUrl: string = null) {
        this.toastrService.overlayContainer = this.toastContainer;
        this.apiUrl = apiUrl;
        this.match = await this.helperService.getMatch(matchId, ApiKeys.EarlyMatch).toPromise() as Match;
        this.groupMap = this.helperService.getGroupBetType(this.resultDetails);
    }

    public get resultDetails(): ResultDetail[] {
        return this.match.resultDetail;
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
        const selectedResultDetails = this.resultDetails.filter((item) => item.checked);
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

    public async refund() {
        this.clearErrorMessage();
        const resultStatus = await this.helperService.checkingStatus(this.matchId,
            CalculateAction.refund, this.apiUrl).toPromise() as Result;

        if(resultStatus.isSuccessful) {
            const selectedResultDetails = this.resultDetails.filter((map) => map.checked);
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
        const result = await this.helperService.checkMarkedTickets(
            this.matchId,
            selectedResultDetails,
            this.apiUrl).toPromise() as MarkedTicketsModel;
        return result.isExistMarkedTicket
                ? Language.MarkedTicket
                : this.verifyCalculateService.verifyPenaltyBettypeBeforeRefund(selectedResultDetails, this.resultDetails);
    }

    public async calculate() {
        this.clearErrorMessage();
        const selectedResultDetails = this.resultDetails.filter((item) => item.checked);
        const resultStatus = await this.helperService.checkingStatus(this.matchId,
            CalculateAction.calculate, this.apiUrl).toPromise() as Result;

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
            this.confirmCalculation(resultDetails);
        } else {
            const lastedMatchResult = await this.helperService.getLastestMatchResult(
                this.matchId,
                this.apiUrl).toPromise() as ResultDetail[];
            const needConfirm = this.verifyCalculateService.isChangedScore(resultDetails, lastedMatchResult);

            if (needConfirm) {
                this.confirmationDialogMessage.message = Language.recalculateNotification;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    this.isReSettledTickets = true;
                });
            } else {
                this.confirmCalculation(resultDetails);
            }
        }
    }

    private confirmCalculation(selectedResultDetails: ResultDetail[]) {
        this.correctSettleDeterminedForCalculation(selectedResultDetails);
        this.confirmationDialogMessage.message = Language.CalculationConfirmMessageEarly;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            const query = new SettleQuery(this.matchId,
                CalculateAction.calculate, selectedResultDetails, this.isReSettledTickets);
            this.push(query);
        });
    }

    private push(query: SettleQuery) {
        this.helperService.settle(query).subscribe((result: Result) => {
            if (result.errCode === 0) {
                this.helperService.closePopup(query.matchId);
            } else {
                this.toastrService.error(result.errMsg);
            }
        });
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
            const result = await this.helperService.changeResultSetting(query, this.apiUrl).toPromise() as boolean;
            this.setValueResult(resultDetail, groupMap, result);
        });
    }

    public changeSettingGroup(groupMap: GroupMap) {
        const resourceIds = _.join(groupMap.resultDetail.map(item => item.resourceId), ',');
        const query = new ResultSettingQuery(this.match.matchDetail.matchId, ResultSettingType.holdResult,
            !groupMap.isHoldResult, resourceIds);
        this.confirmationDialogMessage.message = Language.holdResultGroupConfirmMessage;

        this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
            const result = await this.helperService.changeResultSetting(query, this.apiUrl).toPromise() as boolean;
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