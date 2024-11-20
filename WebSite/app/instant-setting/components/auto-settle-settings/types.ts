import { AutoSettleType } from "../../../shared/constants/auto-settle-type.native";
import { ResourceType } from "../../../shared/constants/resource-type.native";
import { TypeObject } from "../../../shared/constants/type-object.native";

export interface Provider {
    sourceId: number;
    sourceName: string;
    priority: number;
    isActive: boolean;
}

export interface ResultSetting {
    settleType: AutoSettleType,
    resourceType: ResourceType,
    enabled: boolean,
    waitingTime: number,
    isTraderRequired: boolean
    minProvider: number,
    providers: Provider[],
}

export interface IAutoSettleSettingsResponse {
    leagueId: number;
    leagueName: string;
    typeObject: TypeObject
    matchId: number | null;
    isApplyAll: boolean;
    resultSettings: ResultSetting[];
}


export class AutoSettleSettings implements IAutoSettleSettingsResponse {
    leagueId = 0;
    leagueName = '';
    matchId: number | null = 0;
    typeObject: TypeObject = "Match";
    isApplyAll = false;
    resultSettings: ResultSetting[] = []
}

export type GetAutoSettleSettings = {
    leagueId: number;
    matchId: number;
    sportType: number;
    typeObject: TypeObject;
}

export type UpdateAutoSettleSettings = {
    leagueId: number;
    typeObject: TypeObject
    matchId: number | null;
    isApplyAll: boolean;
    resultSettings: ResultSetting[];
    oldResultSettings: ResultSetting[];
}