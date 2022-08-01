import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import * as _ from "lodash";
import { EventStatus } from "../../../shared/constants";
import { Language } from "../../../shared/language";
import { ModalDialogMessage } from "../../../shared/models";
import { MessageBoxService } from "../../../shared/services";
import { BetStatus } from "../../constants";
import { FantasyMatch, FantasyMatchDetail, FantasyRelatedMatch, Score } from "./models/match.model";
import { VerifyMatchService } from "./services/verify-match.service";
import { VerifyScoreGoalService } from "./services/verify-score-goal.service";

@Component({
    selector: 'fantasy',
    templateUrl: './fantasy.component.html',
})

export class FantasyComponent implements OnInit {
    @Input() public fantasyMatch: FantasyMatch;
    @Output() public readonly autoFillScore = new EventEmitter<Score>();
    @Output() public readonly errorMsgEmitter = new EventEmitter<string>();
    public fantasyMatchDetail: FantasyMatchDetail;
    public relatedMatches: FantasyRelatedMatch[];
    public isDeleted: boolean;
    private readonly dialogMessage = new ModalDialogMessage();
    constructor(private readonly messageBoxService: MessageBoxService,
        private readonly verifyMatchService: VerifyMatchService,
        private readonly verifyScoreGoalService: VerifyScoreGoalService) {
        this.dialogMessage.title = Language.confirmationBox;
    }

    ngOnInit() {
        this.fantasyMatchDetail = this.fantasyMatch.fantasyMatchDetail;
        this.relatedMatches = this.fantasyMatch.relatedMatches.filter((match) => !match.isDeleted);
        this.isDeleted = this.fantasyMatch.relatedMatches.some((match) => match.isDeleted);
    }

    public isMatchRefunded(match: FantasyRelatedMatch) {
        return !_.isNil(match.betStatus) && (match.betStatus.toLowerCase().includes(BetStatus.refunded)
            || match.betStatus.toLowerCase().includes(BetStatus.abandoned));
    }

    public verifyAndFillFantasyMatch() {
        const homeTeams = this.fantasyMatchDetail.fantasyHomeTeam.split(',');
        const awayTeams = this.fantasyMatchDetail.fantasyAwayTeam.split(',');
        this.errorMsgEmitter.emit('');
        const relatedTeams = _.concat(homeTeams, awayTeams);
        if (this.verifyMatchService.isRelatedMatchesInsufficient(relatedTeams, this.relatedMatches)) {
            this.errorMsgEmitter.emit(Language.fantasyMatch.insufficientRelatedMatches);
        } else if (this.verifyMatchService.isExistHoldMatch(this.relatedMatches)) {
            this.dialogMessage.message = Language.fantasyMatch.confirmAutoFillOnHoldMatch;
            this.messageBoxService.confirm(this.dialogMessage, () => {
                this.confirmAutoFillScore(homeTeams, awayTeams);
            });
        } else {
            this.confirmAutoFillScore(homeTeams, awayTeams);
        }
    }

    private confirmAutoFillScore(homeTeams: string[], awayTeams: string[]) {
        const isExistNotCalculatedMatch = _.some(this.relatedMatches, (match) =>
            !_.isEqual(match.eventStatus.toLowerCase(), EventStatus.completed.toLowerCase()) || this.isMatchRefunded(match));
        if (isExistNotCalculatedMatch) {
            this.errorMsgEmitter.emit(Language.fantasyMatch.warningMatchNotCalculated);
        } else {
            this.dialogMessage.message = Language.fantasyMatch.confirmAutoFillFantasyMatch;
            this.messageBoxService.confirm(this.dialogMessage, () => {
                const score = this.verifyScoreGoalService.sumScoreAndAutoFill(homeTeams, awayTeams, this.relatedMatches);
                this.autoFillScore.emit(score);
            });
        }
    }
}