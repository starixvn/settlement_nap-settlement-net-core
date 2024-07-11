import { ChildMatch } from "../models/child-match.model";
import { ResultDetail } from "../../shared/models/sportsbook-sop";

export class SettleChildMatchQuery {
    childMatches: ChildMatch[];
    actionName: string;
    isReSettledTickets: boolean;
    selectedResources: ResultDetail[];
    parentMatchId: number;
    sportType: number;
    constructor(
        childMatches: ChildMatch[],
        actionName: string,
        isReSettledTickets: boolean,
        selectedResources: ResultDetail[]) {
        this.childMatches = childMatches;
        this.actionName = actionName;
        this.isReSettledTickets = isReSettledTickets;
        this.selectedResources = selectedResources;
    }
}