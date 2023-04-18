import { Permission } from "./permission.model";
import { SportLeague } from "./sport-league.model";

export interface Outright {
    sportLeague: SportLeague[],
    permission: Permission,
}