import { GoalIcon } from ".";

export interface MatchDetailBase {
    matchId: number,
    matchCode: string,
    leagueName: string,
    kickOffTime: string,
    homeName: string,
    awayName: string,
    goalRecord: string,
    goalIcon: GoalIcon
    isHalfTimeCal : boolean,
    isCalculated: boolean,
    isWarningGoalRecord: boolean,
    halfTimeHomeScore: string,
    halfTimeAwayScore: string,
    isWarningHalfTimeHomeScore: boolean,
    isWarningHalfTimeAwayScore: boolean,
    finalHomeScore: string,
    finalAwayScore: string,
    isWarningFinalHomeScore: boolean,
    isWarningFinalAwayScore: boolean,
    isExistResultAndFirstTeamScore: boolean,
    isEnabledGoalRecordHt: boolean,
    isEnabledGoalRecordFt: boolean,
    eventStatus: string,
    leagueGroupId: number,
    htStatus: string,
    ftStatus: string,
    betStatus: string,
    applyGoalRecord: boolean,
    leagueId: number,
    isExistFgLg: boolean,
    isExistHtFgLg: boolean,
    isExistFgNg: boolean,
    originalGoalRecord: string,
    isScoreInconsistent: boolean
    sportType: number;
    childMatchType: number;
    parentId: number;


}