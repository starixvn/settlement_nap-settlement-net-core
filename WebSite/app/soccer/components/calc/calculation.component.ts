import { Component, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastrService } from 'ngx-toastr';
import { ChildMatch, FantasyRelatedMatch, HedgeMatchDetail, Match, MatchDetail, Score, UndoChecking } from './models/match.model';
import { Soccer } from '../soccer.model';
import { RequestService } from './services/request.service';
import { VerifyMatchService } from './services/verify-match.service';
import { TimeMinute, LeagueGroup } from './models/constant.native';
import * as _ from 'lodash';
import { TicketStatusText, BackgroundColor, CalculateAction, SettlementStatusId, ResultStatusId } from '../../../shared/constants';
import { ClosePopupService, MessageBoxService } from '../../../shared/services';
import { ModalDialogMessage } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { InstantCalculationQuery, SettleQuery, UncalculateFullTimeQuery } from './models/query.model';
import { VerifyActionService } from './services/verify-action.service';
import { VerifyScoreGoalService } from './services/verify-score-goal.service';
import { VerificationBaseService } from '../../services/verification-base.service';
import { BetStatus, ResourceIds } from '../../constants';
import { ResultDetail } from '../../models';

@Component({
    selector: 'calculation',
    templateUrl: './calculation.component.html',
    providers: [
        VerifyMatchService,
        RequestService,
        ClosePopupService,
        VerifyActionService,
        VerifyScoreGoalService,
        VerificationBaseService
    ]
})
export class CalculationComponent implements Soccer {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    public match: Match;
    public relatedMatches: FantasyRelatedMatch[];
    public childMatches: ChildMatch[];
    public hedgeMatchDetail: HedgeMatchDetail;
    public applyHedgeMatch: boolean;
    public isMatchReady: boolean;
    public isReSettledTickets: boolean;
    public matchDetail: MatchDetail;
    public dialogMessage = new ModalDialogMessage();
    constructor(
        private readonly requestService: RequestService,
        private readonly verifyMatchService: VerifyMatchService,
        private readonly messageBoxService: MessageBoxService,
        private readonly closePopupService: ClosePopupService,
        private readonly verifyActionService: VerifyActionService,
        private readonly toastrService: ToastrService) {
        this.dialogMessage.title = Language.confirmationBox;
    }

    async getMatch(matchId: number) {
        this.toastrService.overlayContainer = this.toastContainer;
        this.match = await this.requestService.getMatch(matchId);
        this.matchDetail = this.match.matchDetail;
        this.isMatchReady = this.isReadyToSettle(this.matchDetail);
        this.childMatches = this.match.childMatches;
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail != null && !this.hedgeMatchDetail.isUndecided;
        this.matchDetail.originalGoalRecord = this.matchDetail.goalRecord;
    }

    public getErrorMsg(value: string) {
        if (!_.isEmpty(value)) {
            this.toastrService.error(value);
        } else {
            this.toastrService.clear();
        }
    }

    private isReadyToSettle(matchDetail: MatchDetail) {
        return this.verifyMatchService.isCompletedMatch(matchDetail) || this.verifyMatchService.isInstantMatch(matchDetail)
            || this.verifyMatchService.isEndFirstHalf(matchDetail) || this.verifyMatchService.isPinGoal(matchDetail);
    }

    public onResettleCheckboxChange(checked: boolean) {
        this.isReSettledTickets = checked;
    }

    private get isPinGoal() {
        return this.matchDetail.leagueGroupId === LeagueGroup.pinGoal;
    }

    private get selectedChildMatches() {
        return _.filter(this.childMatches, item => item.checked);
    }

    private get selectedChildMatchIds() {
        return this.selectedChildMatches.map(item => item.matchId).join(",");
    }

    public get isDisableCalculate() {
        const flag = (this.matchDetail.isInstant || this.matchDetail.hasInstantCompleted)
            && this.matchDetail.playTime <= TimeMinute.firstHalf && this.matchDetail.confirmHT === 0;

        return this.isPinGoal ? false : flag;
    }

    public get halftimeTicketStatusBackground() {
        return this.getTicketStatusBackground(this.matchDetail.htStatus);
    }

    public get fullTimeTicketStatusBackground() {
        return this.getTicketStatusBackground(this.matchDetail.ftStatus);
    }

    private getTicketStatusBackground(status: string) {
        return _.isEqual(status, TicketStatusText.calculated)
            ? BackgroundColor.calculated
            : _.isEqual(status, TicketStatusText.marked) ? BackgroundColor.backgroundMarked : "";
    }
    public get isDisableFulltimeCalculate() {
        const flag = this.matchDetail.playTime <= TimeMinute.firstHalf
            || this.matchDetail.isHtOnly || _.isEqual(this.matchDetail.htStatus, TicketStatusText.running);

        return this.isPinGoal ? false : flag;
    }

