import { EarlyCommonModule } from './../../shared/modules/early-common.module';
import { PipesModule } from './../../shared/pipes/pipes.module.native';
import { Component, Injector, ViewChild } from '@angular/core';
import { ToastContainerDirective } from 'ngx-toastr';
import { Match, SettleQuery } from '../models';
import { ResultDetail, ExternalResultDetail, SportTemplate, HedgeMatchDetail } from '../../shared/models/sportsbook-sop';
import * as _ from 'lodash';
import { Language } from '../../shared/language.native';
import { ResultControlGroup, Resources, TicketStatus, ApiKeys, ResultStatus, ResultControl, KickOffTime } from '../constants';
import { BlockUIService } from '../../shared/services';
import { ResultStatusId, CalculateAction, SportType } from '../../shared/constants';
import { EarlyConstraintService, VerificationService, ESportsService } from '../services';
import { EarlyBaseComponent } from '../../shared/components/sportsbook-sop/early-base.component';
import { MatchDetailComponent } from './match-detail.component';
import { NotReadyMatchComponent } from '../../shared/components/not-ready-match/not-ready-match.component';
import { VerificationBaseService } from '../../core/services/verification-base.service';
import { ResourceNameByIdPipe } from '../pipes/resource-name-by-id.pipe';

@Component({
    selector: 'early-settlement',
    templateUrl: './early-settlement.component.html',
    standalone: true,
    imports: [EarlyCommonModule, PipesModule, MatchDetailComponent,
        NotReadyMatchComponent],
    providers: [
        EarlyConstraintService,
        VerificationBaseService,
        VerificationService,
        ESportsService,
        ResourceNameByIdPipe],
})
export class EarlySettlementComponent extends EarlyBaseComponent implements SportTemplate {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    private earlyConstraintService: EarlyConstraintService;
    private eSportsService: ESportsService;
    public blockUI = true;
    public match: Match;
    public matchClone: Match;
    public isShowRefundButton = false;
    public oldMatchDetail: HedgeMatchDetail;
    public isSettleOldMatch: boolean;
    public isReadyMatch: boolean;

    constructor(
        protected verificationService: VerificationService,
        protected inject: Injector,
    ) {
        super(inject, verificationService);
    }

    async getMatch(matchId: number): Promise<void> {
        this.initService();
        const matchQuery = {
            matchId,
            settleType: "EAR",
            apiKey: ApiKeys.NormalMatch
        };
        this.match = await this.aioService.getMatch(matchQuery) as Match;
        this.init();
    }

    public initService(){
        this.verificationService = this.inject.get(VerificationService);
        this.eSportsService = this.inject.get(ESportsService);
        this.earlyConstraintService = this.inject.get(EarlyConstraintService);
        this.inject.get(BlockUIService).blockUIEvent.subscribe((event: boolean) => this.blockUI = event);
        this.toastrService.overlayContainer = this.toastContainer;
    }

    private init() {
        const maxLength = 2;
        this.matchClone = _.cloneDeep(this.match);
        this.matchDetail = this.match.matchDetail;
        this.isReadyMatch = this.match.matchDetail.playTime >= KickOffTime.playTime;
        this.matchId = this.match.matchDetail.matchId;
        this.oldMatchDetail = this.match.oldMatchDetail;
        this.isSettleOldMatch = this.oldMatchDetail != null;
        this.match.resultDetails = this.match.resultDetails.filter((map) => map.resourceId.length > maxLength);
        this.resultDetails = this.match.resultDetails;
        this.resetResult(this.match.resultDetails);
        this.verificationService.generateExternalScores(this.match, this.match.resultDetails, SportType.eSports);
        this.match.originalResultDetail = _.cloneDeep(this.match.resultDetails);
        this.autoFillResultOnLoad(this.match.resultDetails);
        this.groupMap = this.earlyConstraintService.getGroupMap(this.match.resultDetails);
        this.permission = this.match.permission;
        this.renderFilterSelect();
    }

    private renderFilterSelect() {
        this.ticketsStatusSelect.items = this.earlyConstraintService.renderTicketStatus();
        this.resultStatusSelect.items = this.earlyConstraintService.renderResultStatus(this.match.permission);
        this.ticketsStatusSelect.maxWidth = '108px';
        this.resultStatusSelect.maxWidth = '144px';
    }

