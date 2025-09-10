import { Team } from "./team.model";
export class LeagueMatch {
    leagueId: number;
    leagueName: string;
    teams: Team[];
    collapsed: boolean;
    eventDate: string;
    deadHeat: boolean | null;
    highLight: boolean;
    deadHeatClass: string;
}