    public get isDisableUncalculateFT() {
        const resultHalfTime = _.find(this.match.resultDetails, item => item.resourceId === ResourceIds.halfTime) ?? new ResultDetail();
        return !(_.isEqual(resultHalfTime.resultStatusId, ResultStatusId.ManualCompleted)
            || _.isEqual(resultHalfTime.resultStatusId, ResultStatusId.AutoCompleted));
    }
    public get isDisableFulltimeTextbox() {
        return this.isPinGoal ? false : this.matchDetail.isHtOnly;
    }

    public autoFillFantasyMatch(event: Score) {
        this.matchDetail.halfTimeHomeScore = event.halfTimeHomeScore;
        this.matchDetail.halfTimeAwayScore = event.halfTimeAwayScore;
        this.matchDetail.finalHomeScore = event.finalHomeScore;
        this.matchDetail.finalAwayScore = event.finalAwayScore;
    }

    public async calculateHalfTime() {
        this.resetAllWarning();
        const errorMessage = await this.verifyActionService.verifyFirstHalf(this.matchDetail);

        if (_.isEmpty(errorMessage)) {
            this.confirmHalftime();
        } else {
            this.toastrService.error(errorMessage);
        }
    }

    private async confirmHalftime() {
        const needConfirm = await this.verifyActionService.isScoreChangedFirstHalf(this.matchDetail, this.isReSettledTickets);
        if (needConfirm) {
            this.autoCheckedReSettledTickets();
        } else {
            this.dialogMessage.message = Language.doubleCheckCalculateHalfTime;
            this.messageBoxService.confirm(this.dialogMessage, () => {
                this.dialogMessage.message = Language.checkAgainCalculateHalfTime;
                this.messageBoxService.confirm(this.dialogMessage, () => {
                    this.doCalculate(CalculateAction.calculateHalfTime);
                });
            });
        }
    }

    public async calculateFullTime() {
        this.resetAllWarning();
        const errorMessage = await this.verifyActionService.verifyFullTime(this.matchDetail, this.selectedChildMatches);
        if (_.isEmpty(errorMessage)) {
            this.confirmFullTime();
        } else {
            this.toastrService.error(errorMessage);
        }
    }

    private async confirmFullTime() {
        const needConfirm = await this.verifyActionService.isScoreChangedFullTime(this.matchDetail, this.isReSettledTickets);
        if (needConfirm) {
            this.autoCheckedReSettledTickets();
        } else {
            const confirmRefundMessage = this.selectedChildMatches.length > 0
                ? Language.soccer.confirmAutoRefundChildMatch : "";

            this.dialogMessage.message = `${Language.doubleCheckCalculateFullTime}${confirmRefundMessage}`;
            this.messageBoxService.confirm(this.dialogMessage, () => {
                this.dialogMessage.message = Language.checkAgainCalculateFullTime;
                this.messageBoxService.confirm(this.dialogMessage, () => {
                    this.doCalculate(CalculateAction.calculateFullTime);
                });
            });
        }
    }

    public async calculateAll() {
        this.resetAllWarning();
        const errorMessage = await this.verifyActionService.verifyAll(this.matchDetail, this.selectedChildMatches);
        if (_.isEmpty(errorMessage)) {
            this.confirmAll();
        } else {
            this.toastrService.error(errorMessage);
        }
    }

    private async confirmAll() {
        const needConfirm = await this.verifyActionService.isScoreChangedAll(this.matchDetail, this.isReSettledTickets);
        if (needConfirm) {
            this.autoCheckedReSettledTickets();
        } else {
            const confirmRefundMessage = this.selectedChildMatches.length > 0
                ? Language.soccer.confirmAutoRefundChildMatch : "";

            this.dialogMessage.message = `${Language.doubleCheckCalculateAll}${confirmRefundMessage}`;
            this.messageBoxService.confirm(this.dialogMessage, () => {
                this.dialogMessage.message = Language.checkAgainCalculateAll;
                this.messageBoxService.confirm(this.dialogMessage, () => {
                    this.doCalculate(CalculateAction.calculate);
                });
            });
        }
    }

    public async unCalculate() {
        this.resetAllWarning();
        this.dialogMessage.message = Language.UncalculationConfirmMessage;
        this.messageBoxService.confirm(this.dialogMessage, () => {
            this.dialogMessage.message = Language.checkAgainUnSettleConfirmation;
            this.messageBoxService.confirm(this.dialogMessage, () => {
                this.doCalculate(CalculateAction.unCalculate);
            });
        });
    }

