import { FormsModule } from '@angular/forms';
import { Component, inject, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { ChildMatch, FantasyRelatedMatch, HedgeMatchDetail, Match, MatchDetail, Score, UndoChecking } from './models/match.model';
import { Soccer } from '../soccer.model';
import { RequestService } from './services/request.service';
import { VerifyMatchService } from './services/verify-match.service';
import { TimeMinute, LeagueGroup } from './models/constant.native';
import * as _ from 'lodash';
import { TicketStatusText, BackgroundColor, SettlementStatusId, ResultStatusId } from '../../../shared/constants';
import { ClosePopupService, HttpRequestService, MessageBoxService } from '../../../shared/services';
import { ModalDialogMessage } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { InstantCalculationQuery, SettleQuery, UncalculateFullTimeQuery } from './models/query.model';
import { VerifyActionService } from './services/verify-action.service';
import { VerifyScoreGoalService } from './services/verify-score-goal.service';
import { VerificationBaseService } from '../../services/verification-base.service';
import { ResourceIds } from '../../constants';
import { ResultDetail } from '../../models';
import { CalculationActionComponent } from './calculation-action.component';
import { CommonModule } from '@angular/common';
import { CalculateStorage } from '../../storage/calculate.storage';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
import { FantasyComponent } from './fantasy.component';
import { NotReadyMatchComponent } from '../../../shared/components/not-ready-match/not-ready-match.component';
import { RefundChildMatchComponent } from './refund-child-match.component';
import { MatchDetailComponent } from '../common/match-detail.component';
import { MatTooltip } from '@angular/material/tooltip';
import { SoccerTicketCountComponent } from './soccer-ticket-count.component';
import { CalculateService } from './services/calculate.service';
import { ScoreService } from './services/score.service';
import { GoalHistoryComponent } from './goal-history.component';
import { GoalRecordWithSemicolonService } from './services/goal-record-with-semicolon.service';

@Component({
    selector: 'calculation',
    templateUrl: './calculation.component.html',
    standalone: true,
    imports: [
        CalculationActionComponent,
        ResettleCheckerComponent,
        NotReadyMatchComponent,
        FantasyComponent,
        RefundChildMatchComponent,
        MatchDetailComponent,
        SoccerTicketCountComponent,
        GoalHistoryComponent,
        MatTooltip,
        CommonModule,
        FormsModule,
        ToastContainerModule],
    providers: [
        VerifyMatchService,
        HttpRequestService,
        RequestService,
        ClosePopupService,
        VerifyActionService,
        VerifyScoreGoalService,
        VerificationBaseService,
        CalculateStorage,
        CalculateService,
        ScoreService,
        GoalRecordWithSemicolonService 
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
    public matchDetail: MatchDetail;
    public dialogMessage = new ModalDialogMessage();
    constructor() {
        this.dialogMessage.title = Language.confirmationBox;
    }

    private readonly requestService = inject(RequestService);
    private readonly verifyMatchService = inject(VerifyMatchService);
    private readonly messageBoxService = inject(MessageBoxService);
    private readonly closePopupService = inject(ClosePopupService);
    #storage = inject(CalculateStorage);

    async getMatch(matchId: number) {
        this.#storage.setToastrOverlay(this.toastContainer);
        this.match = await this.requestService.getMatch(matchId);
        this.#storage.setMatch(this.match);
        this.matchDetail = this.match.matchDetail;
        this.isMatchReady = this.isReadyToSettle(this.matchDetail);
        this.childMatches = this.match.childMatches;
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.applyHedgeMatch = this.hedgeMatchDetail != null && !this.hedgeMatchDetail.isUndecided;
        this.matchDetail.originalGoalRecord = this.matchDetail.goalRecord;
        this.relatedMatches = this.matchDetail.isFantasyMatch
            ? this.match.fantasyMatch.relatedMatches.filter((match) => !match.isDeleted)
            : []
    }

    private isReadyToSettle(matchDetail: MatchDetail) {
        return this.verifyMatchService.isCompletedMatch(matchDetail) || this.verifyMatchService.isInstantMatch(matchDetail)
            || this.verifyMatchService.isEndFirstHalf(matchDetail) || this.verifyMatchService.isPinGoal(matchDetail);
    }

    public onResettleCheckboxChange(checked: boolean) {
        this.#storage.setIsResettleTicket(checked);
    }

     get isReSettledTickets() {
        return this.#storage.getIsResettleTicket();
    }

    private get isPinGoal() {
        return this.matchDetail.leagueGroupId === LeagueGroup.pinGoal;
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
        this.matchDetail.halfTimeHomeScore = event.halfTimeHomeScore.toString();
        this.matchDetail.halfTimeAwayScore = event.halfTimeAwayScore.toString();
        this.matchDetail.finalHomeScore = event.finalHomeScore.toString();
        this.matchDetail.finalAwayScore = event.finalAwayScore.toString();
    }

    changeApplyHedgeMatch(){
        this.#storage.setIsAppleHedgeMatch(this.applyHedgeMatch);
    }
}
