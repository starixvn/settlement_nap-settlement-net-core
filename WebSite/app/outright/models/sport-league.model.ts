import { League, Sport } from "../../shared/models";
import { LeagueMatch } from "./league-match.model";

export interface SportLeagueFilter {
    leagues: League[],
    sports: Sport[]
}

export interface SportLeague {
    leagueMatch: LeagueMatch[],
    sportName: string,
    collapsed: boolean;
}