import { Team } from "./team.model";
export class LeagueMatch {
    public leagueId: number;
    public leagueName: string;
    public teams: Team[];
    public collapsed: boolean;
    public eventDate: string;
    public deadHeat: boolean;
    public deadHeatClass: string;
}
