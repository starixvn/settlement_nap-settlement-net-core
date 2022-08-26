export class FilterQuery {
    matchId: string;
    filterOver: number;
    fastMarketsOnly: boolean;
    autoSettlementOnly: boolean;
    isMarkedTicket: boolean;
    isIncludeTest: boolean;
    fromDate: string;
    toDate: string;
    matchCode: string;
    leagueId: string;
    statusId: number;
    sportType = 1;;
    isUnCalculate: boolean;
    isInstant: boolean;
    isHtOverOnly: boolean;
    isOverOnly: boolean;
    autoSetting: string;
}