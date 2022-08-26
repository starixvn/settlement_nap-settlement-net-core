import { Permission } from "../../shared/models/sportsbook-sop";
import { League } from "./league.model";

export class Calculation {
    permission: Permission;
    leagues: League[];
}