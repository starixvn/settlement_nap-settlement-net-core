import { Permission } from "../../shared/models/sportsbook-sop/permission.model";
import { LeagueMatch } from "./league-match.model";

export interface Outright {
    permission: Permission,
    leagueMatch: LeagueMatch[]
}