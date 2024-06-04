import { CalculationMatchDetailComponent } from './calculation-match-detail.component';
import { CalculateCommonModule } from './../../shared/modules/calculate-common.module';
import { Component, Injector, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { MessageBoxService, AioService, BlockUIService } from '../../shared/services';
import { ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language.native';
import { CalculateAction, SettlementStatusId, ResultStatusId, SportType, ScoreSourceType, ResultStatus, TicketStatusText } from '../../shared/constants';
import { ApiKeys, Resources, ResourcesIds, KickOffTime } from '../constants';
import { Match, SettleQuery } from '../models';
import { HedgeMatchDetail, ResultDetail, MatchDetail, ExternalResult, SaveScoreQuery, ExternalResultDetail, SportTemplate } from '../../shared/models/sportsbook-sop';
import { VerificationService, ESportsService } from '../services';
import { ResourceNameByIdPipe } from '../pipes';
import { SourceIds } from '../../basketball/constants/source-ids';
import { ProviderSource } from '../../shared/models/league-settings.model';

@Component({
    selector: 'calculation-actions',
    templateUrl: 'calculation-actions.component.html',
    standalone: true,
    imports: [CalculateCommonModule, CalculationMatchDetailComponent, ResourceNameByIdPipe],
    providers: [VerificationService, ESportsService, ResourceNameByIdPipe]
})
export class CalculationActionsComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    private messageBoxService: MessageBoxService;
    private verificationService: VerificationService;
    private eSportsService: ESportsService;
    private aioService: AioService;
    private toastrService: ToastrService;
    public blockUI = true;
    public match: Match;
    public isLeader: boolean;
    public hedgeMatchDetail: HedgeMatchDetail;
    public disableScoreDirect: boolean;
    public isReSettledTickets: boolean;
    public matchDetail: MatchDetail;
    public applyHedgeMatch: boolean;
    public enableUncalculate: boolean;
    public externalResults: ExternalResult[];
    public isScoreDirect: boolean;
    public isMapsOnly: boolean;
    public oldMatchDetail: HedgeMatchDetail;
    public isSettleOldMatch: boolean;
    public isReadyMatch: boolean;
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public SOURCE_ID = SourceIds;

    constructor(private injector: Injector) {
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    async getMatch(matchId: number): Promise<void> {
        this.init();
        const matchQuery = {
            matchId,
            apikey: ApiKeys.NormalMatch,
            settleType: "MNL"
        };

        this.match = await this.aioService.getMatch(matchQuery) as Match;
        this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;

        
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.oldMatchDetail = this.match.oldMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail != null;
        this.isSettleOldMatch = this.oldMatchDetail != null;
        this.matchDetail = this.match.matchDetail;
        this.enableUncalculate = this.verificationService.enableUncalculateButton(this.match.resultDetails);
        this.disableScoreDirect = this.verificationService.hasTicketBetOnMap(this.match.resultDetails);
        this.isLeader = this.match.permission.isLeader;
        this.verificationService.generateExternalScores(this.match, this.match.resultDetails, SportType.eSports, this.maxProviderCol);
        this.resetHomeAway(this.match.resultDetails);
        this.match.originalResultDetail = _.cloneDeep(this.match.resultDetails);
        this.autoFillScoreOnLoad(this.match.resultDetails);
    }

    public init() {
        this.messageBoxService = this.injector.get(MessageBoxService);
        this.verificationService = this.injector.get(VerificationService);
        this.eSportsService = this.injector.get(ESportsService);
        this.aioService = this.injector.get(AioService);
        this.toastrService = this.injector.get(ToastrService);
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.toastrService.overlayContainer = this.toastContainer;
    }

    private resetHomeAway(resultDetails: ResultDetail[]) {
        resultDetails.forEach((map) => {
            map.homeValue = map.settlementStatusId === SettlementStatusId.Calculated ? map.homeValue : "";
            map.awayValue = map.settlementStatusId === SettlementStatusId.Calculated ? map.awayValue : "";
        });
    }

    public get selectedResources(): ResultDetail[] {
        return _.filter(this.match.resultDetails, (map: ResultDetail) => map.checked);
    }

    public get finalResource(): ResultDetail {
        return _.find(this.match.resultDetails, (item: ResultDetail) => _.isEqual(item.resourceId, ResourcesIds.final));
    }
    public get outSideCount() {
        return this.match.resultDetails[0].externalScores.filter(x =>
            x.sourceId !== ScoreSourceType.trader && x.sourceId >= ScoreSourceType.screenshot).length
    }

    public get maxProviderCol() {
        return this.match.matchDetail.providerCount > 2 ? 3 : 2;
    }
    
    public calculate() {
        this.toastrService.clear();
        this.match.isClickOnCalculate = true;
        const existResultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund);
        if (_.isEmpty(this.selectedResources)) {
            this.toastrService.error(Resources.UnSelectedMapForCalculation);
        } else if (!_.isNil(existResultConfirmed)) {
            this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
        } else if (this.verificationService.invalidInputScore(this.selectedResources, this.match.isScoreDirect, "")) {
            this.toastrService.error(this.isLeader ? Language.sop.leader.blankScore : Language.sop.nonLeader.blankScore);
        } else {
            this.verifyRunningOdds();
        }
    }

    public canSettleResult(result: ResultDetail) {
        const isRunning = _.isEqual(result.ticketStatus, TicketStatusText.running)
          || _.isEqual(result.resultStatus, ResultStatus.noResult) 
          || _.isEqual(result.resultStatus, ResultStatus.running);

        return isRunning 
            && !result.isScoreMismatched 
            && this.verificationService.isValidTraderConfirmScore(result);
    }

    private async verifyRunningOdds() {
        const selectedResourceIds = this.selectedResources.map(item => item.resourceId);
        const errorMessage = await this.aioService.checkingNoRunningOdds(this.match.matchDetail.matchId, selectedResourceIds, CalculateAction.calculate);

        if (_.isNil(errorMessage)) {
            this.verifyScoreSourcesAndCalculate();
        } else {
            this.toastrService.error(errorMessage);
        }
    }

    private verifyScoreSourcesAndCalculate() {
        if (!this.verificationService.allMapHaveScreenshotSource(this.selectedResources)) {
            this.toastrService.error(Language.sop.notScreenshot);
            return;
        }

        if (this.verificationService.isExistMismatchedScoreScreenshot(this.selectedResources)) {
            this.toastrService.error(Language.sop.mismatchedScreenshot);
            return;
        }

        if (this.verificationService.allMapHaveScoreSources(this.selectedResources)) {
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
        if (this.verificationService.isExistMismatchScore(this.match.resultDetails)) {
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
        const eSportsResultDetails = _.filter(this.match.resultDetails, { checked: true });
        if (this.isReSettledTickets) {
            this.confirmCalculation(eSportsResultDetails);
        } else {
            const getESportsResultQuery = {
                matchId: this.match.matchDetail.matchId,
                apikey: ApiKeys.NormalMatch,
                sportType: SportType.eSports,
            };
            const needConfirm = await this.aioService.verifyChangedSettledTickets(eSportsResultDetails, getESportsResultQuery);
            if (needConfirm) {
                this.confirmationDialogMessage.message = Language.recalculateNotification;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    this.isReSettledTickets = true;
                });
            } else {
                this.confirmCalculation(eSportsResultDetails);
            }
        }
    }

    private confirmCalculation(resultDetails: ResultDetail[]) {
        this.confirmationDialogMessage.message = this.verificationService.getCalculationConfirmMessage(resultDetails,
            new ResourceNameByIdPipe());
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doCalculation();
        });
    }

    private doCalculation() {
        const query = new SettleQuery(this.match.matchDetail.matchId,
            this.selectedResources,
            CalculateAction.calculate,
            this.isReSettledTickets,
            this.isLeader,
            this.matchDetail.sportType,
            this.isScoreDirect);
        this.doSaveScore(CalculateAction.calculate, () => {
            this.push(query);
        });
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
        const selectedResources = _.filter(this.match.resultDetails, (item) => item.checked);
        selectedResources.forEach((item) => {
            item.homeValue = "";
            item.awayValue = "";
        });

        const query = new SettleQuery(this.match.matchDetail.matchId,
            selectedResources,
            CalculateAction.unCalculate,
            this.isReSettledTickets,
            false,
            this.matchDetail.sportType,
            this.isScoreDirect);
        this.push(query);
    }

    private async push(query: SettleQuery): Promise<void> {
        const result = await this.aioService.push(query);
        if (result.errCode === 0) {
            await this.hedgeMatch(query);
            await this.settleOldMatch(query);
            this.messageBoxService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async hedgeMatch(query: SettleQuery) {
        const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
        if (hedgeMatchId > 0) {
            query.matchId = hedgeMatchId;
            query.isHedgeMatch = true;
            await this.aioService.push(query);
        }
    }

    private async settleOldMatch(query: SettleQuery) {
        const oldMatchId = this.isSettleOldMatch ? this.oldMatchDetail.matchId : 0;
        if (oldMatchId > 0) {
            query.matchId = oldMatchId;
            await this.aioService.push(query);
        }
    }

    public selectedOnMap() {
        this.match.isClickOnCalculate = false;
        this.enableUncalculate = this.verificationService.enableUncalculateButton(this.match.resultDetails);
    }

    public selectedOnFullTime() {
        const newFinalResource = this.verificationService.getNewFinalResource(this.match.resultDetails, ResourcesIds.final, true);
        const confirmMessage = this.verificationService.verifyFinalResource(this.match.resultDetails,
            ResourcesIds.final, newFinalResource, "Full Time score");
        if (!_.isEmpty(confirmMessage) && !this.isMapsOnly && !this.isScoreDirect) {
            this.confirmationDialogMessage.message = confirmMessage;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.verificationService.changeToNewFinalResource(this.finalResource, newFinalResource);
            });
        }
        this.selectedOnMap();
    }

    public onResettleCheckboxChange(isChecked: boolean) {
        this.isReSettledTickets = isChecked;
    }

    public changeScore() {
        const maps = this.match.resultDetails.filter((item) => !_.isEqual(item.resourceId, ResourcesIds.final)
            && this.verificationService.isExistedHomeAwayScore(item.homeValue, item.awayValue));
        if (!this.isScoreDirect && this.matchDetail.bestOfMap > 0) {
            if (maps.length > 0) {
                this.finalResource.homeValue = _.sumBy(maps, (map) => Number(map.homeValue)).toString();
                this.finalResource.awayValue = _.sumBy(maps, (map) => Number(map.awayValue)).toString();
            } else {
                this.finalResource.homeValue = "";
                this.finalResource.awayValue = "";
            }
        }
        this.finalResource.isScoreMismatched = this.verificationService.isMismatchedWarning(this.finalResource);
    }

    public changeInputDirectly() {
        this.match.isScoreDirect = this.isScoreDirect;

        this.match.resultDetails.forEach((map) => {
            map.checked = this.isScoreDirect && _.isEqual(map.resourceId, ResourcesIds.final);
        });
        this.enableUncalculate = this.verificationService.enableUncalculateButton(this.match.resultDetails);
    }

    public isErrorOnVerification(map: ResultDetail, score: string) {
        const disableWarning = _.isEqual(map.resourceId, ResourcesIds.final) && this.matchDetail.bestOfMap > 0
            ? !this.isScoreDirect : this.isScoreDirect;
        return this.match.isClickOnCalculate && !disableWarning && map.checked && _.isEmpty(score);
    }

    public checkMapIsMatched(map: ResultDetail) {
        map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
    }

    public isFullTimeMismatched() {
        return this.verificationService.isFullTimeMismatched(this.match.resultDetails, this.isScoreDirect,
            ResourcesIds.final, true);
    }

    public saveScore() {
        this.toastrService.clear();
        this.confirmationDialogMessage.message = Language.eSports.saveScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doSaveScore('', () => { });
        });
    }

    private async doSaveScore(type: string, func: () => void) {
        const scoresToSave = this.verificationService.getChangedScores(this.match.resultDetails, this.match.originalResultDetail);
        const checkedScores = this.verificationService.getOutsideScores(this.match.resultDetails);
        const query: SaveScoreQuery = {
            matchId: this.match.matchDetail.matchId,
            scoresToSave,
            checkedScores,
            apiKey: ApiKeys.NormalMatch
        };

        const result = await this.aioService.saveScore(query);
        if (result.isSuccessful) {
            if (_.isEqual(type, CalculateAction.calculate)) {
                func();
            } else {
                this.match.resultDetails.forEach((map) => {
                    map.checked = false;
                });
            }
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    public verifyAndAutoFillScore(map: ResultDetail, isOnLoad = false) {
        map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
        const scoreBeforeAutofill = _.cloneDeep(map);
        this.verificationService.autoFillScore(map);
        if (isOnLoad) {
            if (this.finalResource.settlementStatusId === SettlementStatusId.Calculated ||
                this.finalResource.settlementStatusId === SettlementStatusId.Refund) {
                this.finalResource.isScoreMismatched = this.verificationService.isMismatchedWarning(this.finalResource);
            } else {
                this.adjustFinalScoreOnChange(isOnLoad);
            }
        } else {
            map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
            if (!_.isEqual(scoreBeforeAutofill.homeValue, map.homeValue) || !_.isEqual(scoreBeforeAutofill.awayValue, map.awayValue)) {
                this.adjustFinalScoreOnChange();
            }
        }
    }

    public updateOutsideScore(sourceId: number, IsOnLoad = false) {
        const outsideResults: ExternalResultDetail[] = [];
        this.match.resultDetails.forEach((item) => {
            const outsideResult = _.find(item.externalScores, (score) => score.sourceId === sourceId);
            if (outsideResult && !_.isEqual(item.resourceId, ResourcesIds.final)
                && this.verificationService.isExistedHomeAwayScore(outsideResult.homeValue, outsideResult.awayValue)) {
                outsideResults.push(outsideResult);
            }
        });
        const finalResourceOutside = _.find(this.finalResource.externalScores.slice(3), (score) => score.sourceId === sourceId);

        if (finalResourceOutside &&
            (IsOnLoad && !this.verificationService.isExistedHomeAwayScore(finalResourceOutside.homeValue, finalResourceOutside.awayValue))
            || (!IsOnLoad && this.matchDetail.bestOfMap > 0 && !this.match.isScoreDirect && !this.isMapsOnly)) {
            this.verificationService.sumTotalScores(outsideResults, ResourcesIds.mapOne, finalResourceOutside, false);
            this.verifyAndAutoFillScore(this.finalResource, true);
        }
    }

    private adjustFinalScoreOnChange(isOnload = false) {
        this.changeScore();
        if ((_.isEmpty(this.finalResource.homeValue) && _.isEmpty(this.finalResource.awayValue))
            && (isOnload && this.finalResource.settlementStatusId !== SettlementStatusId.Refund || !isOnload)) {
            this.verificationService.autoFillScore(this.finalResource);
        }
    }

    public autoFillScoreOnLoad(resultDetails: ResultDetail[]) {
        const intervals = resultDetails.filter((map) => !_.isEqual(map.resourceId, ResourcesIds.final));
        _.forEach(this.finalResource.externalScores, (score) => {
            this.updateOutsideScore(score.sourceId, true);
        });
        if (intervals.length > 0) {
            _.forEach(intervals, (map) => {
                map.isScoreMismatched = this.verificationService.isMismatchedWarning(map);
                if (map.settlementStatusId !== SettlementStatusId.Refund) {
                    this.verifyAndAutoFillScore(map, true);
                }
            });
        } else {
            this.adjustFinalScoreOnChange(true);
        }
    }

    public isFinalScoreDisabled(last: boolean, outsideSource = false) {
        return this.isLeader || outsideSource ?
            last && this.matchDetail.bestOfMap > 0 ? !this.isScoreDirect && !this.isMapsOnly : this.isScoreDirect : true;
    }

    public isSaveScoreDisabled() {
        return !this.match.resultDetails.find((map) => map.checked);
    }

    public getClass(resultDetail: ResultDetail) {
        const className = this.isFullTimeMismatched() ? 'col-mismatched ' : '';

        return className + this.eSportsService.getIntervalBackground(resultDetail.settlementStatusId);
    }

    public getTextTooltip(text: string, maxLength: number) {
        return text?.length > maxLength ? text : null;
    }
}