import { ResultDetail } from "./sportsbook-sop";

export class SettleChildMatchQuery {
  childMatchIds: string;
  selectedResources: ResultDetail[];
  actionName: string;
  isReSettledTickets: boolean;
  sportType: number;
  parentSessionId: string;

  constructor(
      childMatchIds: string,
      selectedResources: ResultDetail[],
      actionName: string,
      isReSettledTickets: boolean) {
      this.childMatchIds = childMatchIds;
      this.selectedResources = selectedResources;
      this.actionName = actionName;
      this.isReSettledTickets = isReSettledTickets;
  }
}
