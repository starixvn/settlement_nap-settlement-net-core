import { EventCounter, TicketCount, BetType, Permission, ResultDetail } from ".";

export class FastMarkets {
    public matchId: number;
    public action: string;
    public eventCounters: EventCounter[];
    public ticketCount: TicketCount;
    public eventCounterCollapsed: boolean;
    public eventCounterChecked: boolean;
    public eventCounterHided: boolean;
    public betTypes: BetType[];
    public resultDetail: ResultDetail[];
    public permission: Permission;
}