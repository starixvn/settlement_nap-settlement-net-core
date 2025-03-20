import { ChangeDetectorRef, inject, Injectable, signal } from "@angular/core";
import { ModalDialogMessage, Result } from "../../shared/models";
import { Match, MatchDetail, UndoChecking } from "../components/calc/models/match.model";
import { VerifyScoreGoalService } from "../components/calc/services/verify-score-goal.service";
import { ToastContainerDirective, ToastrService } from "ngx-toastr";
import { Storage } from "./storage.service.native";
import * as _ from "lodash";
import { Language } from "../../shared/language.native";
import { ResourceIds } from "../constants";
import { ResultDetail } from "../models";
import {  ScoreSourceType, SettlementStatusId } from "../../shared/constants";

@Injectable()
export class CalculateStorage implements Storage {
  private readonly verifyScoreGoalService = inject(VerifyScoreGoalService);
  private readonly toastrService = inject(ToastrService);
  #match = signal<Match>(null);

  #matchDetail: MatchDetail;
  #isResettleTicket = false;
  #isApplyHedgeMatch = false;
  #calculateAction: string;
  #instantScore: UndoChecking;
  #halfTimeResult: ResultDetail;
  #fullTimeResult: ResultDetail;

  #outsideHtResult: ResultDetail;
  #outsideFtResult: ResultDetail;
  #traderHtResult: ResultDetail;
  #traderFtResult: ResultDetail;

  match = this.#match.asReadonly();
  readonly dialogMessage = new ModalDialogMessage(Language.confirmationBox);

  // Getters
  getMatch() {
    return this.#match();
  }

  getHalfTimeResult(){
    return this.#halfTimeResult;
  }

  getFullTimeResult(){
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

  getInstantScore(){
    return this.#instantScore;
  }

  get outsideFtResult() {
    return this.#outsideFtResult;
  }

  get outsideHtResult() {
    return this.#outsideHtResult;
  }

  get traderHtResult() {
    return this.#traderHtResult
  }

  get traderFtResult() {
    return this.#traderFtResult
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
    const { resultDetails } = this.#match();
    this.#matchDetail = this.#match().matchDetail;
    this.#halfTimeResult = this.#match().resultDetails
      .find((result) => result.resourceId === ResourceIds.halfTime && result.sourceId === ScoreSourceType.emptySource);
    this.#fullTimeResult = this.#match().resultDetails
      .find((result) => result.resourceId === ResourceIds.fullTime && result.sourceId === ScoreSourceType.emptySource);
    this.#isApplyHedgeMatch = this.#match().hedgeMatchDetail != null && !this.#match().hedgeMatchDetail.isUndecided;
    this.#halfTimeResult.resourceName = "HT"; 
    this.#fullTimeResult.resourceName = "FT";

    console.log(resultDetails)

    this.#outsideHtResult = resultDetails.find(x => x.sourceId === ScoreSourceType.screenshot && x.resourceId === ResourceIds.halfTime);
    this.#outsideFtResult = resultDetails.find(x => x.sourceId === ScoreSourceType.screenshot && x.resourceId === ResourceIds.fullTime);

    this.#traderHtResult = resultDetails.find(x => x.sourceId === ScoreSourceType.trader && x.resourceId === ResourceIds.halfTime);
    this.#traderFtResult = resultDetails.find(x => x.sourceId === ScoreSourceType.trader && x.resourceId === ResourceIds.fullTime);

  }
  

  setHaftTimeScore(homeScore: string, awayScore: string) {
    this.#halfTimeResult.homeValue = homeScore;
    this.#halfTimeResult.awayValue = awayScore;
  }

  setFullTimeScore(homeScore: string, awayScore: string) {
    this.#fullTimeResult.homeValue = homeScore;
    this.#fullTimeResult.awayValue = awayScore;
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
    this.#matchDetail.isWarningHalfTimeAwayScore = false;
    this.#matchDetail.isWarningHalfTimeHomeScore = false;
    this.#matchDetail.isWarningFinalAwayScore = false;
    this.#matchDetail.isWarningFinalHomeScore = false;
    this.#matchDetail.isWarningGoalRecord = false;
  }

  changeScore() {
    const htExists = !this.verifyScoreGoalService.isEmptyScore(this.#halfTimeResult.homeValue) && !this.verifyScoreGoalService.isEmptyScore(this.#halfTimeResult.awayValue);
    const ftExists = !this.verifyScoreGoalService.isEmptyScore(this.#fullTimeResult.homeValue) && !this.verifyScoreGoalService.isEmptyScore(this.#fullTimeResult.awayValue);
    const isInconsistent = Number(this.#halfTimeResult.homeValue) > Number(this.#fullTimeResult.homeValue) || Number(this.#halfTimeResult.awayValue) > Number(this.#fullTimeResult.awayValue);
    this.#matchDetail.isScoreInconsistent = htExists && ftExists && isInconsistent;
  }
}
