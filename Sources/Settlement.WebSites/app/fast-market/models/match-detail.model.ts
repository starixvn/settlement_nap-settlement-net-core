import { GoalIcon } from './goal-icon.model';
import { AutoSettingIcon } from './auto-setting-icon.model';

export class MatchDetail {
    public matchId: number;
    public homeId: number;
    public homeName: string;
    public awayId: number;
    public awayName: string;
    public matchCode: string;
    public leagueId: number;
    public leagueName: string;
    public kickOffTime: Date;
    public halfTimeHomeScore: string;
    public halfTimeAwayScore: string;
    public finalHomeScore: string;
    public finalAwayScore: string;
    public autoSettingIcon: AutoSettingIcon;
    public matchAutoSettingTooltip: string;
    public leagueAutoSettingTooltip: string;
    public goalIcon: GoalIcon;
}