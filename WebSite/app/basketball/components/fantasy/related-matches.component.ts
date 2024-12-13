import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FantasyMatch } from "../../models/fantasy.model";
import * as _ from "lodash";
import { ResourcesIds } from "../../constants";
import { ScoreBySettlementPipe } from "../../../shared/pipes/score-by-settlement.pipe";
import { MessageBoxService } from "../../../shared/services/message-box.service.native";
import { ModalDialogMessage } from "../../../shared/models/modal-dialog-message.model";
import { Language } from "../../../shared/language.native";
import { VerificationFantasyMatchService } from "../../services/verification-fantasy-match.service";
import { FantasyScoreService } from "../../services/fantasy-score.service";

@Component({
  selector: "related-matches",
  templateUrl: "./related-matches.component.html",
  standalone: true,
  imports: [CommonModule, ScoreBySettlementPipe],
  providers: [
    VerificationFantasyMatchService,
    FantasyScoreService,
    MessageBoxService,
  ],
})
export class RelatedMatchesComponent {
  @Input() fantasyMatch: FantasyMatch;
  @Input() isSupportCopyScore = false;
  @Output() public readonly autoFillScore = new EventEmitter<{
    resourceId: string;
    homeValue: string;
    awayValue: string;
}[]>();
  @Output() public readonly errorMsgEmitter = new EventEmitter<string>();

  private readonly dialogMessage = new ModalDialogMessage();
  constructor(
    private readonly messageBoxService: MessageBoxService,
    private readonly verificationFantasyMatchService: VerificationFantasyMatchService,
    private readonly fantasyScoreService: FantasyScoreService
  ) {
    this.dialogMessage.title = Language.confirmationBox;
  }

  public get relatedMatches() {
    return this.fantasyMatch.relatedMatches ?? [];
  }

  public get fantasyMatchDetail() {
    return this.fantasyMatch.fantasyMatchDetail;
  }

  public get relatedMatchesView() {
    const resourceIds = [
      ResourcesIds.quarter1,
      ResourcesIds.quarter2,
      ResourcesIds.quarter3,
      ResourcesIds.quarter4,
      ResourcesIds.ot,
      ResourcesIds.htScore,
      ResourcesIds.finalScore,
    ];

    const matchesView = this.fantasyMatch.relatedMatches.map((match) => {
      return {
        ...match,
        results: resourceIds.map((resourceId) => {
          const result = match.results
            .filter((r) => r.resourceId)
            .find((r) => r.resourceId === resourceId);

          return result ? { ...result } : { resourceId };
        }),
      };
    });
    return matchesView;
  }

  getScoreClass(resourceId: string) {
    if (_.isEqual(resourceId, ResourcesIds.finalScore)) {
      return "color-final-score ";
    }
    if (_.isEqual(resourceId, ResourcesIds.htScore)) {
      return "color-ht-score ";
    }

    return "";
  }

  getEventStatusClass(eventStatus: string) {
    const isRefund = ["refund", "abandon"].some((keyword) =>
      eventStatus.toLowerCase().includes(keyword)
    );
    return isRefund ? "bg-refund" : "";
  }

  public verifyAndFillFantasyMatch() {
    const homeTeams = this.fantasyMatchDetail.fantasyHomeTeam.split(",");
    const awayTeams = this.fantasyMatchDetail.fantasyAwayTeam.split(",");
    const relatedTeams = [...homeTeams, ...awayTeams];

    this.errorMsgEmitter.emit("");
    if (
      this.verificationFantasyMatchService.isRelatedMatchesInsufficient(
        relatedTeams,
        this.relatedMatches
      )
    ) {
      this.errorMsgEmitter.emit(
        Language.fantasyMatch.insufficientRelatedMatches
      );
      return;
    }

    if (
      this.verificationFantasyMatchService.isExistNotCalculatedMatch(
        this.relatedMatches
      )
    ) {
      this.errorMsgEmitter.emit(
        Language.fantasyMatch.warningMatchNotCalculated
      );
      return;
    }

    if (
      this.verificationFantasyMatchService.isExistHoldMatch(this.relatedMatches)
    ) {
      this.dialogMessage.message =
        Language.fantasyMatch.confirmAutoFillOnHoldMatch;
      this.messageBoxService.confirm(this.dialogMessage, () => {
        this.confirmAutoFillScore(homeTeams, awayTeams);
      });
      return;
    }

    this.confirmAutoFillScore(homeTeams, awayTeams);
  }

  private confirmAutoFillScore(homeTeams: string[], awayTeams: string[]) {
    this.dialogMessage.message =
      Language.fantasyMatch.confirmAutoFillFantasyMatch;
    this.messageBoxService.confirm(this.dialogMessage, () => {

      const homeValueResults = this.fantasyScoreService.sumScore(
        this.relatedMatches,
        homeTeams
      );
      const awayValueResults = this.fantasyScoreService.sumScore(
        this.relatedMatches,
        awayTeams
      );

      const results = this.fantasyScoreService.combineResult(homeValueResults,awayValueResults)
      this.autoFillScore.emit(results);
    });
  }
}
