import {inject, Injectable, signal } from "@angular/core";
import { ModalDialogMessage } from "../../shared/models";
import { Match, MatchDetailSoccer, UndoChecking } from "../components/calc/models/match.model";
import { VerifyScoreGoalService } from "../components/calc/services/verify-score-goal.service";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { Storage } from "./storage.service.native";
import * as _ from "lodash";
import { Language } from "../../shared/language.native";
import { ResourceIds } from "../constants";
import { ResultStatusId, SettlementStatusId, TicketStatusText } from "../../shared/constants";
import {  ResultDetail } from "../../shared/models/sportsbook-sop";
import { OverStatus } from "../../shared/constants/over-status.native";

@Injectable()
export class CalculateStorage implements Storage {

  private readonly verifyScoreGoalService = inject(VerifyScoreGoalService);
  private readonly toastrService = inject(ToastrService);
  
  #match = signal<Match>(null);

  #matchDetail: MatchDetailSoccer;
  #isResettleTicket = false;
  #isApplyHedgeMatch = false;
  #calculateAction: string;
  #instantScore: UndoChecking;
  #halfTimeResult: ResultDetail;
  #fullTimeResult: ResultDetail;

  #isIgnoreCheckHt = false;
  #isReadyMatch = false;

  match = this.#match.asReadonly();
  readonly dialogMessage = new ModalDialogMessage(Language.confirmationBox);

  // Getters
  getMatch() {
    return this.#match();
  }

  getHalfTimeResult() {
    return this.#halfTimeResult;
  }

  getFullTimeResult() {
    return this.#fullTimeResult;
  }

  getConfirmMessage() {
    return this.dialogMessage;
  }

  isApplyHedgeMatch() {
    return this.#isApplyHedgeMatch;
  }

  getIsResettleTicket() {
    return this.#isResettleTicket;
  }

  getRelatedMatches() {
    return this.#matchDetail.isFantasyMatch
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

  getInstantScore() {
    return this.#instantScore;
  }

  getExternalResultDetails() {
    return this.#match().externalResults.flatMap(x => x.resultDetails);
  }

  getIsIgnoreCheckHt() {
    return this.#isIgnoreCheckHt;
  }

  setIsIgnoreCheckHt(value: boolean) {
    this.#isIgnoreCheckHt = value;
  }

  getIsReadyMatch() {
    return this.#isReadyMatch;
  }

  setIsReadyMatch(value: boolean) {
    this.#isReadyMatch = value;
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

  setMatch(match: Match, filterOver?: string) {
    this.#match.set(match);
    const { resultDetails } = this.#match();
    this.#matchDetail = this.#match().matchDetail;




    this.autoSelectResultByFilterOver(filterOver);

    this.#isApplyHedgeMatch = this.#match().hedgeMatchDetail != null && !this.#match().hedgeMatchDetail.isUndecided;
   
    this.#halfTimeResult = resultDetails.find(x => x.resourceId === ResourceIds.halfTime);
    this.#fullTimeResult = resultDetails.find(x => x.resourceId === ResourceIds.fullTime);
    this.#halfTimeResult.resourceName = "HT";
    this.#fullTimeResult.resourceName = "FT"; 
  }


  setHaftTimeScore(homeScore: string, awayScore: string) {
    this.#halfTimeResult.homeValue = homeScore;
    this.#halfTimeResult.awayValue = awayScore;
  }

  setFullTimeScore(homeScore: string, awayScore: string) {
    this.#fullTimeResult.homeValue = homeScore;
    this.#fullTimeResult.awayValue = awayScore;
  }

  setFinalScore(resourceId: string, homeScore: string, awayScore: string) {
    if (resourceId === ResourceIds.halfTime) {
      this.setHaftTimeScore(homeScore, awayScore);
    } else {
      this.setFullTimeScore(homeScore, awayScore);
    }
  }

  setInstantScore(score: UndoChecking) {
    this.#instantScore = score;
  }

  updateMatchDetailScore() {
    this.#matchDetail.finalAwayScore = this.#fullTimeResult.awayValue;
    this.#matchDetail.finalHomeScore = this.#fullTimeResult.homeValue;
    this.#matchDetail.halfTimeAwayScore = this.#halfTimeResult.awayValue;
    this.#matchDetail.halfTimeHomeScore = this.#halfTimeResult.homeValue;
  }

  // Other Methods

  resetHomeAway() {
    const statusNeedReset = [SettlementStatusId.Refund, SettlementStatusId.RefundFullTime, SettlementStatusId.RefundHalfTime];
    this.#match().resultDetails.forEach((map) => {
      const hideScore = statusNeedReset.some(status => map.settlementStatusId === status);
      map.homeValue = hideScore ? "" : map.homeValue;
      map.awayValue = hideScore ? "" : map.awayValue;
    });
  }

  error(message: string) {
    if (!_.isEmpty(message)) {
      this.toastrService.error(message);
    } else {
      this.toastrService.clear();
    }
  }

  clear() {
    this.toastrService.clear()
    this.#matchDetail.isWarningGoalRecord = false;

    this.#match().resultDetails.forEach(x => {
      x.isResultWarning = false;
      x.externalScores?.forEach(y => {
        y.isHomeValueWarning = false;
        y.isAwayValueWarning = false;
      });
    });
  }

  changeScore() {
    const htExists = !this.verifyScoreGoalService.isEmptyScore(this.#halfTimeResult.homeValue) && !this.verifyScoreGoalService.isEmptyScore(this.#halfTimeResult.awayValue);
    const ftExists = !this.verifyScoreGoalService.isEmptyScore(this.#fullTimeResult.homeValue) && !this.verifyScoreGoalService.isEmptyScore(this.#fullTimeResult.awayValue);
    const isInconsistent = Number(this.#halfTimeResult.homeValue) > Number(this.#fullTimeResult.homeValue) || Number(this.#halfTimeResult.awayValue) > Number(this.#fullTimeResult.awayValue);
    this.#matchDetail.isScoreInconsistent = htExists && ftExists && isInconsistent;
  }

  private autoSelectResultByFilterOver(filterOver?: string) {
    const settledResultStatusIds = [ResultStatusId.AutoCompleted, ResultStatusId.ManualCompleted];
    if (filterOver === OverStatus.SettledWithRunningTicket) {
      this.#halfTimeResult.checked = this.#halfTimeResult.settlementStatusId === SettlementStatusId.Calculated 
      && this.#halfTimeResult.ticketStatus === TicketStatusText.running;

      this.#fullTimeResult.checked = this.#fullTimeResult.settlementStatusId === SettlementStatusId.Calculated 
        && this.#fullTimeResult.ticketStatus === TicketStatusText.running;
      return;
    }

    if (filterOver === OverStatus.HTOver) {
      this.#halfTimeResult.checked = !settledResultStatusIds.includes(this.#halfTimeResult.resultStatusId);
      return;
    }

    if (filterOver === OverStatus.FTOver) {
      this.#halfTimeResult.checked = !settledResultStatusIds.includes(this.#halfTimeResult.resultStatusId);
      this.#fullTimeResult.checked = !settledResultStatusIds.includes(this.#fullTimeResult.resultStatusId);
    }
  }
}
