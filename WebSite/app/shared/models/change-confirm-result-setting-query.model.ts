import { ResourceItem } from './resource-item.model';
import { HedgeMatchDetail } from './sportsbook-sop';

export interface ChangeConfirmResultSettingQuery {
    message: string;
    matchId: number;
    resourceIds: string;
    isEnabled: boolean;
    hedgeMatchDetail?: HedgeMatchDetail;
    oldMatchDetail?: HedgeMatchDetail;
    confirmRefundResources?: ResourceItem[];
    selectedResources?: ResourceItem[];
    isSettleDetermined?: boolean;
}
