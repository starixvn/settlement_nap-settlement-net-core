import { CalculateAction } from "../../shared/constants";
import { MatchDetail } from "./match-detail.model";
import * as _ from "lodash";
import { ResultDetail } from "../../shared/models/sportsbook-sop";

export class RequestSettle {
  matchId: number;
  finalHomeScore?: number;
  finalAwayScore?: number;
  action: string;
  isReSettledTickets: boolean;
  betStatus: string;
  refResultStatus?: number;
  halfTimeHomeScore?: number;
  halfTimeAwayScore?: number;
  isApplyHedging: boolean;
  hedgeMatchId: number;
  sportType: number;
  constructor(
    matchDetail: MatchDetail,
    action: string,
    isReSettledTickets: boolean,
    betStatus: string,
    finalHomeScore: number,
    finalAwayScore: number,
    refResultStatus: number = null
  ) {
    this.matchId = matchDetail.matchId;
    this.finalHomeScore = finalHomeScore;
    this.finalAwayScore = finalAwayScore;
    this.action = action;
    this.isReSettledTickets = isReSettledTickets;
    this.betStatus = betStatus;
    this.refResultStatus = refResultStatus;
  }
}

export class RequestSettleWithInterval {
  matchId: number;
  action: string;
  isReSettledTickets: boolean;
  isScoreDirect: boolean;
  selectedResources: ResultDetail[];
  sportType: number;
  isApplyHedging: boolean;
  hedgeMatchId: number;
  refResultStatus?: number;
  constructor(
    matchDetail: MatchDetail,
    selectedResources: ResultDetail[],
    action: string,
    isReSettledTickets: boolean,
    isScoreDirect: boolean,
    hedgeMatchId: number,
    refResultStatus: number = null
  ) {
    this.matchId = matchDetail.matchId;
    this.sportType = matchDetail.sportType;
    this.selectedResources = selectedResources;
    this.isScoreDirect = _.isEqual(action, CalculateAction.unCalculate)
      ? false
      : isScoreDirect;
    this.action = action;
    this.isReSettledTickets = isReSettledTickets;
    this.isApplyHedging = hedgeMatchId > 0;
    this.hedgeMatchId = hedgeMatchId;
    this.refResultStatus = refResultStatus;
  }
}
