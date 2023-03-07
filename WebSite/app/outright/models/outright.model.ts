import { LeagueMatch } from "./league-match.model";
import { Permission } from "./permission.model";

export interface Outright {
    permission: Permission,
    leagueMatch: LeagueMatch[]
}