import { EarlyCommonModule } from './../../shared/modules/early-common.module';
import { ExternalSourceNamePipe } from './../../shared/pipes/external-source-name.pipe';
import * as _ from 'lodash';
import { CalculateAction, ScoreSourceType, SettlementStatusId, SportType, TicketStatusText } from '../../shared/constants';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, ViewChild, ViewChildren, QueryList, AfterViewInit, inject } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { BasketballApiKeys, EarlyResourcesIds, KickOffTime, Resources, ResourcesIds, ResultStatus } from '../constants';
import { BasketballService, BetStatusService, EarlyService, VerificationService } from '../services';
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
import { PopupService } from '../../multi-sports/services/popup.service';
import { MatDialog } from '@angular/material/dialog';
import { PlayerScoresPageComponent } from './player-scores-page/player-scores-page.component';

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
        PopupService],

})
export class EarlySettlementComponent extends EarlyBaseComponent implements SportTemplate {

    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    @ViewChildren(ResultRowComponent) resultRowComponents: QueryList<ResultRowComponent>;
    private earlyService: EarlyService;
    public blockUI = true;
    public match: Match;
    public isReadyMatch: boolean;
    constructor(
        protected injector: Injector,
        protected verificationService: VerificationService,
        private readonly earlyStore: EarlyStore) {
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
        this.earlyService = this.injector.get(EarlyService);
        this.verificationService = this.injector.get(VerificationService);
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.toastrService.overlayContainer = this.toastContainer;
    }

    public init() {
        this.matchDetail = this.match.matchDetail;
        this.matchId = this.match.matchDetail.matchId;
        this.resultDetails = _.filter(this.match.resultDetails, item => item.resourceId.length > 2);
        this.verificationService.generateExternalScores(this.match, this.resultDetails, SportType.basketBall, this.maxProviderCol);
        this.resetResult(this.resultDetails);
        this.autoFillResultOnLoad(this.resultDetails);
        this.autoFillConfirmedSDT(this.permission.isLeader, this.match.externalResults, this.resultDetails);
        this.orderResultDetails(this.resultDetails);
        this.groupMap = this.earlyService.getGroupMap(this.resultDetails, this.matchDetail);
        this.match.originalResultDetail = _.cloneDeep(this.resultDetails);
        this.renderFilterSelect();
        this.setIndicateColor();
        this.setRefundButtonWhenExistConfirmedSDT(this.resultDetails);
        this.earlyStore.setState(this.matchDetail, this.permission, this.maxProviderCol);

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
        this.ticketsStatusSelect.items = this.earlyService.renderTicketStatus([{ id: 4, value: "No Ticket", text: "No Ticket", checked: true }]);
        this.resultStatusSelect.items = this.earlyService.renderResultStatus(this.match.permission);
        this.resultTypeSelect.items = this.earlyService.renderResultType(this.groupMap);
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

    private resetResult(resultDetails: ResultDetail[]) {
        resultDetails.forEach((map) => {
            map.homeValue = map.settlementStatusId !== SettlementStatusId.Calculated && map.settlementStatusId !== SettlementStatusId.RefundSettleDetermined ? "" : map.homeValue;
            map.awayValue = map.settlementStatusId !== SettlementStatusId.Calculated && map.settlementStatusId !== SettlementStatusId.RefundSettleDetermined ? "" : map.awayValue;
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
        } else if (this.verifyFullTimeResult()) {
            this.toastrService.error(Language.fullTimeNotSettled);
        }
        else if (this.verifyExistResultEmpty() && this.verifyRelatedResources()) {
            const selectedResourceIds = this.selectedResources.map(item => item.resourceId);
            this.verifyRunningOdds(selectedResourceIds, () => this.verifyScoreSourcesAndCalculate(() => this.confirmChangedResults()));
        }
    }

    private verifyFullTimeResult() {
        const fullTime = _.find(this.match.resultDetails, (map: ResultDetail) =>
            _.isEqual(map.resourceId, ResourcesIds.finalScore)
        );
        const existGeneratedResult = _.find(this.selectedResources, item => Resources.baseBetTypes.includes(item.betType));
        if (existGeneratedResult && !this.permission.isLeader) {
            return fullTime.settlementStatusId !== SettlementStatusId.Calculated;
        }
        return false;
    }

    private verifyRelatedResources() {
        const relatedResourceInValid = this.earlyService.FindRelatedResourceInValid(this.match.resultDetails, this.selectedResources);

        if (relatedResourceInValid) {
            this.toastrService.error(Language.sop.relatedResourceNotAttached.replace('{0}', relatedResourceInValid));
            return false;
        }

        return true;
    }

    private verifyExistResultEmpty(isRefund = false) {
        this.earlyService.verifyResultValueForBetType(this.selectedResources);
        const isInValid = this.earlyService.isInValidResultValue(this.selectedResources);

        if (isInValid) {
            this.toastrService.error(isRefund ? Language.warningInputScore : this.permission.isLeader ? Language.sop.leader.blankResult : Language.sop.nonLeader.blankResult);
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
        this.confirmationDialogMessage.message = this.earlyService.getConfirmMessage(resultDetails, this.match.matchDetail);
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

        if (this.resultRowComponents) {
            this.resultRowComponents.forEach(component => {
                component.updateView();
            });
        }
    }

    public changeSettingGroup(groupMap: GroupMap) {
        super.changeSettingGroup(groupMap, () => {
            if (this.resultRowComponents) {
                this.resultRowComponents.forEach(component => {
                    component.updateView();
                });
            }
        });

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
        const isValidResults = this.isResultEligibleForSDT() && (existResultConfirmedSdt || this.verifyExistResultEmpty(true));
        if (isValidResults) {
            const SDTConfirmMessage = this.earlyService.getConfirmMessageSDT(this.selectedResources, this.matchDetail);
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
                height: '715px',
                data: {
                    matchId: this.match.matchDetail.matchId
                }
            });
            modalRef.afterClosed().subscribe((result) => {
            });
        }
}