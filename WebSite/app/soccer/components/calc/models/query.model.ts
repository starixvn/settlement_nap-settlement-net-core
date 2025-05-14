import { ResultDetail } from "../../../models";
import { CalculateAction } from "../../../../shared/constants/calculate-action.native";
import { MatchDetail, UndoChecking } from "./match.model";
import * as _ from "lodash";
import { Resource } from "./resouce.model";
export class SettleQuery {
    public matchId: number;
    public hedgeMatchId: number;
    public isApplyHedging: boolean;
    public actionName: string;
    public goalRecord: string;
    public isExistFgLg: boolean;
    public isExistHtFgLg: boolean;
    public isExistFgNg: boolean;
    public isEnabledGoalRecordHt: boolean;
    public isEnabledGoalRecordFt: boolean;
    public halfTimeHomeScore: number;
    public halfTimeAwayScore: number;
    public finalHomeScore: number;
    public finalAwayScore: number;
    public isResettledTickets: boolean;
    public childMatchIds: string;
    public leagueGroupId: number;
    public isFantasyMatch: boolean;
    public childMatchType: number;
    public sportType: number;
    public parentId: number;
    public resultDetails: ResultDetail[];
    public selectedResultDetails: ResultDetail[];


    constructor(matchDetail: MatchDetail, hedgeMatchId: number, actionName: string, isResettledTickets: boolean, childMatchIds: string, resultDetails: ResultDetail[]) {
        
        this.matchId = matchDetail.matchId;
        this.hedgeMatchId = hedgeMatchId;
        this.isApplyHedging = hedgeMatchId > 0;
        this.actionName = actionName;
        this.goalRecord = matchDetail.applyGoalRecord ? matchDetail.goalRecord : '';
        this.isExistFgLg = matchDetail.isExistFgLg;
        this.isExistHtFgLg = matchDetail.isExistHtFgLg;
        this.isExistFgNg = matchDetail.isExistFgNg;
        this.halfTimeHomeScore = Number(matchDetail.halfTimeHomeScore);
        this.halfTimeAwayScore = Number(matchDetail.halfTimeAwayScore);
        this.finalHomeScore = Number(matchDetail.finalHomeScore);
        this.finalAwayScore = Number(matchDetail.finalAwayScore);
        this.isResettledTickets = isResettledTickets;
        this.childMatchIds = childMatchIds;
        this.leagueGroupId = matchDetail.leagueGroupId;
        this.isFantasyMatch = matchDetail.isFantasyMatch;
        this.childMatchType = matchDetail.childMatchType;
        this.sportType = matchDetail.sportType;
        this.parentId = matchDetail.parentId;
        this.resultDetails = resultDetails;
        this.selectedResultDetails = resultDetails.filter(x => x.checked);
        
        if (matchDetail.applyGoalRecord) {
            this.isEnabledGoalRecordFt = true;
            this.isEnabledGoalRecordHt = true;
        } else {
            this.isEnabledGoalRecordFt = matchDetail.isEnabledGoalRecordFt;
            this.isEnabledGoalRecordHt = matchDetail.isEnabledGoalRecordHt;
        }

    }
}



export class InstantCalculationQuery {
    public matchId: number;
    public homeScore: string;
    public awayScore: string;
    public action: string;
    public goalRecord: string;
    public isHalfTime: boolean;
    public instantKey: number;
    public firstGoalValue: string;
    public betStatus: string;
    public isExistFG: boolean;
    public isExistHTFG: boolean;
    public resources: Resource[]

    constructor(matchId: number, score: UndoChecking) {
        this.matchId = matchId;
        this.homeScore = score.homeScore;
        this.awayScore = score.awayScore;
        this.action = CalculateAction.unCalculate;
        this.isHalfTime = score.isHt;
        this.instantKey = score.instantKey;
        this.firstGoalValue = score.firstGoalValue;
        this.goalRecord = score.goalRecord;
        this.betStatus = score.betStatus;
        this.isExistFG = score.isExistFG;
        this.isExistHTFG = score.isExistHTFG;
        this.resources = score.resources
    }
}

export class UncalculateFullTimeQuery {
    public matchId: number;
    public isExistFgLg: boolean;
    public isExistHtFgLg: boolean;
    public isExistFgNg: boolean;
    public resultDetails: ResultDetail[];
    public hedgeMatchId: number;
    public isApplyHedging: boolean;
    public halfTimeHome: string;
    public halfTimeAway: string;

    constructor(matchDetail: MatchDetail, resultDetails: ResultDetail[], hedgeMatchId: number) {
        this.isExistFgLg = matchDetail.isExistFgLg;
        this.isExistFgNg = matchDetail.isExistFgNg;
        this.isExistHtFgLg = matchDetail.isExistHtFgLg;
        this.matchId = matchDetail.matchId;
        this.resultDetails = resultDetails;
        this.hedgeMatchId = hedgeMatchId;
        this.isApplyHedging = hedgeMatchId > 0;
        this.halfTimeAway = matchDetail.halfTimeAwayScore;
        this.halfTimeHome = matchDetail.halfTimeHomeScore;
    }
}