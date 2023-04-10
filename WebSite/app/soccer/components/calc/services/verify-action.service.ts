import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { TicketStatusText, CalculateAction } from "../../../../shared/constants";
import { Language } from '../../../../shared/language.native';
import { Result } from '../../../../shared/models';
import { ChildMatch, MatchDetail } from '../models/match.model';
import { VerifyScoreGoalService } from "./verify-score-goal.service";
import { RequestService } from './request.service';

@Injectable()
export class VerifyActionService {
  constructor(
    private readonly verifyScoreGoalService: VerifyScoreGoalService,
    private readonly requestService: RequestService) { }

  public async verifyFirstHalf(matchDetail: MatchDetail) {
    if (this.verifyScoreGoalService.verifyScoreHalfTime(matchDetail)) {
      return Language.warningInputScore;
    } else if (this.verifyScoreGoalService.goalRecordNotExistSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.needSemicolonOnGoalRecord;
    } else if (matchDetail.applyGoalRecord && this.verifyScoreGoalService.isHtGoalRecordInvalid(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.halfTimeGoalRecordNotConsistent;
    } else if (matchDetail.isScoreInconsistent) {
      return Language.soccer.confirmWithInconsistentScore;
    } else {
      return this.checkNewStatus(matchDetail, CalculateAction.calculateHalfTime);
    }
  }

  private async checkNewStatus(matchDetail: MatchDetail, actionName: string) {
    const result = await this.requestService.checkNewStatus(matchDetail.matchId, actionName).toPromise() as Result;
    return result.isSuccessful ? "" : result.errMsg;
  }

  public async verifyFullTime(matchDetail: MatchDetail, selectedChildMatches: ChildMatch[]) {
    if (this.verifyScoreGoalService.verifyScoreFullTime(matchDetail)) {
      return Language.warningInputScore;
    } else if (this.verifyScoreGoalService.verifyScoreForChildMatch(matchDetail, selectedChildMatches)) {
      return Language.soccer.childMatchesErrorMessage;
    } else if (this.verifyScoreGoalService.isRefundHalfTime(matchDetail)
      && this.verifyScoreGoalService.goalRecordExistSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.noNeedSemicolonOnGoalRecord;
    } else if (!this.verifyScoreGoalService.isRefundHalfTime(matchDetail)
      && this.verifyScoreGoalService.goalRecordNotExistSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.needSemicolonOnGoalRecord;
    } else if (this.verifyScoreGoalService.isHTGoalRecordConsistent(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.halfTimeGoalRecordNotConsistent;
    } else if (this.verifyScoreGoalService.isFullTimeGoalRecordInvalid(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.goalRecordNotConsistent;
    } else if (matchDetail.isScoreInconsistent) {
      return Language.soccer.incorrectHalftimeAndFullTimeScore;
    } else {
      return this.checkNewStatus(matchDetail, CalculateAction.calculateFullTime);
    }
  }

  public async verifyAll(matchDetail: MatchDetail, selectedChildMatches: ChildMatch[]) {
    if (this.verifyScoreGoalService.verifyScoreAll(matchDetail)) {
      return Language.warningInputScore;
    } else if (this.verifyScoreGoalService.verifyScoreForChildMatch(matchDetail, selectedChildMatches)) {
      return Language.soccer.childMatchesErrorMessage;
    } else if (this.verifyScoreGoalService.goalRecordNotExistSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.needSemicolonOnGoalRecord;
    } else if (this.verifyScoreGoalService.isHTGoalRecordConsistent(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.halfTimeGoalRecordNotConsistent;
    } else if (this.verifyScoreGoalService.isFullTimeGoalRecordInvalid(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.goalRecordNotConsistent;
    } else if (matchDetail.isScoreInconsistent) {
      return Language.soccer.incorrectHalftimeAndFullTimeScore;
    } else {
      return this.checkNewStatus(matchDetail, CalculateAction.calculate);
    }
  }

  public async isScoreChangedFirstHalf(matchDetail: MatchDetail, isReSettledTickets: boolean) {
    if (isReSettledTickets) {
      return false;
    } else {
      const lastestMatch = await this.requestService.getLastestMatchResult(matchDetail.matchId).toPromise() as MatchDetail;

      return _.isEqual(lastestMatch.htStatus, TicketStatusText.calculated)
        && (this.verifyScoreGoalService.isSettledFirstHalf(lastestMatch.betStatus)
          || this.verifyScoreGoalService.isResultChangedFirstHalf(matchDetail, lastestMatch)
          || this.verifyScoreGoalService.isGoalRecordChangedFirstHalf(matchDetail, lastestMatch));
    }
  }

  public async isScoreChangedFullTime(matchDetail: MatchDetail, isReSettledTickets: boolean) {
    if (isReSettledTickets) {
      return false;
    } else {
      const lastestMatch = await this.requestService.getLastestMatchResult(matchDetail.matchId).toPromise() as MatchDetail;

      return _.isEqual(lastestMatch.ftStatus, TicketStatusText.calculated)
        && (this.verifyScoreGoalService.isSettledFullTime(lastestMatch.betStatus)
          || this.verifyScoreGoalService.isResultChangedFullTime(matchDetail, lastestMatch)
          || this.verifyScoreGoalService.isGoalRecordChangedFullTime(matchDetail, lastestMatch));
    }
  }

  public async isScoreChangedAll(matchDetail: MatchDetail, isReSettledTickets: boolean) {
    if (isReSettledTickets) {
      return false;
    } else {
      const lastestMatch = await this.requestService.getLastestMatchResult(matchDetail.matchId).toPromise() as MatchDetail;

      return (_.isEqual(lastestMatch.htStatus, TicketStatusText.calculated)
        || _.isEqual(lastestMatch.ftStatus, TicketStatusText.calculated))
        && (this.verifyScoreGoalService.isSettledAll(lastestMatch.betStatus)
          || this.verifyScoreGoalService.isResultChangedFirstHalf(matchDetail, lastestMatch)
          || this.verifyScoreGoalService.isResultChangedFullTime(matchDetail, lastestMatch)
          || this.verifyScoreGoalService.isGoalRecordChangedAll(matchDetail, lastestMatch));
    }
  }
}