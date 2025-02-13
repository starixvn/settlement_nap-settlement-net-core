import { ResultDetail } from './result-detail.model';
export class SettleQuery {
    matchId: number;
    actionName: string;
    selectedResources: ResultDetail[];
    isReSettledTickets: boolean;
    childMatchType: number;
    sportType: number;
    constructor(matchId: number, 
        actionName: string, 
        selectedResultDetails: ResultDetail[], 
        isReSettledTickets: boolean, 
        childMatchType: number,
        sportType: number) {
        this.matchId = matchId;
        this.actionName = actionName;
        this.selectedResources = selectedResultDetails;
        this.isReSettledTickets = isReSettledTickets;
        this.childMatchType = childMatchType;
        this.sportType = sportType;
    }
}