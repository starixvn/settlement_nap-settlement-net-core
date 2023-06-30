import { ResourceItem } from "./resource-item.model";

export class ResultSettingQuery {
    matchID: number;
    type: number;
    isEnabled: boolean;
    resourceIds: string;
    selectedResources: ResourceItem[];
    is3x3: boolean;

    constructor(matchId: number, type: number, isEnabled: boolean, resourceIds?: string, selectedResources?: ResourceItem[]) {
        this.matchID = matchId;
        this.type = type;
        this.isEnabled = isEnabled;
        this.resourceIds = resourceIds;
        this.selectedResources = selectedResources;
    }
}