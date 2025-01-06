import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import * as _ from "lodash";
import { MessageBoxService } from "../../../shared/services";
import { Language } from "../../../shared/language.native";
import { MatchDetail } from "./models/match.model";
import { GoalIconService } from "./services/goal-icon.service";
import { GoalRecordWithOutSemicolonService } from "./services/goal-record-with-out-semicolon.service";
import { GoalRecordWithSemicolonService } from "./services/goal-record-with-semicolon.service";
import { VerifyScoreGoalService } from "./services/verify-score-goal.service";
import { ModalDialogMessage } from "../../../shared/models";
import { CalculateAction } from '../../../shared/constants';
import { LeagueGroup } from "./models/constant.native";

@Component({
    selector: 'calculation-match-detail',
    templateUrl: './calculation-match-detail.component.html',
    providers: [
        GoalIconService,
        GoalRecordWithSemicolonService,
        GoalRecordWithOutSemicolonService,
    ],
})

export class CalculationMatchDetailComponent implements OnInit {
    @Input() public matchDetail: MatchDetail;
    @Output() public readonly scoreChange = new EventEmitter<MatchDetail>();
    @Output() public readonly errorMsgEmitter = new EventEmitter<string>();
    public disableFinal = true;
    public disableGoalRecordCheckbox: boolean;
    private readonly dialogMessage = new ModalDialogMessage();

    constructor(
        private readonly goalIconService: GoalIconService,
        private readonly verifyScoreGoalService: VerifyScoreGoalService,
        private readonly messageBoxService: MessageBoxService) {
        this.dialogMessage.title = Language.confirmationBox;
    }

    ngOnInit() {
        this.matchDetail.applyGoalRecord = this.disableGoalRecordCheckbox = this.matchDetail.isExistFgLg
            || this.matchDetail.isExistHtFgLg || this.matchDetail.isExistResultAndFirstTeamScore
            || this.matchDetail.isEnabledGoalRecordHt || this.matchDetail.isEnabledGoalRecordFt;
        this.changeScore();
        this.enableFinalInput();
    }

    private enableFinalInput() {
        this.disableFinal = this.matchDetail.leagueGroupId === LeagueGroup.pinGoal ? false : this.matchDetail.isHtOnly;
    }

    public goalRecordModelChange(value: string) {
        this.matchDetail.goalRecord = value;
        this.matchDetail.goalIcon = this.goalIconService.generateGoalIcon(this.matchDetail);
    }

    public changeScore() {
        const isExistHt = !this.verifyScoreGoalService.isEmptyScore(this.matchDetail.halfTimeHomeScore)
            && !this.verifyScoreGoalService.isEmptyScore(this.matchDetail.halfTimeAwayScore);

        const isExistFt = !this.verifyScoreGoalService.isEmptyScore(this.matchDetail.finalHomeScore)
            && !this.verifyScoreGoalService.isEmptyScore(this.matchDetail.finalAwayScore);

        const scoreInconsistent = Number(this.matchDetail.halfTimeHomeScore) > Number(this.matchDetail.finalHomeScore)
            || Number(this.matchDetail.halfTimeAwayScore) > Number(this.matchDetail.finalAwayScore);

        this.matchDetail.isScoreInconsistent = isExistHt && isExistFt ? scoreInconsistent : false;
        this.scoreChange.emit(this.matchDetail);
    }

  
}