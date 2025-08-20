import { Team } from "./team.model";
export class LeagueMatch {
    leagueId: number;
    leagueName: string;
    teams: Team[];
    collapsed: boolean;
    eventDate: string;
    deadHeat: boolean | null;
    deadHeatTeam: number;
    isCompleted: boolean;
    deadHeatClass: string;
    hasPotentialDeadHeatIssue: boolean;

}

