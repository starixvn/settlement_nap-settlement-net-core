import { FormsModule } from '@angular/forms';
import { Component, inject, ViewChild } from '@angular/core';
import { ToastContainerDirective, ToastContainerModule, ToastrService } from 'ngx-toastr';
import { ChildMatch, FantasyRelatedMatch, HedgeMatchDetail, Match, MatchDetailSoccer as MatchDetail, Score } from './models/match.model';
import { Soccer } from '../soccer.model';
import { RequestService } from './services/request.service';
import { VerifyMatchService } from './services/verify-match.service';
import * as _ from 'lodash';
import { ClosePopupService, HttpRequestService } from '../../../shared/services';
import { ModalDialogMessage } from '../../../shared/models';
import { Language } from '../../../shared/language.native';
import { VerifyActionService } from './services/verify-action.service';
import { VerifyScoreGoalService } from './services/verify-score-goal.service';
import { VerificationBaseService } from '../../services/verification-base.service';
import { CalculationActionComponent } from './calculation-action.component';
import { CommonModule } from '@angular/common';
import { CalculateStorage } from '../../storage/calculate.storage';
import { ResettleCheckerComponent } from '../../../shared/components/resettle-checker/resettle-checker.component';
import { FantasyComponent } from './fantasy.component';
import { NotReadyMatchComponent } from '../../../shared/components/not-ready-match/not-ready-match.component';
import { RefundChildMatchComponent } from './refund-child-match.component';
import { MatchDetailComponent } from '../common/match-detail.component';
import { MatTooltip } from '@angular/material/tooltip';
import { SoccerTicketCountComponent } from './soccer-ticket-count.component.native';
import { CalculateService } from './services/calculate.service';
import { ScoreService } from './services/score.service';
import { GoalHistoryComponent } from './goal-history.component';
import { GoalRecordWithSemicolonService } from './services/goal-record-with-semicolon.service';
import { VerificationBaseService as sopVerificationService } from '../../../core/services/verification-base.service';

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
        GoalRecordWithSemicolonService,
        sopVerificationService
    ]
})
export class CalculationComponent implements Soccer {
    @ViewChild(ToastContainerDirective, { static: true }) toastContainer: ToastContainerDirective;
    match: Match;
    relatedMatches: FantasyRelatedMatch[];
    childMatches: ChildMatch[];
    hedgeMatchDetail: HedgeMatchDetail;
    applyHedgeMatch: boolean;

    matchDetail: MatchDetail;
    dialogMessage = new ModalDialogMessage();
    constructor() {
        this.dialogMessage.title = Language.confirmationBox;
    }

    private readonly requestService = inject(RequestService);
    private readonly verifyMatchService = inject(VerifyMatchService);
    #storage = inject(CalculateStorage);
    #toastrService = inject(ToastrService);

    async getMatch(matchId: number, filterOver?: string) {
        this.#storage.setToastrOverlay(this.toastContainer);
        this.match = await this.requestService.getMatch(matchId);
        this.#storage.setMatch(this.match, filterOver);
        this.matchDetail = this.match.matchDetail;
        this.#storage.setIsReadyMatch(this.isReadyToSettle(this.matchDetail));
        this.childMatches = this.match.childMatches;
        this.hedgeMatchDetail = this.match.hedgeMatchDetail;
        this.applyHedgeMatch = this.#storage.isApplyHedgeMatch();
        this.matchDetail.originalGoalRecord = this.matchDetail.goalRecord;
        this.relatedMatches = this.matchDetail.isFantasyMatch
            ? this.match.fantasyMatch.relatedMatches.filter((match) => !match.isDeleted)
            : []
        this.#storage.resetHomeAway();

        if(!this.#storage.getIsReadyMatch()) {
           this.#toastrService.error(Language.minimumPlayTimeNotReached);
        }

    }

    private isReadyToSettle(matchDetail: MatchDetail) {

        return this.verifyMatchService.isCompletedMatch(matchDetail) || this.verifyMatchService.isInstantMatch(matchDetail)
            || this.verifyMatchService.isEndFirstHalf(matchDetail) || this.verifyMatchService.isPinGoalOrSaba(matchDetail)
            || this.verifyMatchService.isChildMatch(matchDetail);
    }

    onResettleCheckboxChange(checked: boolean) {
        this.#storage.setIsResettleTicket(checked);
    }

    get isReSettledTickets() {
        return this.#storage.getIsResettleTicket();
    }

    autoFillFantasyMatch(event: Score) {
        this.#storage.setFullTimeScore(event.finalHomeScore.toString(), event.finalAwayScore.toString());
        this.#storage.setHaftTimeScore(event.halfTimeHomeScore.toString(), event.halfTimeAwayScore.toString());
    }

    changeApplyHedgeMatch() {
        this.#storage.setIsAppleHedgeMatch(this.applyHedgeMatch);
    }
}
