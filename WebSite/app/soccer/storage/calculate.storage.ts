import { inject, Injectable, signal } from "@angular/core";
import { ModalDialogMessage } from "../../shared/models";
import { Match, MatchDetail } from "../components/calc/models/match.model";
import { VerifyScoreGoalService } from "../components/calc/services/verify-score-goal.service";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { Storage } from "./storage.service";
import * as _ from "lodash";
import { Language } from "../../shared/language.native";

@Injectable()
export class CalculateStorage implements Storage {
  private readonly verifyScoreGoalService = inject(VerifyScoreGoalService);
  private readonly toastrService = inject(ToastrService);
  #match = signal<Match>(null);
  #matchDetail = signal<MatchDetail>(null);
  #isResettleTicket = false;
  #isApplyHedgeMatch = false;

  #calculateAction: string;

  match = this.#match.asReadonly();
  readonly dialogMessage = new ModalDialogMessage(Language.confirmationBox);

  // Getters
  getMatch() {
    return this.#match();
  }

  getConfirmMessage() {
    return this.dialogMessage;
  }

  isApplyHedgeMatch(){
    return this.#isApplyHedgeMatch;
  }

  getIsResettleTicket() {
    return this.#isResettleTicket;
  }

  getMatchDetail() {
    return this.#matchDetail();
  }

  getRelatedMatches() {
    return this.#matchDetail().isFantasyMatch
      ? this.#match().fantasyMatch.relatedMatches.filter((match) => !match.isDeleted)
      : [];
  }

  getPermission() {
    return this.#match().permission;
  }

  getCalculateAction() {
    return this.#calculateAction;
  }

  getHedgeMatchDetail() {
    return this.#match().hedgeMatchDetail;
  }

  // Setters
  setToastrOverlay(toastContainer: ToastContainerDirective) {
    this.toastrService.overlayContainer = toastContainer;
  }

  setIsAppleHedgeMatch(isApplyHedgeMatch: boolean) {
    this.#isApplyHedgeMatch = isApplyHedgeMatch;
  }

  setConfirmMessage(message: string) {
    this.dialogMessage.message = message;
  }

  setIsResettleTicket(isResettleTicket: boolean) {
    this.#isResettleTicket = isResettleTicket;
  }

  setCalculateAction(action: string) {
    this.#calculateAction = action;
  }

  setMatch(match: Match) {
    this.#match.set(match);
    this.#matchDetail.set(match.matchDetail);
  }

  setHaftTimeScore(homeScore: string, awayScore: string) {
    this.#matchDetail.set({ ...this.#matchDetail(), halfTimeHomeScore: homeScore, halfTimeAwayScore: awayScore });
  }

  setFullTimeScore(homeScore: string, awayScore: string) {
    this.#matchDetail.set({ ...this.#matchDetail(), finalHomeScore: homeScore, finalAwayScore: awayScore });
  }

  // Other Methods
  error(message: string) {
    if (!_.isEmpty(message)) {
      this.toastrService.error(message);
    } else {
      this.toastrService.clear();
    }
  }

  clear() {
    this.toastrService.clear();
  }

  changeScore() {
    const { halfTimeHomeScore, halfTimeAwayScore, finalHomeScore, finalAwayScore } = this.#matchDetail();
    const htExists = !this.verifyScoreGoalService.isEmptyScore(halfTimeHomeScore) && !this.verifyScoreGoalService.isEmptyScore(halfTimeAwayScore);
    const ftExists = !this.verifyScoreGoalService.isEmptyScore(finalHomeScore) && !this.verifyScoreGoalService.isEmptyScore(finalAwayScore);
    const isInconsistent = Number(halfTimeHomeScore) > Number(finalHomeScore) || Number(halfTimeAwayScore) > Number(finalAwayScore);
    this.#matchDetail.set({ ...this.#matchDetail(), isScoreInconsistent: htExists && ftExists && isInconsistent });
  }
}
