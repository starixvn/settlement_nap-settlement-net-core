import { EarlyCommonModule } from './../../shared/modules/early-common.module';
import { ExternalSourceNamePipe } from './../../shared/pipes/external-source-name.pipe';
import * as _ from 'lodash';
import { CalculateAction, ResultStatusId, SportType, TicketStatusText } from '../../shared/constants';
import { Component, Injector, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { BasketballApiKeys, EarlyResourcesIds, KickOffTime, ResultStatus } from '../constants';
import { BasketballService, BetStatusService, EarlyService, VerificationService } from '../services';
import { Language } from '../../shared/language.native';
import { Match, SettleQuery } from '../models';
import { MessageBoxService, AioService, BlockUIService } from '../../shared/services';
import { ResultDetail, SportTemplate } from '../../shared/models/sportsbook-sop';
import { EarlyBaseComponent } from '../../shared/components/sportsbook-sop/early-base.component';
import { MatchDetailComponent } from './match-detail.component';
import { NewMultipleSelectComponent } from '../../shared/components/multiple-select/multiple-select.component';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';

@Component({
    selector: 'early-settlement',
    templateUrl: './early-settlement.component.html',
    standalone: true,
    imports: [EarlyCommonModule, MatchDetailComponent, NewMultipleSelectComponent, ExternalSourceNamePipe],
    providers: [EarlyService, VerificationService, BasketballService, ResourceNameByIdPipe, BetStatusService  ]
})
export class EarlySettlementComponent extends EarlyBaseComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    private earlyService: EarlyService;
    public blockUI = true;
    public match: Match;
    public isShowRefundButton = false;
    public isReadyMatch: boolean;

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

    public initService(){
        this.earlyService = this.injector.get(EarlyService);
        this.aioService = this.injector.get(AioService);
        this.messageBoxService = this.injector.get(MessageBoxService);
        this.verificationService = this.injector.get(VerificationService);
        this.toastrService = this.injector.get(ToastrService);
        this.injector.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI  = event);
        this.toastrService.overlayContainer = this.toastContainer;
    }

    public init() {
        this.matchDetail = this.match.matchDetail;
        this.matchId = this.match.matchDetail.matchId;
        this.resultDetails = _.filter(this.match.resultDetails, item => item.resourceId.length > 2);
        this.verificationService.generateExternalScores(this.match, this.resultDetails, SportType.basketBall);
        this.resetResult(this.resultDetails);
        this.autoFillResultOnLoad(this.resultDetails);
        this.groupMap = this.earlyService.getGroupMap(this.resultDetails);
        this.match.originalResultDetail = _.cloneDeep(this.resultDetails);
        this.hideTicketWaiting(this.groupMap);
        this.renderFilterSelect();
    }

    public hasNoneOption(betType: string) {
        return !_.isEqual(EarlyResourcesIds.fullTime[0], betType);
    }

    private renderFilterSelect() {
        this.ticketsStatusSelect.items = this.earlyService.renderTicketStatus();
        this.resultStatusSelect.items = this.earlyService.renderResultStatus(this.match.permission);
        this.resultTypeSelect.items = this.earlyService.renderResultType(this.groupMap);
        this.resultTypeSelect.maxWidth = '150px';
        this.ticketsStatusSelect.maxWidth = '92px';
        this.resultStatusSelect.maxWidth = '120px';
    }

    private resetResult(resultDetails: ResultDetail[]) {
        resultDetails.forEach((map) => {
            map.homeValue = map.resultStatusId !== ResultStatusId.ManualCompleted ? "" : map.homeValue;
            map.awayValue = map.resultStatusId !== ResultStatusId.ManualCompleted ? "" : map.awayValue;
        });
    }

    public calculate() {
        this.toastrService.clear();
        const existResultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund);
        if (!_.isNil(existResultConfirmed)) {
            this.toastrService.error(Language.confirmRefund.calculateResultNotConfirmed);
        } else if (this.verifyBeforeCalculation(this.selectedResources)) {
            const selectedResourceIds = this.selectedResources.map(item => item.resourceId);
            this.verifyRunningOdds(selectedResourceIds, () => this.verifyScoreSourcesAndCalculate(() => this.confirmChangedResults()));
        }
    }

    private verifyBeforeCalculation(selectedResultDetail: ResultDetail[]) {
        this.earlyService.verifyResultValueForBetType(selectedResultDetail);
        const isInValid = this.earlyService.isInValidResultValue(selectedResultDetail);

        if (isInValid) {
            this.toastrService.error(this.permission.isLeader ? Language.sop.leader.blankResult : Language.sop.nonLeader.blankResult);
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
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            const query = new SettleQuery(this.match.matchDetail.matchId,
                this.selectedResources,
                CalculateAction.earlyCalculate,
                this.isReSettledTickets,
                this.matchDetail.betStatus);
            query.isLeader = this.permission.isLeader;
            this.doSaveResult(CalculateAction.calculate,
                this.match.originalResultDetail,
                this.resultDetails,
                BasketballApiKeys.normalMatch, () => {
                    this.push(query);
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
            const query = new SettleQuery(this.match.matchDetail.matchId,
                this.selectedResources,
                CalculateAction.earlyUnCalculate,
                this.isReSettledTickets,
                this.match.matchDetail.betStatus);
            query.isLeader = this.permission.isLeader;
            this.push(query);
        });
    }

    public async refund() {
        this.toastrService.clear();
        if (this.verificationService.isPinGoalMatch(this.matchDetail.leagueGroupId) || this.allResultConfirmed()) {
            this.checkMarkedTickets(this.selectedResources, () => this.createQueryRefundAndPush());
        } else {
            this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
        }
    }

    private createQueryRefundAndPush() {
        const query = new SettleQuery(this.match.matchDetail.matchId,
            this.selectedResources,
            CalculateAction.earlyRefund,
            this.isReSettledTickets,
            this.match.matchDetail.betStatus);
        query.isLeader = this.permission.isLeader;
        this.push(query);
    }

    private async push(query: SettleQuery) {
        const result = await this.aioService.push(query);
        if (result.errCode === 0) {
            this.messageBoxService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }


    public saveResult() {
        this.confirmationDialogMessage.message = Language.eSports.saveScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doSaveResult('', this.match.originalResultDetail, this.resultDetails, BasketballApiKeys.normalMatch, () => { });
        });
    }

    public canSettleResult(result: ResultDetail) {
        const isRunning = _.isEqual(result.ticketStatus, TicketStatusText.running)
            || _.isEqual(result.resultStatus, ResultStatus.noResult) || _.isEqual(result.resultStatus, ResultStatus.running);
        return isRunning && !result.isScoreMismatched && this.verificationService.isExistInHouseResult(result);
    }
}