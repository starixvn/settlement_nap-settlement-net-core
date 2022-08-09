import { ChildMatch } from "../models/child-match.model";
import { ResultDetail } from "../../shared/models/sportsbook-sop";

export class SettleChildMatchQuery {
    childMatches: ChildMatch[];
    actionName: string;
    isReSettledTickets: boolean;

    constructor(
        childMatches: ChildMatch[],
        actionName: string,
        isReSettledTickets: boolean) {
        this.childMatches = childMatches;
        this.actionName = actionName;
        this.isReSettledTickets = isReSettledTickets;
    }
}