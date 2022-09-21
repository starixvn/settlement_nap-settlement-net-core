import { LeagueMatch } from "./league-match.model";

export class SportMatch {
    public id: number;
    public name: string;
    public collapse = false;
    public leagues: LeagueMatch[];
}
