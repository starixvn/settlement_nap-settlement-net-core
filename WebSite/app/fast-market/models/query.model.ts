import { EventCounter, BetType } from "./";
import * as _ from 'lodash';
import { FastMarketResult } from "./fast-market-result.model";
import { ResultDetail } from "./result-detail.model";
export class SettleQuery {
    eventCounters: EventCounter[];
    betTypes: BetType[];
    matchId: number;
    action: string;
    isReSettledTickets: boolean;
    isSettleDetermined: boolean;

    constructor(
        eventCounters: EventCounter[],
        betTypes: BetType[],
        matchId: number,
        action: string,
        isReSettledTickets: boolean) {
        this.eventCounters = _.filter(eventCounters, (item: EventCounter) => item.checked && item.isShow);

        this.betTypes = _.cloneDeep(betTypes);
        _.forEach(this.betTypes, (betType) => {
            betType.fastMarketResults = _.filter(betType.fastMarketResults, (item: FastMarketResult) => item.checked && item.isShow);
        });

        this.betTypes = _.filter(this.betTypes, (item: BetType) => item.fastMarketResults.length > 0);
        this.matchId = matchId;
        this.action = action;
        this.isReSettledTickets = isReSettledTickets;
    }
}

export class CheckingMarkedTicketsQuery {
    matchId: number;
    betTypes: BetType[];

    constructor(matchId: number, betTypes: BetType[]) {
        this.matchId = matchId;
        this.betTypes = _.cloneDeep(betTypes);
        _.forEach(this.betTypes, (betType) => {
            betType.fastMarketResults = _.filter(betType.fastMarketResults, (item: FastMarketResult) => item.checked && item.isShow);
        });

        this.betTypes = _.filter(this.betTypes, (item: BetType) => item.fastMarketResults.length > 0);
    }
}

export class UpdateWaterBreakQuery {
    matchId: number;
    waterBreakDetail: ResultDetail;
    actionId: number;
    remark: string;
}