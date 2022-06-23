import { SportMatch } from "../../shared/models";
import { Permission } from "./permission.model";

export class MultiSport {
    public permission: Permission;
    public sports: SportMatch[];
    public isCheckedCalcMP = false;
}
