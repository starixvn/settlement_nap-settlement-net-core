import { ResourceItem } from "../resource-item.model";
import { ResultDetail } from "./result-detail.model";

export class SettleQuery {
    matchId: number;
    selectedResources: ResultDetail[] | ResourceItem[];
    actionName: string;
    apikey: string;
    isReSettledTickets: boolean;
    betStatus: string;
    isLeader: boolean;
    isDirectly: boolean;
    hasSdt: boolean;
    sportType: boolean;

    constructor(
        matchId: number,
        selectedResources: ResultDetail[],
        actionName: string,
        isReSettledTickets: boolean,
        betStatus: string,
        apikey: string,
        isLeader = false) {
        this.matchId = matchId;
        this.selectedResources = selectedResources;
        this.actionName = actionName;
        this.apikey = apikey;
        this.isReSettledTickets = isReSettledTickets;
        this.betStatus = betStatus;
        this.isLeader = isLeader;
    }
}
