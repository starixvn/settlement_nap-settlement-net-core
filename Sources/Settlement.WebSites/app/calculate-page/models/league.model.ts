import { Match } from "../../shared/models";

export class League {
    public leagueId: number;
    public leagueName: string;
    public matches: Match[];
}