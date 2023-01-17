import { Permission } from "../models";
import { Team } from "./team.model";

export interface LeagueSettle {
    leagueName: string;
    teams: Team[];
    permission: Permission;
}