    private resetResult(resultDetails: ResultDetail[]) {
        resultDetails.forEach((map) => {
            map.groupBetType = this.earlyConstraintService.getBetTypeGroup(map.betType);
            map.homeValue = map.resultStatusId !== ResultStatusId.ManualCompleted ? "" : map.homeValue;
            map.awayValue = map.resultStatusId !== ResultStatusId.ManualCompleted ? "" : map.awayValue;
            map.homeName = this.eSportsService.getResultByTeamName(map.homeValue, this.match.matchDetail, map.groupBetType);
            map.awayName = this.eSportsService.getResultByTeamName(map.awayValue, this.match.matchDetail, map.groupBetType);
        });
    }

    public async calculate() {
        this.toastrService.clear();
        const errorMessage = await this.verifyBeforeCalculation();

        if (_.isEmpty(errorMessage)) {
            const selectedResourceIds = this.selectedResources.map(item => item.resourceId);
            this.verifyRunningOdds(selectedResourceIds, () => this.verifyScoreSourcesAndCalculate(() => this.confirmChangedResults()));
        } else {
            this.toastrService.error(errorMessage);
        }
    }

    private async verifyBeforeCalculation() {
        const existResultConfirmed = _.find(this.selectedResources, item => item.resultSettingData.isConfirmedRefund);
        this.earlyConstraintService.verifyResultValueForBetType(this.selectedResources);
        const isInValid = this.earlyConstraintService.isInValidResultValue(this.selectedResources);
        const isInValidDuration = this.earlyConstraintService.isInValidDuration(this.selectedResources);

        if (!_.isNil(existResultConfirmed)) {
            return Language.confirmRefund.calculateResultNotConfirmed;
        } else if (isInValid || isInValidDuration) {
            return isInValid ? this.permission.isLeader
                ? Language.sop.leader.blankResult : Language.sop.nonLeader.blankResult : Resources.InvalidDuration;
        } else {
            return "";
        }
    }

