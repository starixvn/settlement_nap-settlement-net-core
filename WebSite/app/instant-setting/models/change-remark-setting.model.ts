import { Remark } from "./remark.model";
import { Permission } from "./permission.model";

export class ChangeRemarkSetting {
    public matchId: string;
    public matchCode: string;
    public remark: Remark;
    public permission: Permission;
}