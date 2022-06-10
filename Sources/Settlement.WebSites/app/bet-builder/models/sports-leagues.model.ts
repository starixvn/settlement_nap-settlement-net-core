import { LeagueMatches } from "./league-matches.model";
export class SportLeagues {
    public id: number;
    public name: string;
    public collapse = false;
    public leagues: LeagueMatches[];
}