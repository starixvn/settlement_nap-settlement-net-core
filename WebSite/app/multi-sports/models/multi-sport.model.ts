import { Permission } from "../../shared/models/sportsbook-sop/permission.model";
import { SportMatch } from "./";

export class MultiSport {
    public permission: Permission;
    public sports: SportMatch[];
}