    public async unCalculateFT() {
        this.resetAllWarning();
        const betStatus = this.matchDetail.betStatus?.toLocaleLowerCase();
        const resultHalfTime = _.find(this.match.resultDetails, item => item.resourceId === ResourceIds.halfTime) ?? new ResultDetail();
        if (_.includes(betStatus, BetStatus.abandoned1H)
            || (_.includes(betStatus, `${BetStatus.refunded};`) && _.isEqual(resultHalfTime.settlementStatusId, SettlementStatusId.Refund))) {
            this.toastrService.error(Language.CannotUncalculateFTMessage);
        } else {
            this.confirmUnCalcFt();
        }
    }

    public async unCalcInstant() {
        this.resetAllWarning();
        const matchId = this.matchDetail.matchId;
        const result = await this.requestService.undoCheckingScore(matchId);
        const errorMessage = result.errMsg;
        if (_.isEmpty(errorMessage)) {
            this.confirmUnCalcInstant(matchId, result);
        } else {
            this.toastrService.error(errorMessage);
        }
    }

    private confirmUnCalcFt() {
        this.dialogMessage.message = Language.UncalculateFTConfirmMessage;
        this.messageBoxService.confirm(this.dialogMessage, () => {
            this.dialogMessage.message = Language.checkAgainUncalculateFTConfirmation;
            this.messageBoxService.confirm(this.dialogMessage, () => {
                this.doUnCalculateFt();
            });
        });
    }

    private async confirmUnCalcInstant(matchId: number, scoreResult: UndoChecking) {
        const currentScore = `${scoreResult.homeScore}-${scoreResult.awayScore}`;
        const halfTime = scoreResult.isHt ? "(HT)" : "(FT)";
        const goalRecord = _.isEmpty(scoreResult.goalRecord) ? "" : scoreResult.goalRecord.toUpperCase();
        const message = `${Language.soccer.confirmUnCalcInstant} <b>${currentScore} [${goalRecord}] ${halfTime}</b>`;

        this.dialogMessage.message = message;
        this.messageBoxService.confirm(this.dialogMessage, async () => {
            const query = new InstantCalculationQuery(matchId, scoreResult);
            const result = await this.requestService.pushInstantScore(query);
            if (result.isSuccessful) {
                this.closePopupService.closePopup();
            } else {
                this.toastrService.error(result.errMsg);
            }
        });
    }

    private resetAllWarning() {
        this.matchDetail.isWarningHalfTimeHomeScore = false;
        this.matchDetail.isWarningHalfTimeAwayScore = false;
        this.matchDetail.isWarningFinalHomeScore = false;
        this.matchDetail.isWarningFinalAwayScore = false;
        this.matchDetail.isWarningGoalRecord = false;
        this.toastrService.clear();
    }

    private autoCheckedReSettledTickets() {
        this.dialogMessage.message = Language.recalculateNotification;
        this.messageBoxService.confirm(this.dialogMessage, () => {
            this.isReSettledTickets = true;
        });
    }

    private async doCalculate(actionName: string) {
        const childMatchIds = _.isEmpty(this.childMatches) || _.isEqual(actionName, CalculateAction.calculateHalfTime)
            ? null : (_.isEmpty(this.selectedChildMatchIds) ? '0' : this.selectedChildMatchIds);
        const hedgeMatchId = this.applyHedgeMatch ? this.hedgeMatchDetail.matchId : 0;
        const query = new SettleQuery(this.matchDetail, hedgeMatchId, actionName, this.isReSettledTickets, childMatchIds);
        const result = await this.requestService.calculate(query);
        if (result.isSuccessful) {
            await this.alertMessageToLetstalkForFastMarket(this.matchDetail.matchId, actionName);
            this.closePopupService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }

    private async alertMessageToLetstalkForFastMarket(matchId: number, actionName: string) {
        if(_.includes([CalculateAction.calculateFullTime, CalculateAction.calculate], actionName)) {
            await this.requestService.alertMessageToLetstalkForFastMarket(matchId, actionName);
        }
    }

    private async doUnCalculateFt() {
        const hedgeMatchId = this.applyHedgeMatch ? this.hedgeMatchDetail.matchId : 0;
        const query = new UncalculateFullTimeQuery(this.matchDetail, this.match.resultDetails, hedgeMatchId);
        const result = await this.requestService.unCalculateFt(query);
        if (result.isSuccessful) {
            this.closePopupService.closePopup();
        } else {
            this.toastrService.error(result.errMsg);
        }
    }
}
