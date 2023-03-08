import { Component, Injector, ViewChild } from '@angular/core';
import * as _ from 'lodash';
import { MessageBoxService, AioService, BlockUIService } from '../../shared/services';
import { ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language.native';
import { CalculateAction, SettlementStatusId, SportType } from '../../shared/constants';
import { BasketballService, BetStatusService, VerificationService } from '../services';
import { BasketballApiKeys, KickOffTime, ResourcesIds } from '../constants';
import { GetTicketInfoQuery, Match, SettleQuery, VoidBetInfo, VoidBetQuery } from '../models';
import { MatchDetail, HedgeMatchDetail, ResultDetail, SaveScoreQuery, SportTemplate, ExternalResultDetail } from '../../shared/models/sportsbook-sop';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { ExternalSourceNamePipe } from '../../shared/pipes/external-source-name.pipe';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { CalculationMatchDetailComponent } from './calculation-match-detail.component';
import { CalculateCommonModule } from '../../shared/modules/calculate-common.module';

@Component({
    selector: 'calculation-actions',
    templateUrl: './calculation-actions.component.html',
    standalone: true,
    imports: [CalculateCommonModule, CalculationMatchDetailComponent,
        ExternalSourceNamePipe, ResourceNameByIdPipe],
    providers: [BasketballService, ResourceNameByIdPipe, BetStatusService, VerificationService]
})
export class CalculationActionsComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public readonly overTimeId = ResourcesIds.ot;
    public blockUI = true;
    public match: Match;
    public matchDetail: MatchDetail;
    public hedgeMatchDetail: HedgeMatchDetail;
    public applyHedgeMatch: boolean;
    public isDisabledUndo: boolean;
    public isReSettledTickets: boolean;
    public resultDetails: ResultDetail[];
    public isLeader: boolean;
    public disableScoreDirect: boolean;
    public isReadyMatch: boolean;
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();

    constructor(
        protected inject: Injector,
        private readonly basketballService: BasketballService,
        private readonly messageBoxService: MessageBoxService,
        private readonly aioService: AioService,
        private readonly verificationService: VerificationService,
        private readonly toastrService: ToastrService) {
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    async getMatch(matchId: number) {
        this.inject.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        const matchQuery = {
            matchId,
            apikey: BasketballApiKeys.normalMatch,
            sportType: SportType.basketBall,
            settleType: "MNL"
        };
        this.toastrService.overlayContainer = this.toastContainer;
        this.match = await this.aioService.getMatch(matchQuery) as Match;
        this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;
        this.cloneResultDetail();
        this.init();
    }

    private cloneResultDetail() {
        this.match.resultDetails.forEach((map) => {
            if (map.settlementStatusId === SettlementStatusId.Calculated) {
                map.originalHomeValue = _.clone(map.homeValue);
                map.originalAwayValue = _.clone(map.awayValue);
            } else {
                map.originalHomeValue = '0';
                map.originalAwayValue = '0';
            }
        });
    }

    public init() {
        this.resultDetails = this.basketballService.getResultDetail(this.match.resultDetails);
        this.verificationService.generateExternalScores(this.match, this.resultDetails, SportType.cricket);
        this.resetHomeAway(this.resultDetails);
        this.matchDetail = this.match.matchDetail;
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail != null;
        this.disableScoreDirect = this.verificationService.isTicketOnQuarter(this.resultDetails, this.match.resultDetails);
        this.overTime.ticketStatus = this.fullTime.ticketStatus;
        this.isLeader = this.match.permission.isLeader;
        this.isDisabledUndo = this.basketballService.isDisabledUndoButton(this.resultDetails);
        this.match.originalResultDetail = _.cloneDeep(this.resultDetails);
        this.autoFillScoreOnLoad(this.resultDetails);
    }

    public get selectedResources(): ResultDetail[] {
        return _.filter(this.resultDetails, (map: ResultDetail) => map.checked);
    }

    public get firstHalf() {
        return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.htScore));
    }

    public get fullTime() {
        return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.finalScore));
    }

    public get firstHalfResults() {
        return _.filter(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.quarter1)
            || _.isEqual(map.resourceId, ResourcesIds.quarter2));
    }

    public get quarterResults() {
        return _.filter(this.resultDetails, (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.htScore)
            && !_.isEqual(map.resourceId, ResourcesIds.finalScore));
    }

    public get quartersWithoutOverTime() {
        return _.filter(this.resultDetails, (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.htScore)
            && !_.isEqual(map.resourceId, ResourcesIds.finalScore)
            && !_.isEqual(map.resourceId, ResourcesIds.ot));
    }

    public get quartersWithoutHalfTime() {
        return _.filter(this.resultDetails, (map: ResultDetail) => !_.isEqual(map.resourceId, ResourcesIds.htScore));
    }

    public get overTime() {
        return _.find(this.resultDetails, (map: ResultDetail) => _.isEqual(map.resourceId, ResourcesIds.ot));
    }

    public autoFillScoreOnLoad(resultDetails: ResultDetail[]) {
        const intervals = resultDetails.filter((map) => !_.isEqual(map.resourceId, ResourcesIds.htScore)
            && !_.isEqual(map.resourceId, ResourcesIds.finalScore));
        _.forEach(this.firstHalf.externalScores, item => this.autofillOutsideSource(item.sourceId));
        if (intervals.length > 0) {
            _.forEach(intervals, (map) => {
                map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
                if (map.settlementStatusId !== SettlementStatusId.Refund) {
                    this.verifyAndAutoFillScore(map, true);
                }
            });
        } else {
            this.adjustHalfTimeScoreOnChange(true);
            this.adjustFinalScoreOnChange(true);
        }
    }

    private adjustFinalScoreOnChange(isOnload = false) {
        this.verificationService.sumScoreFullTime(this.quarterResults, this.fullTime);
        this.fullTime.isScoreMismatched = this.verificationService.isMismatchedWarning(this.fullTime);
        if ((_.isEmpty(this.fullTime.homeValue) && _.isEmpty(this.fullTime.awayValue))
            && (isOnload && this.fullTime.settlementStatusId !== SettlementStatusId.Refund || !isOnload)) {
            this.verificationService.autoFillScore(this.fullTime);
        }
    }

    private adjustHalfTimeScoreOnChange(isOnload = false) {
        this.verificationService.sumScoreHalfTime(this.firstHalfResults, this.firstHalf);
        this.firstHalf.isScoreMismatched = this.verificationService.isMismatchedWarning(this.firstHalf);
        if ((_.isEmpty(this.firstHalf.homeValue) && _.isEmpty(this.firstHalf.awayValue))
            && (isOnload && this.firstHalf.settlementStatusId !== SettlementStatusId.Refund || !isOnload)) {
            this.verificationService.autoFillScore(this.firstHalf);
        }
    }

    public verifyAndAutoFillScore(map: ResultDetail, isOnLoad = false) {
        map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
        const originalQuarter = _.cloneDeep(map);
        this.verificationService.autoFillScore(map);
        if (isOnLoad) {
            this.checkHalfScoreOnLoad();
        } else {
            map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
            if (!_.isEqual(originalQuarter.homeValue, map.homeValue) || !_.isEqual(originalQuarter.awayValue, map.awayValue)) {
                this.adjustHalfTimeScoreOnChange();
                this.adjustFinalScoreOnChange();
            }
        }
    }

    public autofillOutsideSource(externalSourceId: number, isChange = false) {
        const firstHalfResult = this.basketballService.getExternalResults(this.firstHalfResults, externalSourceId);
        const fullTimeResults = this.basketballService.getExternalResults(this.quarterResults, externalSourceId);
        const firstHalf = _.find(this.firstHalf.externalScores.slice(3), item => item.sourceId === externalSourceId);
        const fulltime = _.find(this.fullTime.externalScores.slice(3), item => item.sourceId === externalSourceId);

        if (firstHalf && (this.changeScoreOnQuarter(isChange) || this.onLoadAndCheckScore(isChange, firstHalf))) {
            this.verificationService.sumScoreHalfTime(firstHalfResult, firstHalf);
            this.verifyAndAutoFillScore(this.firstHalf, !isChange);
        }

        if (fulltime && (this.changeScoreOnQuarter(isChange) || this.onLoadAndCheckScore(isChange, fulltime))) {
            this.verificationService.sumScoreFullTime(fullTimeResults, fulltime);
            this.verifyAndAutoFillScore(this.fullTime, true);
        }
    }

    private changeScoreOnQuarter(isChange: boolean) {
        return isChange && !this.match.isScoreDirect;
    }

    private onLoadAndCheckScore(isChange: boolean, externalScores: ExternalResultDetail) {
        return !isChange && !this.verificationService.isExistedHomeAwayScore(externalScores.homeValue, externalScores.awayValue);
    }

    private checkHalfScoreOnLoad() {
        if (this.firstHalf.settlementStatusId === SettlementStatusId.Calculated
            || this.firstHalf.settlementStatusId === SettlementStatusId.Refund) {
            this.firstHalf.isScoreMismatched = this.verificationService.isMismatchedWarning(this.firstHalf);
        } else {
            this.adjustHalfTimeScoreOnChange(true);
        }

        if (this.fullTime.settlementStatusId === SettlementStatusId.Calculated
            || this.fullTime.settlementStatusId === SettlementStatusId.Refund) {
            this.fullTime.isScoreMismatched = this.verificationService.isMismatchedWarning(this.fullTime);
        } else {
            this.adjustFinalScoreOnChange(true);
        }
    }

    public getClass(resultDetail: ResultDetail) {
        let className: string;
        className = this.isFullTimeMismatched() || this.isHalfTimeMismatched() ? 'col-mismatched ' : '';
        if (_.isEqual(resultDetail.resourceId, ResourcesIds.htScore) || _.isEqual(resultDetail.resourceId, ResourcesIds.finalScore)) {
            className = this.verificationService.isFtScoreLowerThanHtScore(this.resultDetails) ? 'not-consistent ' : className;
        }

        return className + this.basketballService.getIntervalBackground(resultDetail.settlementStatusId);
    }

    public isFinalScoreDisabled(resourceId: string, outsideSource = false) {
        return this.isLeader || outsideSource ?
            _.isEqual(resourceId, ResourcesIds.finalScore) || _.isEqual(resourceId, ResourcesIds.htScore)
                ? !this.match.isScoreDirect : this.match.isScoreDirect : true;
    }

    public isFullTimeMismatched() {
        return this.verificationService.isFullTimeMismatched(this.quartersWithoutHalfTime, this.match.isScoreDirect,
            ResourcesIds.finalScore, true);
    }

    private isHalfTimeMismatched() {
        return this.verificationService.isHalfTimeMismatched(this.resultDetails, this.firstHalfResults, this.match.isScoreDirect);
    }

    public isSaveScoreDisabled() {
        return !this.resultDetails.find((map) => map.checked);
    }

    public saveScore() {
        this.confirmationDialogMessage.message = Language.eSports.saveScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doSaveScore();
        });
    }

    private async doSaveScore() {
        const scoresToSave = this.verificationService.getChangedScores(this.resultDetails, this.match.originalResultDetail);
        const checkedScores = this.verificationService.getOutsideScores(this.resultDetails);
        const query: SaveScoreQuery = {
            matchId: this.match.matchDetail.matchId,
            scoresToSave,
            checkedScores,
            apiKey: BasketballApiKeys.normalMatch
        };

        const result = await this.aioService.saveScore(query);
        if (!result.isSuccessful) {
            this.toastrService.error(result.errMsg);
        } else {
            this.resultDetails.forEach((map) => {
                map.checked = false;
            });
        }
    }

    public getTextTooltip(text: string, maxLength: number) {
        return text?.length > maxLength ? text : null;
    }

    public calculate() {
        this.toastrService.clear();
        this.match.isClickOnCalculate = true;
        const existResultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund
            && !_.isEqual(item.resourceId, ResourcesIds.ot));
        if (_.isEmpty(this.selectedResources)) {
            this.toastrService.error(Language.NotSelectCalculationTypeMessage);
        } else if (!_.isNil(existResultConfirmed)) {
            this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
        } else if (this.verificationService.isInputScoreInvalid(this.selectedResources, this.match.isScoreDirect)) {
            this.toastrService.error(this.isLeader ? Language.sop.leader.blankScore : Language.sop.nonLeader.blankScore);
        } else if (this.verificationService.isFtScoreLowerThanHtScore(this.selectedResources)) {
            this.toastrService.error(Language.inconsistentValues);
        } else if (this.verificationService.verifyIntervalsCalculated(this.firstHalf, this.firstHalfResults, this.match.isScoreDirect)
            || this.verificationService.verifyIntervalsCalculated(this.fullTime, this.quartersWithoutOverTime, this.match.isScoreDirect)) {
            this.toastrService.error(Language.IntervalWarning);
        } else {
            this.verifyRunningOdds();
        }
    }

    private async verifyRunningOdds() {
        const selectedResourceIds = this.getOddResources();
        const errorMessage = await this.aioService.checkingNoRunningOdds(this.match.matchDetail.matchId,
            selectedResourceIds, CalculateAction.calculate);
        if (_.isNil(errorMessage)) {
            this.verifyScoreSourcesAndCalculate();
        } else {
            this.toastrService.error(errorMessage);
        }
    }

    private getOddResources() {
        return this.selectedResources.filter(item => !_.isEqual(item.resourceId, ResourcesIds.ot)).map(item => item.resourceId);
    }

    private verifyScoreSourcesAndCalculate() {
        if (this.verificationService.allMapHaveScoreSources(this.resultDetails)) {
            this.confirmCalculateMismatchScores();
        } else {
            if (!this.isLeader) {
                this.toastrService.error(Language.eSports.nonLeader.insufficientSources);
            } else {
                this.confirmationDialogMessage.message = Language.eSports.leader.insufficientSources;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    this.confirmCalculateMismatchScores();
                });
            }
        }
    }

    private confirmCalculateMismatchScores() {
        if (this.verificationService.isExistMismatchScore(this.resultDetails)) {
            if (!this.isLeader) {
                this.toastrService.error(Language.eSports.nonLeader.mismatchedScore);
            } else {
                this.confirmationDialogMessage.message = Language.eSports.leader.mismatchedScore;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    this.confirmChangedResults();
                });
            }
        } else {
            this.confirmChangedResults();
        }
    }

    private async confirmChangedResults() {
        if (this.isReSettledTickets) {
            this.confirmCalculation(this.selectedResources);
        } else {
            const getBasketballResultQuery = {
                matchId: this.match.matchDetail.matchId,
                apikey: BasketballApiKeys.normalMatch,
                sportType: SportType.basketBall,
            };
            const noOverTime = this.selectedResources.filter((quarter) => !_.isEqual(quarter.resourceId, ResourcesIds.ot));
            const needConfirm = await this.aioService.verifyChangedSettledTickets(noOverTime, getBasketballResultQuery);
            if (needConfirm) {
                this.confirmationDialogMessage.message = Language.recalculateNotification;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    this.isReSettledTickets = true;
                });
            } else {
                this.confirmCalculation(this.selectedResources);
            }
        }
    }

    private confirmCalculation(resultDetails: ResultDetail[]) {
        this.confirmationDialogMessage.message = this.basketballService.confirmationMessage(resultDetails);
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doCalculation(this.selectedResources);
        });
    }

    private doCalculation(selectedResources: ResultDetail[]) {
        selectedResources.forEach((item) => {
            item.homeValue = (Number(item.homeValue)).toString();
            item.awayValue = (Number(item.awayValue)).toString();
        });

        const betStatus = this.basketballService.getBetStatus(false, this.match, this.resultDetails);
        this.doSaveScoreAndCalculate(CalculateAction.calculate, selectedResources, betStatus);
    }

    private async doSaveScoreAndCalculate(type: string, resources: ResultDetail[], betStatus: string) {
        const scoresToSave = this.verificationService.getChangedScores(this.resultDetails, this.match.originalResultDetail);
        const checkedScores = this.verificationService.getOutsideScores(this.resultDetails);
        const saveScoreQuery: SaveScoreQuery = {
            matchId: this.match.matchDetail.matchId,
            scoresToSave,
            checkedScores,
            apiKey: BasketballApiKeys.normalMatch
        };

        const saveScoreResult = await this.aioService.saveScore(saveScoreQuery);
        if (!saveScoreResult.isSuccessful) {
            this.toastrService.error(saveScoreResult.errMsg);
        } else {
            const query = new SettleQuery(this.match.matchDetail.matchId, resources, type, this.isReSettledTickets,
                betStatus, this.match.isScoreDirect);
            query.isLeader = this.isLeader;
            const getTicketInfos = await this.getTicketInfo(query);
            const result = await this.aioService.push(query);
            if (result.isSuccessful) {
                this.undoVoidBet(getTicketInfos);
                this.calculateHedgeMatch(query);
            } else {
                this.toastrService.error(result.errMsg);
            }

        }
    }

    public changeScore(map: ResultDetail) {
        map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
        if (!this.match.isScoreDirect) {
            this.verificationService.sumScoreHalfTime(this.firstHalfResults, this.firstHalf);
            this.verificationService.sumScoreFullTime(this.quarterResults, this.fullTime);
            this.fullTime.isScoreMismatched = this.verificationService.isMismatchedWarning(this.fullTime);
            this.firstHalf.isScoreMismatched = this.verificationService.isMismatchedWarning(this.firstHalf);
        }
    }

    private async sendRequest(type: string, resource: ResultDetail[], betStatus: string): Promise<void> {
        const query = new SettleQuery(this.match.matchDetail.matchId, resource, type, this.isReSettledTickets,
            betStatus, this.match.isScoreDirect);
        const getTicketInfos = await this.getTicketInfo(query);
        const result = await this.aioService.push(query);
        if (result.isSuccessful) {
            this.undoVoidBet(getTicketInfos);
            this.calculateHedgeMatch(query);
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async getTicketInfo(query: SettleQuery) {
        const getTicketQuery = new GetTicketInfoQuery(query, true);
        return await this.aioService.getTicketInfo(getTicketQuery) as VoidBetInfo[];
    }

    private async undoVoidBet(voidBetInfos: VoidBetInfo[]) {
        if (voidBetInfos.length > 0) {
            const voidBetQuery = new VoidBetQuery(this.matchDetail, true, voidBetInfos);
            await this.aioService.voidBet(voidBetQuery);
        }
    }

    private calculateHedgeMatch(query: SettleQuery) {
        const matchId = query.matchId;
        const hedgeMatchId = this.applyHedgeMatch
            ? this.match.hedgeMatchDetail.matchId : 0;
        if (hedgeMatchId > 0) {
            query.matchId = hedgeMatchId;
            this.aioService.push(query).then(() => {
                this.messageBoxService.closePopup();
            });
        } else {
            this.messageBoxService.closePopup();
        }
    }

    public uncalculate() {
        this.toastrService.clear();
        if (_.isEmpty(this.selectedResources)) {
            this.toastrService.error(Language.NotSelectUncalculationTypeMessage);
        } else {
            this.confirmUncalculation();
        }
    }

    private confirmUncalculation() {
        this.match.isClickOnCalculate = false;
        this.confirmationDialogMessage.message = Language.UncalculationConfirmMessage;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doUncalculation();
        });
    }

    private doUncalculation() {
        this.selectedResources.forEach((item) => {
            item.homeValue = "";
            item.awayValue = "";
        });
        const betStatus = this.basketballService.getBetStatus(true, this.match, this.resultDetails);

        this.sendRequest(CalculateAction.unCalculate, this.selectedResources, betStatus);
    }

    public selectedOnMap(quarter: ResultDetail) {
        this.match.isClickOnCalculate = false;
        this.isDisabledUndo = this.basketballService.isDisabledUndoButton(this.resultDetails);
        if (quarter.resourceId === ResourcesIds.htScore && quarter.checked) {
            this.verificationService.verifyScore(quarter, true, this.match.isScoreDirect, this.resultDetails);
        }

        if (quarter.resourceId === ResourcesIds.finalScore) {
            if (quarter.checked) {
                this.verificationService.verifyScore(quarter, false, this.match.isScoreDirect, this.resultDetails);
            }
            if (!this.match.isScoreDirect) {
                this.overTime.checked = quarter.checked;
            }
        }
    }

    public onResettleCheckboxChange(isChecked: boolean) {
        this.isReSettledTickets = isChecked;
    }

    public disableCheckbox(resultDetail: ResultDetail) {
        return this.match.isScoreDirect
            && !_.isEqual(resultDetail.resourceId, ResourcesIds.htScore) && !_.isEqual(resultDetail.resourceId, ResourcesIds.finalScore);
    }

    private resetHomeAway(resultDetails: ResultDetail[]) {
        resultDetails.forEach((map) => {
            map.homeValue = map.settlementStatusId === SettlementStatusId.Refund ? "" : map.homeValue;
            map.awayValue = map.settlementStatusId === SettlementStatusId.Refund ? "" : map.awayValue;
        });
    }

    public changeInputDirectly() {
        this.quarterResults.forEach((map) => {
            map.checked = false;
        });

        if (!this.match.isScoreDirect) {
            this.overTime.checked = this.fullTime.checked;
        }
    }

    public isErrorOnVerification(resultDetail: ResultDetail, score: string, remainingScore: string) {
        let disabled = this.match.isScoreDirect;
        let isScoreEmpty = _.isEmpty(score);
        if (_.isEqual(resultDetail.resourceId, ResourcesIds.htScore) || _.isEqual(resultDetail.resourceId, ResourcesIds.finalScore)) {
            disabled = !this.match.isScoreDirect;
        }

        if (_.isEqual(resultDetail.resourceId, ResourcesIds.ot)) {
            isScoreEmpty = _.isEmpty(score) && !_.isEmpty(remainingScore);
        }

        return this.match.isClickOnCalculate && !disabled && resultDetail.checked && isScoreEmpty;
    }

    public disableTextBox(resourceId: string) {
        if (this.match.isScoreDirect) {
            return !_.isEqual(resourceId, ResourcesIds.htScore) && !_.isEqual(resourceId, ResourcesIds.finalScore);
        }

        return _.isEqual(resourceId, ResourcesIds.finalScore) || (_.isEqual(resourceId, ResourcesIds.htScore));
    }

    public getTextBoxClass(resourceId: string) {
        if (resourceId === ResourcesIds.finalScore) {
            return 'final-score-input';
        }

        if (resourceId === ResourcesIds.htScore) {
            return 'ht-score-input';
        }

        return 'quarter-input';
    }

    public getTextBoxMaxLength(resourceId: string) {
        return (resourceId === ResourcesIds.finalScore || resourceId === ResourcesIds.htScore) ? 3 : 2;
    }

    public isConfirmed(resultDetail: ResultDetail) {
        if (_.isEqual(resultDetail.resourceId, ResourcesIds.ot)) {
            return this.match.permission.isLeader && this.fullTime.resultSettingData.isConfirmedRefund;
        } else {
            return this.match.permission.isLeader && resultDetail.resultSettingData.isConfirmedRefund;
        }
    }
}