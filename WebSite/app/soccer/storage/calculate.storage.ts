import { inject, Injectable, signal } from "@angular/core";
import { ModalDialogMessage } from "../../shared/models";
import { Match, MatchDetail } from "../components/calc/models/match.model";
import { VerifyScoreGoalService } from "../components/calc/services/verify-score-goal.service";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { Storage } from "./storage.service";
import * as _ from "lodash";
import { Language } from "../../shared/language.native";

@Injectable({ providedIn: 'root' })

export class CalculateStorage implements Storage {
  private readonly verifyScoreGoalService = inject(VerifyScoreGoalService);
  private readonly toastrService = inject(ToastrService);
  #match = signal<Match>(null);
  #matchDetail = signal<MatchDetail>(null);

  match = this.#match.asReadonly();
  readonly dialogMessage = new ModalDialogMessage(Language.confirmationBox);

  setToastrOverlay(toastContainer: ToastContainerDirective) {
    this.toastrService.overlayContainer = toastContainer;
  }

  setConfirmMessage(message: string) {
    this.dialogMessage.message = message;
  }

  getConfirmMessage() {
    return this.dialogMessage;
  }

  error(message: string) {
    if (!_.isEmpty(message)) {
      this.toastrService.error(message);
    } else {
      this.toastrService.clear();
    }
  }

  setMatch(match: Match) {
    this.#match.set(match);
    this.#matchDetail.set(match.matchDetail);
  }

  getMatchDetail() {
    return this.#matchDetail();
  }

  getPermission() {
    return this.#match().permission;
  }
  clear() {
    this.toastrService.clear();
  }

  changeScore() {
    const isExistHt = !this.verifyScoreGoalService.isEmptyScore(this.#matchDetail().halfTimeHomeScore)
      && !this.verifyScoreGoalService.isEmptyScore(this.#matchDetail().halfTimeAwayScore);

    const isExistFt = !this.verifyScoreGoalService.isEmptyScore(this.#matchDetail().finalHomeScore)
      && !this.verifyScoreGoalService.isEmptyScore(this.#matchDetail().finalAwayScore);

    const scoreInconsistent = Number(this.#matchDetail().halfTimeHomeScore) > Number(this.#matchDetail().finalHomeScore)
      || Number(this.#matchDetail().halfTimeAwayScore) > Number(this.#matchDetail().finalAwayScore);

    this.#matchDetail.set({ ...this.#matchDetail(), isScoreInconsistent: isExistHt && isExistFt ? scoreInconsistent : false });
  }

  setHaftTimeScore(homeScore: number, awayScore: number) {
    this.#matchDetail.set({ ...this.#matchDetail(), halfTimeHomeScore: homeScore, halfTimeAwayScore: awayScore });
  }

  setFullTimeScore(homeScore: number, awayScore: number) {
    this.#matchDetail.set({ ...this.#matchDetail(), finalHomeScore: homeScore, finalAwayScore: awayScore });
  }
}

