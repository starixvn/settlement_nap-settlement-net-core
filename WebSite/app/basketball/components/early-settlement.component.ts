import { EarlyCommonModule } from './../../shared/modules/early-common.module';
import { ExternalSourceNamePipe } from './../../shared/pipes/external-source-name.pipe';
import * as _ from 'lodash';
import { CalculateAction, ScoreSourceType, SettlementStatusId, SportType, TicketStatusText } from '../../shared/constants';
import { Component, Injector, ViewChild, ViewChildren, QueryList, inject } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { BasketballApiKeys, EarlyResourcesIds, KickOffTime, Resources, ResourcesIds, ResultStatus } from '../constants';
import { BasketballService, BetStatusService, EarlyService, VerificationService, MixMultiStatsService } from '../services';
import { Language } from '../../shared/language.native';
import { Match } from '../models';
import { BlockUIService, DialogBoxService } from '../../shared/services';
import { GroupMap, ResultDetail, SettleQuery, SportTemplate } from '../../shared/models/sportsbook-sop';
import { EarlyBaseComponent } from '../../shared/components/sportsbook-sop/early-base.component';
import { MatchDetailComponent } from './match-detail.component';
import { NewMultipleSelectComponent } from '../../shared/components/multiple-select/multiple-select.component';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';
import { EarlyStore } from '../store/early.store';
import { ResultRowComponent } from './early/result-row.component';
import { ResourceSupportSDTPipe } from '../pipes/resource-support-sdt.pipe';
import { MatDialog } from '@angular/material/dialog';
import { PlayerScoresPageComponent } from './player-scores-page/player-scores-page.component';
import { MixCoreService } from '../services/mix-core.service';
import { MixDoubleDoubleService } from '../services/mix-double-double.service';
import { MixHeadHeadService } from '../services/mix-head-head.service';
import { AutoFillPlayerService } from '../services/auto-fill-player.service';
import { MixMultiStatsCalculateService } from '../services/mix-multi-stats-calculate.service';
import { MixDoubleDoubleCalculateService } from '../services/mix-double-double-calculate.service';
import { MixHeadHeadCalculateService } from '../services/mix-head-head.service.calculate';
import { MixPerformanceCalculateService } from '../services/performance-calculate/mix-performance-calculate.service';
import { PerformanceAutoFillFactory } from '../services/performance-calculate/PerformanceAutoFillFactory';
import { PerformanceOnlyStrategy } from '../services/performance-calculate/PerformanceOnlyStrategy';
import { PerformanceAndTotalScoreStrategy } from '../services/performance-calculate/PerformanceAndTotalScoreStrategy';
import { PerformanceAndTeamWinStrategy } from '../services/performance-calculate/PerformanceAndTeamWinStrategy';

@Component({
    selector: 'early-settlement',
    templateUrl: './early-settlement.component.html',
    standalone: true,
    imports: [EarlyCommonModule,
        MatchDetailComponent,
        NewMultipleSelectComponent,
        ExternalSourceNamePipe,
        ResultRowComponent,
        ToastContainerDirective,
        ResourceSupportSDTPipe],
    providers: [EarlyService,
        VerificationService,
        BasketballService,
        ResourceNameByIdPipe,
        BetStatusService,
        ToastrService,
        DialogBoxService,
        MixMultiStatsService,
        MixMultiStatsCalculateService,
        MixDoubleDoubleService,
        MixDoubleDoubleCalculateService,
        MixHeadHeadService,
        MixHeadHeadCalculateService,
        MixCoreService, 
        AutoFillPlayerService,
        MixPerformanceCalculateService,
        PerformanceAutoFillFactory,
        PerformanceOnlyStrategy,
        PerformanceAndTotalScoreStrategy,
        PerformanceAndTeamWinStrategy
    ]
})
export class EarlySettlementComponent extends EarlyBaseComponent implements SportTemplate {

    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    @ViewChildren(ResultRowComponent) resultRowComponents: QueryList<ResultRowComponent>;
    private readonly dialog = inject(MatDialog);
    readonly #autoFillPlayerService = inject(AutoFillPlayerService);
    readonly #earlyService = inject(EarlyService);
    readonly #earlyStore = inject(EarlyStore);
    public blockUI = true;
    public match: Match;
    public isReadyMatch: boolean;
    public childResultIds: string[] = [];
    public allowNoTicketStatus = Resources.baseBetTypes;
    public isDisabledSupportInputPlayerScores = false;
    constructor(
        protected injector: Injector,
        protected verificationService: VerificationService) {
        super(injector, verificationService);
    }


