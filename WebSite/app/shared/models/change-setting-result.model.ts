import { ChangedMatchSetting } from "./changed-match-setting.model";
import { Permission } from "./sportsbook-sop";

export class ChangeSettingResult {
    match: ChangedMatchSetting;
    permission: Permission;
}