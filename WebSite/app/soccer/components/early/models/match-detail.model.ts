import { GoalIcon } from './../../../models/goal-icon.model';

export interface MatchDetail {
    matchId: number,
    matchCode: string,
    leagueName: string,
    kickOffTime: string,
    homeId: null,
    homeName: string,
    awayName: string,
    playTime: number,
    goalRecord: string,
    goalIcon: GoalIcon,
    childMatchType: number,
    sportType: number,
    halfTimeAwayScore: string,
    halfTimeHomeScore: string,
    finalAwayScore: string,
    finalHomeScore: string
}