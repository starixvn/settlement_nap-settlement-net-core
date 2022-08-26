import { Permission } from "../../shared/models/sportsbook-sop/permission.model";
import { SportMatch } from "../../shared/models";

export class MultiSport {
    public permission: Permission;
    public sports: SportMatch[];
    public isCheckedCalcMP = false;
}
