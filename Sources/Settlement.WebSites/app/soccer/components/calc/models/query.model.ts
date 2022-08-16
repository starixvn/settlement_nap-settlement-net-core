import { CalculateAction } from "../../../../shared/constants/calculate-action.native";
import { MatchDetail, UndoChecking } from "./match.model";
import * as _ from "lodash";
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


    constructor(matchDetail: MatchDetail, hedgeMatchId: number, actionName: string, isResettledTickets: boolean, childMatchIds: string) {
        this.matchId = matchDetail.matchId;
        this.hedgeMatchId = hedgeMatchId;
        this.isApplyHedging = hedgeMatchId > 0;
        this.actionName = actionName;
        this.goalRecord = matchDetail.applyGoalRecord ? matchDetail.goalRecord : '';
        this.isExistFgLg = matchDetail.isExistFgLg;
        this.isExistHtFgLg = matchDetail.isExistHtFgLg;
        this.isExistFgNg = matchDetail.isExistFgNg;
        this.halfTimeHomeScore = matchDetail.halfTimeHomeScore;
        this.halfTimeAwayScore = matchDetail.halfTimeAwayScore;
        this.finalHomeScore = matchDetail.finalHomeScore;
        this.finalAwayScore = matchDetail.finalAwayScore;
        this.isResettledTickets = isResettledTickets;
        this.childMatchIds = childMatchIds;
        this.leagueGroupId = matchDetail.leagueGroupId;

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
    }
}