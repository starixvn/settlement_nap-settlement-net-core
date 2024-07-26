import { Injectable } from "@angular/core";
import * as _ from "lodash";
import { TicketStatusText, CalculateAction, SettlementStatusId } from "../../../../shared/constants";
import { Language } from '../../../../shared/language.native';
import { ChildMatch, FantasyRelatedMatch, MatchDetail } from '../models/match.model';
import { VerifyScoreGoalService } from "./verify-score-goal.service";
import { RequestService } from './request.service';

@Injectable()
export class VerifyActionService {
  constructor(
    private readonly verifyScoreGoalService: VerifyScoreGoalService,
    private readonly requestService: RequestService) { }

  public async verifyFirstHalf(matchDetail: MatchDetail, relatedMatches: FantasyRelatedMatch[]) {
    if (this.verifyScoreGoalService.verifyScoreHalfTime(matchDetail)) {
      return Language.warningInputScore;
    }

    if (this.verifyScoreGoalService.goalRecordNotExistSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.needSemicolonOnGoalRecord;
    }

    if (matchDetail.applyGoalRecord && this.verifyScoreGoalService.isHtGoalRecordInvalid(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.halfTimeGoalRecordNotConsistent;
    }

    if (matchDetail.isScoreInconsistent) {
      return Language.soccer.confirmWithInconsistentScore;
    }

    if (matchDetail.isFantasyMatch && this.isFirstHalfRelatedMatchesNotCalc(relatedMatches)) {
      return Language.fantasyMatch.relatedMatchesNotCalc;
    }

    return this.checkNewStatus(matchDetail, CalculateAction.calculateHalfTime);
  }

  private isFirstHalfRelatedMatchesNotCalc(relatedMatches: FantasyRelatedMatch[] = []) {
    return relatedMatches.some(x => x.htSettlementStatusId !== SettlementStatusId.Calculated)
  }

  private async checkNewStatus(matchDetail: MatchDetail, actionName: string) {
    const result = await this.requestService.checkNewStatus(matchDetail.matchId, actionName);
    return result.isSuccessful ? "" : result.errMsg;
  }

  public async verifyFullTime(matchDetail: MatchDetail, selectedChildMatches: ChildMatch[], relatedMatches: FantasyRelatedMatch[]) {
    if (this.verifyScoreGoalService.verifyScoreFullTime(matchDetail)) {
      return Language.warningInputScore;
    }
    if (this.verifyScoreGoalService.verifyScoreForChildMatch(matchDetail, selectedChildMatches)) {
      return Language.soccer.childMatchesErrorMessage;
    }

    if (this.isRefundHalfTimeAndHasSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.noNeedSemicolonOnGoalRecord;
    }
    if (this.isNotRefundHalfTimeAndHasNotSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.needSemicolonOnGoalRecord;
    }
    if (this.verifyScoreGoalService.isHTGoalRecordConsistent(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.halfTimeGoalRecordNotConsistent;
    }
    if (this.verifyScoreGoalService.isFullTimeGoalRecordInvalid(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.goalRecordNotConsistent;
    }
    if (matchDetail.isScoreInconsistent) {
      return Language.soccer.incorrectHalftimeAndFullTimeScore;
    }

    if (this.isFantasyMatchAndRelatedMatches(matchDetail,relatedMatches)) {
      return Language.fantasyMatch.relatedMatchesNotCalc;
    }
    return this.checkNewStatus(matchDetail, CalculateAction.calculateFullTime);

  }

  private isNotRefundHalfTimeAndHasNotSemicolon(matchDetail: MatchDetail) {
    return !this.verifyScoreGoalService.isRefundHalfTime(matchDetail) && this.verifyScoreGoalService.goalRecordNotExistSemicolon(matchDetail)
  }

  private isRefundHalfTimeAndHasSemicolon(matchDetail: MatchDetail) {
   return this.verifyScoreGoalService.isRefundHalfTime(matchDetail) && this.verifyScoreGoalService.goalRecordExistSemicolon(matchDetail)
  }

  private isFantasyMatchAndRelatedMatches(matchDetail: MatchDetail, relatedMatches: FantasyRelatedMatch[]) {
    return matchDetail.isFantasyMatch && this.isFullTimeRelatedMatchesNotCalc(relatedMatches);
  }

  private isFullTimeRelatedMatchesNotCalc(relatedMatches: FantasyRelatedMatch[] = []) {
    return relatedMatches.some(x => x.ftSettlementStatusId !== SettlementStatusId.Calculated)
  }

  public async verifyAll(matchDetail: MatchDetail, selectedChildMatches: ChildMatch[], relatedMatches: FantasyRelatedMatch[]) {
    if (this.verifyScoreGoalService.verifyScoreAll(matchDetail)) {
      return Language.warningInputScore;
    }

    if (this.verifyScoreGoalService.verifyScoreForChildMatch(matchDetail, selectedChildMatches)) {
      return Language.soccer.childMatchesErrorMessage;
    }

    if (this.verifyScoreGoalService.goalRecordNotExistSemicolon(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.needSemicolonOnGoalRecord;
    }

    if (this.verifyScoreGoalService.isHTGoalRecordConsistent(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.halfTimeGoalRecordNotConsistent;
    }

    if (this.verifyScoreGoalService.isFullTimeGoalRecordInvalid(matchDetail)) {
      matchDetail.isWarningGoalRecord = true;
      return Language.soccer.goalRecordNotConsistent;
    }

    if (matchDetail.isScoreInconsistent) {
      return Language.soccer.incorrectHalftimeAndFullTimeScore;
    }

    if (matchDetail.isFantasyMatch && this.isAllResultRelatedMatchesNotCalc(relatedMatches)) {
      return Language.fantasyMatch.relatedMatchesNotCalc;

    }

    return this.checkNewStatus(matchDetail, CalculateAction.calculate);
  }

  private isAllResultRelatedMatchesNotCalc(relatedMatches: FantasyRelatedMatch[] = []) {
    return this.isFirstHalfRelatedMatchesNotCalc(relatedMatches) || this.isFullTimeRelatedMatchesNotCalc(relatedMatches);
  }

  public async isScoreChangedFirstHalf(matchDetail: MatchDetail, isReSettledTickets: boolean) {
    if (isReSettledTickets) {
      return false;
    }

    const lastestMatch = await this.requestService.getLastestMatchResult(matchDetail.matchId);

    return _.isEqual(lastestMatch.htStatus, TicketStatusText.calculated)
      && (this.verifyScoreGoalService.isSettledFirstHalf(lastestMatch.betStatus)
        || this.verifyScoreGoalService.isResultChangedFirstHalf(matchDetail, lastestMatch)
        || this.verifyScoreGoalService.isGoalRecordChangedFirstHalf(matchDetail, lastestMatch));

  }

  public async isScoreChangedFullTime(matchDetail: MatchDetail, isReSettledTickets: boolean) {
    if (isReSettledTickets) {
      return false;
    }
    const lastestMatch = await this.requestService.getLastestMatchResult(matchDetail.matchId);

    return _.isEqual(lastestMatch.ftStatus, TicketStatusText.calculated)
      && (this.verifyScoreGoalService.isSettledFullTime(lastestMatch.betStatus)
        || this.verifyScoreGoalService.isResultChangedFullTime(matchDetail, lastestMatch)
        || this.verifyScoreGoalService.isGoalRecordChangedFullTime(matchDetail, lastestMatch));

  }

  public async isScoreChangedAll(matchDetail: MatchDetail, isReSettledTickets: boolean) {
    if (isReSettledTickets) {
      return false;
    }
    const lastestMatch = await this.requestService.getLastestMatchResult(matchDetail.matchId);

    return (_.isEqual(lastestMatch.htStatus, TicketStatusText.calculated)
      || _.isEqual(lastestMatch.ftStatus, TicketStatusText.calculated))
      && (this.verifyScoreGoalService.isSettledAll(lastestMatch.betStatus)
        || this.verifyScoreGoalService.isResultChangedFirstHalf(matchDetail, lastestMatch)
        || this.verifyScoreGoalService.isResultChangedFullTime(matchDetail, lastestMatch)
        || this.verifyScoreGoalService.isGoalRecordChangedAll(matchDetail, lastestMatch));

  }
}