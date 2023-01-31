import { Permission } from "../models";
import { Team } from "./team.model";

export interface LeagueSettle {
    leagueName: string;
    sportName: string;
    teams: Team[];
    permission: Permission;
    moveBetsDay: string;
}