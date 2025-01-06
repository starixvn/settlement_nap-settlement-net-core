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

  isFirstHalfRelatedMatchesNotCalc(relatedMatches: FantasyRelatedMatch[] = []) {
    return relatedMatches.some(x => x.htSettlementStatusId !== SettlementStatusId.Calculated)
  }

  async checkNewStatus(matchDetail: MatchDetail, actionName: string) {
    const result = await this.requestService.checkNewStatus(matchDetail.matchId, actionName);
    return result.isSuccessful ? "" : result.errMsg;
  }

  isFullTimeRelatedMatchesNotCalc(relatedMatches: FantasyRelatedMatch[] = []) {
    return relatedMatches.some(x => x.ftSettlementStatusId !== SettlementStatusId.Calculated)
  }
  
  isAllResultRelatedMatchesNotCalc(relatedMatches: FantasyRelatedMatch[] = []) {
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