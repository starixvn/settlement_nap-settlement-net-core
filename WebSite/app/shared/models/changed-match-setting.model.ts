import { Remark } from "../../shared/models";
import { AutoSetting } from "./match-details/auto-setting.model";

export class ChangedMatchSetting {
    eventStatus: string;
    remark: Remark;
    newEventStatus: string;
    autoCalcSetting: AutoSetting;
}