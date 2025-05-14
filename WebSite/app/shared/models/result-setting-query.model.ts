import { ResourceItem } from "./resource-item.model";

export class ResultSettingQuery {
  matchId: number;
  type: number;
  isEnabled: boolean;
  resourceIds: string;
  selectedResources: ResourceItem[];
  is3x3: boolean;
  confirmRefundResources: ResourceItem[];
  sportType: number;
  childMatchType: number;

  constructor(
    matchId: number,
    type: number,
    isEnabled: boolean,
    resourceIds?: string,
    selectedResources?: ResourceItem[],
    sportType?: number,
    chidMatchType?: number
  ) {
    this.matchId = matchId;
    this.type = type;
    this.isEnabled = isEnabled;
    this.resourceIds = resourceIds;
    this.selectedResources = selectedResources;
    this.sportType = sportType;
    this.childMatchType = chidMatchType;
  }
}
