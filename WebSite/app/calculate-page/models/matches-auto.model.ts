import { Permission } from "../../shared/models/sportsbook-sop";
import { League } from "./league.model";

export class Matches {
    permission: Permission;
    leagues: League[];
}