    async getMatch(matchId: number): Promise<void> {
        this.initService();
        const matchQuery = {
            matchId,
            sportType: SportType.basketBall,
            settleType: "EAR",
            apiKey: BasketballApiKeys.normalMatch
        };

        this.match = await this.aioService.getMatch(matchQuery) as Match;
        this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;
        this.permission = this.match.permission;
        this.init();
    }

    public get outSideCount() {
        if (this.resultDetails.length === 0) {
            return 0;
        }
        return this.resultDetails[0].externalScores.filter(x =>
            x.sourceId !== ScoreSourceType.trader && x.sourceId >= ScoreSourceType.screenshot).length
    }

    public get maxProviderCol() {
        return this.match.matchDetail.providerCount > 2 ? 3 : 2;
    }
    public initService() {
        this.verificationService = this.injector.get(VerificationService);
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.toastrService.overlayContainer = this.toastContainer;
    }

    public init() {
        this.matchDetail = this.match.matchDetail;
        this.matchId = this.match.matchDetail.matchId;
        this.resultDetails = _.filter(this.match.resultDetails, item => item.resourceId.length > 2);
        const finalResult = this.match.resultDetails.find(result => result.resourceId === ResourcesIds.finalScore);
        this.verificationService.generateExternalScores(this.match, this.resultDetails, SportType.basketBall, this.maxProviderCol);
        this.autoFillResultOnLoad(this.resultDetails);
        this.autoFillConfirmedSDT(this.permission.isLeader, this.match.externalResults, this.resultDetails);
        this.orderResultDetails(this.resultDetails);
        this.#autoFillPlayerService.autoFillPlayerName(this.resultDetails.concat(finalResult));
        this.groupMap = this.#earlyService.getGroupMap(this.resultDetails, this.matchDetail);
        this.match.originalResultDetail = _.cloneDeep(this.resultDetails);
        this.renderFilterSelect();
        this.setIndicateColor();
        this.setRefundButtonWhenExistConfirmedSDT(this.resultDetails);
        this.#earlyStore.setState(this.matchDetail, this.resultDetails, this.permission, this.maxProviderCol);
        this.isDisabledSupportInputPlayerScores = !this.resultDetails.some(item => Resources.orderBetTypes.includes(item.betType));
        
        if (!this.isReadyMatch) {
            this.toastrService.error(Language.minimumPlayTimeNotReached);
        }
    }

    private orderResultDetails(resultDetails: ResultDetail[]) {
        const orderedResults = _.orderBy(resultDetails, [
            (item) => {
                if (Resources.orderBetTypes.includes(item.betType)) {
                    return Resources.orderBetTypes.indexOf(item.betType);
                }

                return 99;
            }
        ], ['asc']);

        resultDetails.splice(0, resultDetails.length, ...orderedResults);
    }

    public hasNoneOption(betType: string) {
        return !_.isEqual(EarlyResourcesIds.fullTime[0], betType);
    }

    private renderFilterSelect() {
        this.ticketsStatusSelect.items = this.#earlyService.renderTicketStatus([{ id: 4, value: "No Ticket", text: "No Ticket", checked: true }]);
        this.resultStatusSelect.items = this.#earlyService.renderResultStatus(this.match.permission);
        this.resultTypeSelect.items = this.#earlyService.renderResultType(this.groupMap);
        this.resultTypeSelect.maxWidth = '150px';
        this.ticketsStatusSelect.maxWidth = '92px';
        this.resultStatusSelect.maxWidth = '120px';
    }

    private setIndicateColor() {
        this.resultDetails.forEach(item => {
            item.resultStatusColor = this.isCompleted(item.resultStatusId, item.settlementStatusId) ? 'calculated'
                : this.isRefunded(item.resultStatusId, item.settlementStatusId) ? 'refunded' : '';
        });
    }

    private setTeamResultSettle(resultDetails: ResultDetail[]) {
        resultDetails.forEach(result => {
            result.homeId = `${this.matchDetail.homeId}`;
            result.awayId = `${this.matchDetail.awayId}`;
        });
    }

    public calculate() {
        this.toastrService.clear();
        const existResultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund || item.resultSettingData.isConfirmedRefundSdt);
        if (!_.isNil(existResultConfirmed)) {
            this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
            return
        } 
        
        if (this.isExistResultEmpty()) {
             this.toastrService.error(this.permission.isLeader ? Language.sop.leader.blankResult : Language.sop.nonLeader.blankResult);
            return;
        }
        
