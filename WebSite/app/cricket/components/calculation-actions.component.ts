import { lastValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { CalculationMatchDetailComponent } from './calculation-match-detail.component';
import { Component, ViewChild, Injector } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { MessageBoxService, AioService, BlockUIService } from '../../shared/services';
import { ModalDialogMessage } from '../../shared/models';
import { Language } from '../../shared/language.native';
import { SettlementStatusId, SportType, CalculateAction, ResultStatusId, ScoreSourceType, TicketStatusText, ResultStatus } from '../../shared/constants';
import {
    SettleQuery,
    MatchDetail,
    HedgeMatchDetail,
    Match,
    UpdateSettlementResultHistoryStatus
} from '../models';
import { VerificationService } from '../services';
import { ApiKeys, KickOffTime, Resources, ResourcesIds } from '../constants';
import { ResultDetail, SaveScoreQuery, SportTemplate } from '../../shared/models/sportsbook-sop';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { CalculateCommonModule } from '../../shared/modules/calculate-common.module';
import { ResultByPlayerNamePipe, ResultNameByIdPipe, ResultValuePipe } from '../pipes';
import { IntervalBackgroundPipe } from '../../shared/pipes/interval-background.pipe';
import { SettleChildMatchQuery } from '../../shared/models/settle-childmatch.model';

@Component({
    selector: 'calculation-actions',
    templateUrl: 'calculation-actions.component.html',
    standalone: true,
    imports: [CommonModule, CalculateCommonModule, ResultByPlayerNamePipe, ResultValuePipe, ResultNameByIdPipe, IntervalBackgroundPipe, CalculationMatchDetailComponent],
    providers: [ResultNameByIdPipe, VerificationService, VerificationBaseService]
})
export class CalculationActionsComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    private messageBoxService: MessageBoxService;
    private verificationService: VerificationService;
    private aioService: AioService;
    private verificationBaseService: VerificationBaseService;
    private toastrService: ToastrService;
    private resultNameByIdPipe: ResultNameByIdPipe;
    public blockUI = true;
    public match: Match;
    public hedgeMatchDetail: HedgeMatchDetail;
    public applyHedgeMatch: boolean;
    public isReSettledTickets: boolean;
    public matchDetail: MatchDetail;
    public isPressedCalculate: boolean;
    public isReadyMatch: boolean;
    public isLeader: boolean;
    public isTrader: boolean;
    public canCalculate: boolean;
    public canUncalculate: boolean;
    public isDisabledUnCalculate: boolean;
    public readonly confirmationDialogMessage: ModalDialogMessage = new ModalDialogMessage();
    public SOURCE_ID = ScoreSourceType;

    constructor(private readonly injector: Injector) {
        this.confirmationDialogMessage.title = Language.confirmationBox;
    }

    async getMatch(matchId: number): Promise<void> {
        this.initService();
        const matchQuery = {
            matchId,
            apikey: ApiKeys.NormalMatch,
            settleType: "MNL"
        };

        this.toastrService.overlayContainer = this.toastContainer;

        this.match = await this.aioService.getMatch(matchQuery) as Match;
        this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;

        this.isLeader = this.match.permission.isLeader;
        this.isTrader = this.match.permission.isTrader;
        this.canCalculate = this.match.permission.canCalculate;
        this.canUncalculate = this.match.permission.canUncalculate;

        this.match.resultDetails.forEach((map) => {
            if (map.settlementStatusId === SettlementStatusId.Calculated) {
                map.originalHomeValue = _.clone(map.homeValue);
                map.originalAwayValue = _.clone(map.awayValue);
            } else {
                map.originalHomeValue = '0';
                map.originalAwayValue = '0';
            }
        });
        this.match.resultDetails = _.orderBy(this.match.resultDetails, (map) => map.ordNo);
        this.init();
    }

    private initService() {
        this.messageBoxService = this.injector.get(MessageBoxService);
        this.verificationService = this.injector.get(VerificationService);
        this.aioService = this.injector.get(AioService);
        this.verificationBaseService = this.injector.get(VerificationBaseService);
        this.toastrService = this.injector.get(ToastrService);
        this.resultNameByIdPipe = this.injector.get(ResultNameByIdPipe)
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.toastrService.overlayContainer = this.toastContainer;
    }

    private init() {
        this.matchDetail = this.match.matchDetail;
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail != null;
        this.verificationBaseService.generateExternalScores(this.match, this.match.resultDetails, SportType.cricket,this.maxProviderCol);
        this.match.originalResultDetail = _.cloneDeep(this.match.resultDetails);
        this.resetHomeAway(this.match.resultDetails);
        this.autoFillScoreOnLoad(this.match.resultDetails);
        this.isDisabledUnCalculate = this.verificationService.isDisableUncalculate(this.match.resultDetails);
    }

    public get selectedResources(): ResultDetail[] {
        return _.filter(this.match.resultDetails, (map: ResultDetail) => map.checked);
    }

    public get matchWinner(): ResultDetail {
        return _.find(this.match.resultDetails, item => _.isEqual(item.resourceId, ResourcesIds.final));
    }
    
      public get outSideCount() {
        return this.match.resultDetails[0].externalScores.filter(x => 
          x.sourceId !== ScoreSourceType.trader && x.sourceId >= ScoreSourceType.screenshot).length
      }
    
      public get maxProviderCol() {
        return this.match.matchDetail.providerCount > 2 ? 3 : 2;
      }

    private resetHomeAway(resultDetails: ResultDetail[]) {
        resultDetails.forEach((map) => {
            map.homeValue = map.settlementStatusId === SettlementStatusId.Refund ? "" : map.homeValue;
            map.awayValue = map.settlementStatusId === SettlementStatusId.Refund ? "" : map.awayValue;
        });
    }

    public onResettleCheckboxChange(isChecked: boolean) {
        this.isReSettledTickets = isChecked;
    }

    public isErrorOnVerification(resultDetail: ResultDetail) {
        if (resultDetail.resourceId === ResourcesIds.final) {
            return this.isPressedCalculate && resultDetail.checked && (!resultDetail.homeValue || !resultDetail.awayValue);
        }
        return this.isPressedCalculate && resultDetail.checked && !resultDetail.homeValue;
    }

    public selectToProceed() {
        this.isPressedCalculate = false;
        this.isDisabledUnCalculate = this.verificationService.isDisableUncalculate(this.match.resultDetails);
    }

    public calculate() {
        this.toastrService.clear();
        this.isPressedCalculate = true;
        const existResultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund);
        if (_.isEmpty(this.selectedResources)) {
            this.toastrService.error(Resources.UnSelectedMapForCalculation);
        } else if (!_.isNil(existResultConfirmed)) {
            this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
        } else if (this.verificationService.invalidInputScore(this.selectedResources)) {
            this.toastrService.error(this.isLeader ? Language.sop.leader.blankScore : Language.sop.nonLeader.blankScore);
        } else {
            this.verifyRunningOdds();
        }
    }

    private async verifyRunningOdds() {
        const selectedResourceIds = this.selectedResources.map(item => item.resourceId);
        const errorMessage = await this.aioService.checkingNoRunningOdds(this.match.matchDetail.matchId,
            selectedResourceIds, CalculateAction.calculate);
        if (_.isNil(errorMessage)) {
            this.verifyScoreSourcesAndCalculate();
        } else {
            this.toastrService.error(errorMessage);
        }
    }

    private verifyScoreSourcesAndCalculate() {
        if (!this.verificationService.allMapHaveScreenshotSource(this.match.resultDetails)) {
            this.toastrService.error(Language.sop.notScreenshot);
            return;
        }

        if (this.verificationService.isExistMismatchedScoreScreenshot(this.match.resultDetails)) {
            this.toastrService.error(Language.sop.mismatchedScreenshot);
            return;
        }

        if (this.verificationService.allMapHaveScoreSources(this.match.resultDetails)) {
            this.confirmCalculateMismatchScores();
        } else {
            if (this.isLeader) {
                this.confirmationDialogMessage.message = Language.eSports.leader.insufficientSources;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    this.confirmCalculateMismatchScores();
                });
            } else {
                this.toastrService.error(Language.eSports.nonLeader.insufficientSources);
            }
        }
    }

    private confirmCalculateMismatchScores() {
        if (this.verificationBaseService.isExistMismatchScore(this.match.resultDetails)) {
            if (this.isLeader) {
                this.confirmationDialogMessage.message = Language.eSports.leader.mismatchedScore;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    this.confirmChangedResults();
                });
            } else {
                this.toastrService.error(Language.eSports.nonLeader.mismatchedScore);
            }
        } else {
            this.confirmChangedResults();
        }
    }

    private async confirmChangedResults() {
        if (this.isReSettledTickets) {
            this.confirmCalculation(this.selectedResources);
        } else {
            const getResultQuery = {
                matchId: this.match.matchDetail.matchId,
                apikey: ApiKeys.NormalMatch,
                sportType: SportType.cricket,
            };
            const needConfirm = await this.aioService.verifyChangedSettledTickets(this.selectedResources, getResultQuery);
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
        this.confirmationDialogMessage.message = this.getConfirmMessage(resultDetails);
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doCalculation(this.selectedResources);
        });
    }

    private getConfirmMessage(resultDetails: ResultDetail[]) {
        let confirmMessage = `${Language.CalculationConfirmMessage}<br/>${Language.CalculationAdditionalConfirmation}<br/>`;
        resultDetails.forEach((x: ResultDetail) => {
            const resourceName = this.resultNameByIdPipe.transform(x.resourceId, this.match.matchDetail);
            const value = `${x.homeValue ? x.homeValue : ''}${x.resourceId === ResourcesIds.final ? '-' + x.awayValue : ''}`;
            confirmMessage += `${resourceName}: ${value}<br/>`;
        });
        return confirmMessage;
    }

    private doCalculation(selectedResources: ResultDetail[]) {
        selectedResources.forEach((item) => {
            item.homeValue = (Number(item.homeValue)).toString();
            item.awayValue = _.isEmpty(item.awayValue) ? '' : (Number(item.awayValue)).toString();
        });

        this.setTeamResultSettle(selectedResources);

        this.doSaveScore(CalculateAction.calculate, () => {
            this.sendRequest(selectedResources);
        });
    }

    private setTeamResultSettle(resultDetails: ResultDetail[]) {
        resultDetails.forEach(result => {
            result.homeId = `${this.match.matchDetail.homeId}`;
            result.awayId = `${this.match.matchDetail.awayId}`;
        });
    }

    private async sendRequest(resource: ResultDetail[]): Promise<void> {
        const settleQuery = new SettleQuery(this.match.matchDetail.matchId, resource, CalculateAction.calculate,
            this.isReSettledTickets, this.isLeader, false);

        const result = await this.aioService.push(settleQuery);
        if (result.isSuccessful) {
            await this.handleChildMatch(settleQuery, result.childMatchIds, result.settledSessionId);
            const resultSettleHedge = await this.settleHedgeMatch(settleQuery);
            result.hasResultAmendment && await this.handleUpdateSettlementResultHistoryStatus(settleQuery, result.settledSessionId);
            if (!_.isEmpty(resultSettleHedge)) {
                this.toastrService.error(result.errMsg);
                return;
            }
            this.messageBoxService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async settleHedgeMatch(settleQuery: SettleQuery) {
        const hedgeMatchId = this.applyHedgeMatch ? this.match.hedgeMatchDetail.matchId : 0;
        let errMsg = "";
        if (hedgeMatchId > 0) {
            settleQuery.matchId = hedgeMatchId;
            settleQuery.isHedgeMatch = true;
            const result = await this.aioService.push(settleQuery);

            if (!result.isSuccessful) {
                errMsg = result.errMsg
            }
        }
        return errMsg;
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
        this.isPressedCalculate = false;
        this.confirmationDialogMessage.message = Language.UncalculationConfirmMessage;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doUncalculation();
        });
    }

    private async doUncalculation() {
        const selectedResources = _.filter(this.match.resultDetails, (item) => item.checked);
        selectedResources.forEach((item) => {
            item.homeValue = "";
            item.awayValue = "";
        });

        const query = new SettleQuery(this.match.matchDetail.matchId, selectedResources, CalculateAction.unCalculate,
            this.isReSettledTickets, this.isLeader, false);


        const result = await this.aioService.push(query);
        if (!result.isSuccessful) {
            this.toastrService.error(result.errMsg);
            return;
        }

        await this.handleChildMatch(query, result.childMatchIds, result.settledSessionId);
        const resultSettleHedge = await this.settleHedgeMatch(query);
        if (!_.isEmpty(resultSettleHedge)) {
            this.toastrService.error(result.errMsg);
            return;
        }
        this.messageBoxService.closePopup();

    }

    private async handleUpdateSettlementResultHistoryStatus(settleQuery: SettleQuery, sessionId: string) {
        const query = new UpdateSettlementResultHistoryStatus(settleQuery.matchId, sessionId)
        await this.aioService.updateSettlementResultHistoryStatus(query);
    }

    private async handleChildMatch(settleQuery: SettleQuery, childMatchIds: string, parentSessionId: string) {
        if (!_.isEmpty(childMatchIds)) {
            const settleChildMatchQuery = new SettleChildMatchQuery(childMatchIds, settleQuery.selectedResources,
                settleQuery.actionName, settleQuery.isReSettledTickets);

            settleChildMatchQuery.sportType = settleQuery.sportType;
            settleChildMatchQuery.parentSessionId = parentSessionId;

            await this.aioService.pushChildMatch(settleChildMatchQuery);
        }
    }

    public getTextTooltip(text: string, maxLength: number) {
        return text?.length > maxLength ? text : null;
    }

    public isSaveScoreDisabled() {
        return !this.match.resultDetails.find((map) => map.checked);
    }

    public saveScore() {
        this.toastrService.clear();
        this.confirmationDialogMessage.message = Language.eSports.saveScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doSaveScore('', () => { });
        });
    }

    private async doSaveScore(type: string, func: () => void) {
        const scoresToSave = this.verificationBaseService.getChangedScores(this.match.resultDetails, this.match.originalResultDetail);
        const checkedScores = this.verificationBaseService.getOutsideScores(this.match.resultDetails);
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

    public autoFillScoreOnLoad(resultDetails: ResultDetail[]) {
        _.forEach(resultDetails, (map) => {
            if (map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted) {
                map.homeValue = '';
                map.awayValue = '';
            }
            map.isScoreMismatched = this.verificationService.isMismatchedWarning(map, map.resourceId === ResourcesIds.final);
            if (map.settlementStatusId !== SettlementStatusId.Refund) {
                this.verificationService.autoFillScore(map, map.resourceId === ResourcesIds.final);
            }
        });
    }

    public verifyAndAutoFillScore(map: ResultDetail) {
        if (map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted) {
            map.homeValue = '';
            map.awayValue = '';
        }
        map.isScoreMismatched = this.verificationService.isMismatchedWarning(map, map.resourceId === ResourcesIds.final);
        this.verificationService.autoFillScore(map, map.resourceId === ResourcesIds.final);
        map.isScoreMismatched = this.verificationService.isMismatchedWarning(map, map.resourceId === ResourcesIds.final);
    }

    public checkMapIsMatched(map: ResultDetail) {
        map.isScoreMismatched = this.verificationService.isMismatchedWarning(map, map.resourceId === ResourcesIds.final);
    }

    public async saveTraderScore() {
        this.toastrService.clear();
        this.confirmationDialogMessage.message = Language.eSports.traderScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doSaveTraderScore();
        });
    }

    private async doSaveTraderScore() {
        const scoresToSave = this.verificationBaseService.getChangedTraderScores(this.match.resultDetails, this.match.originalResultDetail);
        const checkedScores = this.verificationBaseService.getTraderScores(this.match.resultDetails);
        const query = {
            matchId: this.match.matchDetail.matchId,
            scoresToSave,
            checkedScores,
            apiKey: ApiKeys.NormalMatch,
            isTrader: true
        };

        const result = await this.aioService.saveScore(query);
        if (result.isSuccessful) {
            this.match.resultDetails.forEach((map) => {
                map.checked = false;
            });
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    public changeTraderScore(map: ResultDetail) {
        if (this.canCalculate || this.canUncalculate) {
            if (map.resultStatusId !== ResultStatusId.ManualCompleted && map.resultStatusId !== ResultStatusId.AutoCompleted) {
                map.homeValue = '';
                map.awayValue = '';
            }
            map.isScoreMismatched = this.verificationService.isMismatchedWarning(map, map.resourceId === ResourcesIds.final);
            this.verificationService.autoFillScore(map, map.resourceId === ResourcesIds.final);
            map.isScoreMismatched = this.verificationService.isMismatchedWarning(map, map.resourceId === ResourcesIds.final);
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
}