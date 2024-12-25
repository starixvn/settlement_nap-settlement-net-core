import { TypeObject } from "../../shared/constants/type-object.native";
import { AutoSettleSettingRequest, ResultSetting } from "../../shared/models/settings";

export class AutoSettleSetting implements AutoSettleSettingRequest {
  typeObject: TypeObject;
  resultSettings: ResultSetting[];
  oldResultSettings: ResultSetting[];
  leagueId: number;
  matchId: number;
}