        if(this.permission.isLeader) {
           this.calculateWithLeader();
        } else{
            this.calculateWithNotLeader();
        }
    }

    private calculateWithNotLeader() {
        if (this.isFullTimeNotCalculated()) {
            this.toastrService.error(Language.sop.nonLeader.fullTimeNotSettled);
            return;
        }

        const relatedResourceInValid = this.#earlyService.findRelatedResourceInValid(this.match.resultDetails, this.selectedResources);
        if(!_.isEmpty(relatedResourceInValid)){
            this.toastrService.error(Language.sop.nonLeader.relatedResourceNotAttached.replace('{0}', relatedResourceInValid));
            return;
        } 

        const inconsistentResources = this.#earlyService.isInconsistentWithRelatedResources(this.match.resultDetails, this.selectedResources);
        if (!_.isEmpty(inconsistentResources)) {
            this.toastrService.error(Language.sop.nonLeader.relatedResourceInconsistent.replace('{0}', inconsistentResources));
            return; 
        }
        
        this.proceedCalculationAfterValidation();
    }

    private calculateWithLeader() {
        if (this.isFullTimeNotCalculated()) {
            this.confirmationDialogMessage.message = Language.sop.leader.fullTimeNotSettled;
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.proceedWithLeaderFullTimeNotCalculated();
            });
            return;
        }

        this.proceedWithLeaderFullTimeNotCalculated();
    }

    private proceedWithLeaderFullTimeNotCalculated() {
        const relatedResourceInValid = this.#earlyService.findRelatedResourceInValid(this.match.resultDetails, this.selectedResources);
        if(!_.isEmpty(relatedResourceInValid)){
            this.confirmationDialogMessage.message = Language.sop.leader.relatedResourceNotAttached.replace('{0}', relatedResourceInValid);
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.proceedWithLeaderRelatedResourceInValid();
            });
            return;
        } 

       this.proceedWithLeaderRelatedResourceInValid();
    }

    private proceedWithLeaderRelatedResourceInValid() {
        const inconsistentResources = this.#earlyService.isInconsistentWithRelatedResources(this.match.resultDetails, this.selectedResources);
        if (!_.isEmpty(inconsistentResources)) {
            this.confirmationDialogMessage.message = Language.sop.leader.relatedResourceInconsistent.replace('{0}', inconsistentResources);
            this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                this.proceedCalculationAfterValidation();
            });
            return; 
        }

        this.proceedCalculationAfterValidation();
    }

    private proceedCalculationAfterValidation() {
        const selectedResourceIds = this.selectedResources.map(item => item.resourceId);
        this.verifyRunningOdds(selectedResourceIds, () => this.verifyScoreSourcesAndCalculate(() => this.confirmChangedResults()));
    }

    private isFullTimeNotCalculated() {
        const fullTime = _.find(this.match.resultDetails, (map: ResultDetail) =>
            _.isEqual(map.resourceId, ResourcesIds.finalScore)
        );
        const existGeneratedResult = _.find(this.selectedResources, item => Resources.baseBetTypes.includes(item.betType));
        if (existGeneratedResult) {
            return fullTime.settlementStatusId !== SettlementStatusId.Calculated;
        }

        return false;
    }

    private isExistResultEmpty() {
        return this.selectedResources.some(item => item.homeValue === null || _.isEmpty(item.homeValue));
    }

    private verifyExistResultEmpty() {
        this.#earlyService.verifyResultValueForBetType(this.selectedResources);
        const isInValid = this.#earlyService.isInValidResultValue(this.selectedResources);

        if (isInValid) {
            this.toastrService.error(Language.warningInputScore);
            return false;
        }

        return true;
    }

    private async confirmChangedResults() {
        if (this.isReSettledTickets) {
            this.confirmCalculation(this.selectedResources);
        } else {
            const getEarlyResultQuery = {
                matchId: this.match.matchDetail.matchId,
                apikey: BasketballApiKeys.normalMatch,
                sportType: SportType.basketBall,
            };
            const needConfirm = await this.aioService.verifyChangedSettledTickets(this.selectedResources, getEarlyResultQuery);
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
        this.confirmationDialogMessage.message = this.#earlyService.getConfirmMessage(resultDetails, this.match.matchDetail);
        this.messageBoxService.confirm(this.confirmationDialogMessage, async () => {
            this.setTeamResultSettle(this.selectedResources);
            const query = new SettleQuery(this.match.matchDetail,
                this.selectedResources,
                CalculateAction.earlyCalculate,
                this.isReSettledTickets,
                this.matchDetail.betStatus,
                BasketballApiKeys.settle,
                this.permission.isLeader);

            await this.doSaveResult(CalculateAction.calculate,
                this.match.originalResultDetail,
                this.resultDetails,
                BasketballApiKeys.normalMatch, async () => {
                    await this.push(query);
                });
        });
    }

    public unCalculate() {
        this.getUncalculateMessage();
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.selectedResources.forEach((map) => {
                map.homeValue = "";
                map.awayValue = "";
            });
            const query = new SettleQuery(this.match.matchDetail,
                this.selectedResources,
                CalculateAction.earlyUnCalculate,
                this.isReSettledTickets,
                this.match.matchDetail.betStatus,
                BasketballApiKeys.settle,
                this.permission.isLeader);
            this.push(query);
        });
    }

    public async refund() {
        this.toastrService.clear();
        const allResultConfirmedNormally = this.verificationService.isPinGoalMatch(this.matchDetail.leagueGroupId) || this.allResultConfirmed();
        const allResultConfirmedSdt = this.allResultConfirmedSdt(this.match.externalResults);
        const allResultConfirmed = this.isRefundWithSettleDetermined ? allResultConfirmedSdt : allResultConfirmedNormally;
        if (allResultConfirmed) {
            this.checkMarkedTickets(this.selectedResources, () => this.createQueryRefundAndPush());
        } else {
            this.toastrService.error(this.isRefundWithSettleDetermined ? Language.confirmRefund.sdtErrorMessage : Language.confirmRefund.refundResultNotConfirmed);
        }
    }

    private createQueryRefundAndPush() {
        this.setTeamResultSettle(this.selectedResources);
        const query = new SettleQuery(this.match.matchDetail,
            this.selectedResources,
            CalculateAction.earlyRefund,
            this.isReSettledTickets,
            this.match.matchDetail.betStatus,
            BasketballApiKeys.settle,
            this.permission.isLeader,
            this.isRefundWithSettleDetermined);
        this.push(query);
    }

    private async push(query: SettleQuery) {
        this.generateOtherInfo(this.selectedResources);
        const result = await this.aioService.push(query);
        if (result.errCode === 0) {
            this.messageBoxService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private generateOtherInfo(resultDetails: ResultDetail[]) {
        const playerSelectionInput = 2
        resultDetails.forEach(result => {
            if (_.isUndefined(result.oddFlex) || _.isEqual(result.oddFlex.length, 0)) {
                result.otherInfo = '';
                return;
            }

            if (result.otherInfo) {
                return;
            }

            if (result.inputType === playerSelectionInput) {
                result.otherInfo = result.oddFlex.map(item => `${item.info.playerId},${item.info.teamId}`).join(';');
            } else {
                result.otherInfo = `${result.oddFlex[0].info.playerId},${result.oddFlex[0].info.teamId}`;
            }
        });
    }

    public saveResult() {
        this.confirmationDialogMessage.message = Language.eSports.saveScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doSaveResult('', this.match.originalResultDetail, this.resultDetails, BasketballApiKeys.normalMatch, () => { });
        });
    }

    public onSelectGroupMap(map: GroupMap) {
        super.onChangeGroupMap(map);
    }

    public changeSettingGroup(groupMap: GroupMap) {
        super.changeSettingGroup(groupMap);

    }

    public canSettleResult(result: ResultDetail) {
        const isRunning = _.isEqual(result.ticketStatus, TicketStatusText.running)
            || _.isEqual(result.resultStatus, ResultStatus.noResult)
            || _.isEqual(result.resultStatus, ResultStatus.running);

        return isRunning && !result.isScoreMismatched && this.verificationService.isValidTraderConfirmScore(result, false);
    }

    public updateValue(result: ResultDetail) {
        this.toastrService.clear();
    }

    public confirmRefundBasketBall() {
        this.toastrService.clear();
        if (!this.isRefundWithSettleDetermined) {
            this.confirmRefund();
            return;
        }

        const existResultConfirmedSdt = this.selectedResources.some(result => result.resultSettingData.isConfirmedRefundSdt);
        const isValidResults = this.isResultEligibleForSDT() && (existResultConfirmedSdt || this.verifyExistResultEmpty());
        if (isValidResults) {
            const SDTConfirmMessage = this.#earlyService.getConfirmMessageSDT(this.selectedResources, this.matchDetail);
            this.confirmRefund(SDTConfirmMessage);
        }
    }

    private isResultEligibleForSDT() {
        const allSupportedSDT = this.selectedResources.every(result => Resources.supportSDT.includes(result.betType));
        if (allSupportedSDT) {
            return true;
        }

        this.toastrService.error(Language.confirmRefund.notSupportedSDT);
        return false;
    }

    supportInputPlayerScores() {
        const modalRef = this.dialog.open(PlayerScoresPageComponent, {
            width: '800px',
            height: '800px',
            maxHeight: '800px',
            panelClass: 'tall-dialog',
            data: {
                matchId: this.match.matchDetail.matchId
            }
        });
        
        modalRef.afterClosed().subscribe((result) => {
            if (result && result.hasChanges) {
                window.location.reload();
            }
        });
    }
}