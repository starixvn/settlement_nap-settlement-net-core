import { Remark } from "../../../../shared/models";
import { Permission } from "../../../../shared/models/sportsbook-sop";
import { TicketCount, ResultDetail, MatchDetailBase } from '../../../models';
import { Resource } from "./resouce.model";

export interface Match {
    matchDetail: MatchDetail;
    permission: Permission;
    ticketCounts: TicketCount[];
    resultDetails: ResultDetail[];
    hedgeMatchDetail: HedgeMatchDetail;
    fantasyMatch: FantasyMatch;
    childMatches: ChildMatch[];
}

export interface ChildMatch {
    matchId: number;
    matchCode: string;
    isExistMarkedTicket: boolean;
    isExistRunningTicket: boolean;
    isPending: boolean;
    isRefund: string;
    eventStatus: string;
    eventStatusColor: string;
    betStatus: string;
    checked: boolean;
    homeName: string;
    awayName: string;
}

export interface HedgeMatchDetail {
    matchId: number;
    matchCode: string;
    isDeterminedHedgeMatch: boolean;
    isUndecided: boolean;
}

export interface MatchDetail extends MatchDetailBase {
    playTime: number,
    exHTHomeScore: string,
    exHTAwayScore: string,
    exFTHomeScore: string,
    exFTAwayScore: string,
    isFantasyMatch: boolean,
    isInstant: boolean,
    hasInstantCompleted: boolean,
    confirmHT: number,
    confirmFT: number,
    isLive: boolean,
    offerLive: boolean,
    childMatchType: number,
    sportType: number,
    parentId: number,
}

export interface FantasyMatch {
    fantasyMatchDetail: FantasyMatchDetail;
    relatedMatches: FantasyRelatedMatch[];
}

export interface FantasyMatchDetail {
    fantasyHomeTeam: string;
    fantasyAwayTeam: string;
}

export interface FantasyRelatedMatch {
    matchId: number;
    matchCode: string;
    kickOffTime: string;
    homeId: number;
    awayId: number;
    homeName: string;
    awayName: string;
    htHomeScore: number;
    htAwayScore: number;
    finalHomeScore: number;
    finalAwayScore: number;
    remark: Remark;
    eventStatus: string;
    betStatus: string;
    isDeleted: boolean;
    ftSettlementStatusId: number;
    htSettlementStatusId: number
}

export interface UndoChecking {
    homeScore: string;
    awayScore: string;
    goalRecord: string;
    isHt: boolean;
    instantKey: number;
    firstGoalValue: string;
    isExistFG: boolean;
    isExistHTFG: boolean;
    betStatus: string;
    errCode: number;
    errMsg: string;
    resources: Resource[]
}

export class GoalRecord {
    public team: string;
    public home: number;
    public away: number;

    constructor(team: string, home: number, away: number) {
        this.team = team;
        this.home = home;
        this.away = away;
    }
}

export class Score {
    halfTimeHomeScore: number;
    halfTimeAwayScore: number;
    finalHomeScore: number;
    finalAwayScore: number;

    constructor(halfTimeHomeScore: number, halfTimeAwayScore: number, finalHomeScore: number, finalAwayScore: number) {
        this.halfTimeHomeScore = halfTimeHomeScore;
        this.halfTimeAwayScore = halfTimeAwayScore;
        this.finalHomeScore = finalHomeScore;
        this.finalAwayScore = finalAwayScore;
    }
}

export type TicketGroupCount = {
    groupResult: string;
    totalTicket: number;
}