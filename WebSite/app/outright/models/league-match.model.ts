import { Team } from "./team.model";
export class LeagueMatch {
    public leagueId: number;
    public leagueName: string;
    public teams: Team[];
    public eventDate: string;
}
