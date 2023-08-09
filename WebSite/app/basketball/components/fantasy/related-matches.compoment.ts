import { CommonModule } from "@angular/common";
import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from "@angular/core";
import { FantasyMatch, FantasyRelatedMatch } from "../../models/fantasy.model";
import { groupBy, mapValues, isEqual, concat, some, isNil } from "lodash";
import { ResourcesIds } from "../../constants";
import { IntervalBackgroundPipe } from "../../../shared/pipes/interval-background.pipe";
import { ScoreBySettlementPipe } from "../../../shared/pipes/score-by-settlement.pipe";
import { MessageBoxService } from "../../../shared/services/message-box.service.native";
import { ModalDialogMessage } from "../../../shared/models/modal-dialog-message.model";
import { Language } from "../../../shared/language.native";
import { VerificationFantasyMatchService } from "../../services/verification-fantasy-match.service";
import { EventStatus } from "../../../shared/constants/event-status.native";

@Component({
    selector: "related-matches",
    templateUrl: "./related-matches.compoment.html",
    standalone: true,
    imports: [CommonModule, ScoreBySettlementPipe,],
    providers: [VerificationFantasyMatchService]
})
export class RelatedMatchesComponent implements OnInit {
    @Input() fantasyMatch: FantasyMatch;
    @Output() public readonly autoFillScore = new EventEmitter<any>();
    @Output() public readonly errorMsgEmitter = new EventEmitter<string>();

    private readonly dialogMessage = new ModalDialogMessage();
    constructor(private readonly messageBoxService: MessageBoxService,
        private readonly verificationFantasyMatchService: VerificationFantasyMatchService) {
        this.dialogMessage.title = Language.confirmationBox;
    }

    public get relatedMatches() {
        return this.fantasyMatch.relatedMatches ?? [];
    }

    public get fantasyMatchDetail() {
        return this.fantasyMatch.fantasyMatchDetail;
    }

    ngOnInit(): void {
        console.log("fantasyMatch", this.relatedMatches);
    }

    getClass(resourceId: string) {
        if (isEqual(resourceId, ResourcesIds.finalScore)) {
            return "final-score ";
        }
        if (isEqual(resourceId, ResourcesIds.htScore)) {
            return "ht-score ";
        }
    }

    public verifyAndFillFantasyMatch() {
        const homeTeams = this.fantasyMatchDetail.fantasyHomeTeam.split(',');
        const awayTeams = this.fantasyMatchDetail.fantasyAwayTeam.split(',');
        
        this.errorMsgEmitter.emit('');
        const relatedTeams = concat(homeTeams, awayTeams);
        console.log('',relatedTeams)
        
        if (this.verificationFantasyMatchService.isRelatedMatchesInsufficient(relatedTeams, this.relatedMatches)) {
            this.errorMsgEmitter.emit(Language.fantasyMatch.insufficientRelatedMatches);
        } else if (this.verificationFantasyMatchService.isExistHoldMatch(this.relatedMatches)) {
            this.dialogMessage.message = Language.fantasyMatch.confirmAutoFillOnHoldMatch;
            this.messageBoxService.confirm(this.dialogMessage, () => {
                this.confirmAutoFillScore(homeTeams, awayTeams);
            });
        } else {
            this.confirmAutoFillScore(homeTeams, awayTeams);
        }
    }

    private confirmAutoFillScore(homeTeams: string[], awayTeams: string[]) {
        const isExistNotCalculatedMatch = this.relatedMatches.some(match => isEqual(match.eventStatus.toLowerCase(), EventStatus.completed.toLowerCase()))
       
        if (isExistNotCalculatedMatch) {
            this.errorMsgEmitter.emit(Language.fantasyMatch.warningMatchNotCalculated);
        } 
        // else {
        //     this.dialogMessage.message = Language.fantasyMatch.confirmAutoFillFantasyMatch;
        //     this.messageBoxService.confirm(this.dialogMessage, () => {
        //         // const score = this.verifyScoreGoalService.sumScoreAndAutoFill(homeTeams, awayTeams, this.relatedMatches);
        //         // this.autoFillScore.emit(score);
        //     });
        // }
    }

    public isMatchRefunded(match: FantasyRelatedMatch) {
        // return isNil(match.betStatus) && (match.betStatus.toLowerCase().includes("")
        //     || match.betStatus.toLowerCase().includes(""));
        return false;
    }
}
