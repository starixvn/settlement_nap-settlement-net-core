import { RemarkStatus } from "./remark-status.model";
import { Permission } from "./permission.model";

export class RemarkAndPermission {
    match: RemarkStatus;
    permission: Permission;
}