    private async confirmChangedResults() {
        const maxLength = 5;
        const eSportsEarlyResults = this.match.resultDetails.filter((map) => map.resourceId.length > maxLength && map.checked);
        if (this.isReSettledTickets) {
            this.confirmCalculation(eSportsEarlyResults);
        } else {
            const getEarlyResultQuery = {
                matchId: this.match.matchDetail.matchId,
                apikey: ApiKeys.NormalMatch,
                sportType: SportType.eSports,
            };
            const needConfirm = await this.aioService.verifyChangedSettledTickets(eSportsEarlyResults, getEarlyResultQuery);
            if (needConfirm) {
                this.confirmationDialogMessage.message = Language.recalculateNotification;
                this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
                    this.isReSettledTickets = true;
                });
            } else {
                this.confirmCalculation(eSportsEarlyResults);
            }
        }
    }

    private confirmCalculation(resultDetails: ResultDetail[]) {
        this.confirmationDialogMessage.message = this.earlyConstraintService.getConfirmMessage(resultDetails, this.match.matchDetail);
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            const resources = this.match.resultDetails.filter((map) => map.checked);
            const query = new SettleQuery(this.match.matchDetail.matchId,
                resources,
                CalculateAction.earlyCalculate,
                this.isReSettledTickets,
                this.permission.isLeader,
                this.matchDetail.sportType);

            this.doSaveResult(CalculateAction.calculate, this.match.originalResultDetail,
                this.match.resultDetails, ApiKeys.NormalMatch, () => {
                    this.push(query);
                });
        });
    }

    public unCalculate() {
        this.toastrService.clear();
        this.getUncalculateMessage();
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.selectedResources.forEach((map) => {
                map.homeValue = "";
                map.awayValue = "";
            });
            const query = new SettleQuery(this.match.matchDetail.matchId,
                this.selectedResources,
                CalculateAction.earlyUnCalculate,
                this.isReSettledTickets, false, this.matchDetail.sportType);

            this.push(query);
        });
    }
    public async refund() {
        this.toastrService.clear();
        if (this.allResultConfirmed()) {
            this.checkMarkedTickets(this.selectedResources, () => this.createQueryRefundAndPush());
        } else {
            this.toastrService.error(Language.confirmRefund.refundResultNotConfirmed);
        }
    }

    private createQueryRefundAndPush() {
        const query = new SettleQuery(this.match.matchDetail.matchId,
            this.selectedResources,
            CalculateAction.earlyRefund,
            this.isReSettledTickets, false, this.matchDetail.sportType);

        this.push(query);
    }

    private async push(query: SettleQuery) {
        const result = await this.aioService.push(query);
        if (result.errCode === 0) {
            this.pushOldMatch(query);
            this.messageBoxService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async pushOldMatch(query: SettleQuery) {
        const oldMatchId = this.isSettleOldMatch ? this.oldMatchDetail.matchId : 0;
        if (oldMatchId > 0) {
            query.matchId = oldMatchId;
            await this.aioService.push(query);
        }
    }

    public autoFillResultOnLoad(resultDetails: ResultDetail[]) {
        _.forEach(resultDetails, (resultDetail) => {
            this.verifyAndAutoFillResult(resultDetail,true);
        });
    }

    public verifyAndAutoFillResult(resultDetail: ResultDetail,onLoad = false) {
        this.match.matchDetail.isSavedScore = false;
        if (resultDetail.groupBetType === ResultControlGroup.CoupleScores) {
            resultDetail.isScoreMismatched = this.verificationService.isMismatchedWarning(resultDetail);
            this.verificationService.autoFillScore(resultDetail);
            resultDetail.isScoreMismatched = this.verificationService.isMismatchedWarning(resultDetail);
        } else if(resultDetail.groupBetType === ResultControlGroup.Duration) { // TODO
            resultDetail.isScoreMismatched = this.verificationService.isMismatchedDurationWarning(resultDetail,true);
            this.verificationService.autoFillScreenShotScore(resultDetail);
            resultDetail.isScoreMismatched = this.verificationService.isMismatchedDurationWarning(resultDetail,true);
        } else {
            this.verificationService.autoFillEarlyResult(resultDetail);
            resultDetail.isScoreMismatched = this.verificationService.isEarlyMismatchedWarning(resultDetail);
        }
    }

    public checkResultIsMatched(resultDetail: ResultDetail) {
        const isExistedCoupleResult = resultDetail.groupBetType === ResultControlGroup.CoupleScores
        const isExistedDurationResult = resultDetail.groupBetType === ResultControlGroup.Duration
        let isScoreMismatched = false; 
        
        if(isExistedCoupleResult) {
            isScoreMismatched = this.verificationService.isMismatchedWarning(resultDetail)
        } else if(isExistedDurationResult) {
            isScoreMismatched = this.verificationService.isMismatchedDurationWarning(resultDetail,true);
        } else {
            isScoreMismatched = this.verificationService.isEarlyMismatchedWarning(resultDetail)
        }

        resultDetail.isScoreMismatched = isScoreMismatched;
    }

    public saveResult() {
        this.toastrService.clear();
        this.confirmationDialogMessage.message = Language.eSports.saveScore;
        this.messageBoxService.confirm(this.confirmationDialogMessage, () => {
            this.doSaveResult('', this.match.originalResultDetail, this.match.resultDetails, ApiKeys.NormalMatch, () => { });
        });
    }

    public canSettleResult(result: ResultDetail) {
        const isRunning = _.isEqual(result.ticketStatus, TicketStatus.running)
            || _.isEqual(result.resultStatus, ResultStatus.noResult) || _.isEqual(result.resultStatus, ResultStatus.running);
        return isRunning && !result.isScoreMismatched && !_.isNil(this.verificationService.isExistInhouseResult(result));
    }

    public getCoupleScoreMaxLength(item: ResultDetail) {
        return ResultControl.MoneyLine.includes(item.betType) ? 6 : 3;
    }

    public changeSecond(item: ResultDetail | ExternalResultDetail) {
        const maxSecond = 59;
        item.awayValue = Number(item.awayValue) > maxSecond ? Math.floor(Number(item.awayValue) / 10).toString() : item.awayValue;
        this.resetZeroTime(item);
    }

    public changeNegativeMinute(item: ResultDetail | ExternalResultDetail) {
        this.resetZeroTime(item);
    }

    private resetZeroTime(item: ResultDetail | ExternalResultDetail) {
        if (!_.isEqual(item.homeValue, '') && Number(item.homeValue) === 0
            && !_.isEqual(item.awayValue, '') && Number(item.awayValue) === 0) {
            item.homeValue = item.homeValue.replace(/-/g, '');
        }
    }
}