import { ChangedMatchSetting } from "./changed-match-setting.model";
import { Permission } from "./permission.model";

export class ChangeSettingResult {
    match: ChangedMatchSetting;
    permission: Permission;
}