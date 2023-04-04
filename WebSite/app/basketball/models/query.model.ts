import { CalculateAction } from '../../shared/constants';
import { ResultDetail } from './result-detail.model';
import { BasketballApiKeys } from '../constants';
import { MatchDetail } from '../../shared/models/sportsbook-sop';
import { VoidBetInfo } from './void-bet-info.model';

export class SettleQuery {
    matchId: number;
    selectedResources: ResultDetail[];
    actionName: string;
    apikey: string;
    isReSettledTickets: boolean;
    betStatus: string;
    isLeader: boolean;
    isDirectly: boolean;

    constructor(
        matchId: number,
        selectedResources: ResultDetail[],
        actionName: string,
        isReSettledTickets: boolean,
        betStatus?: string,
        isDirectly = false) {
        this.matchId = matchId;
        this.selectedResources = selectedResources;
        this.actionName = actionName;
        this.apikey = BasketballApiKeys.settle;
        this.isReSettledTickets = isReSettledTickets;
        this.betStatus = betStatus === undefined ? '' : betStatus;
        this.isDirectly = isDirectly;
    }
}

export class RefundParlayQuery {
    matchId: number;
    actionName: string;
    apikey: string;
    constructor(matchId: number) {
        this.matchId = matchId;
        this.actionName = CalculateAction.refund;
        this.apikey = BasketballApiKeys.refundParlay;
    }
}

export class MatchQuery {
    matchId: string;
    settleType: string;
    apikey: string;
    sportType: number;
    constructor(matchId: string, settleType: string, apikey: string) {
        this.matchId = matchId;
        this.settleType = settleType;
        this.apikey = apikey;
    }
}

export class GetTicketInfoQuery {
    matchId: number;
    selectedResources: string[];
    action: string;

    constructor(query: SettleQuery, isUndo: boolean) {
        this.matchId = query.matchId;
        this.selectedResources = query.selectedResources.map(item => item.resourceId);
        this.action = isUndo ? CalculateAction.unCalculate : CalculateAction.refund;
    }
}

export class VoidBetQuery {
    matchId: number;
    voidBetInfos: VoidBetInfo[];
    action: string;
    homeId: number;
    awayId: number;
    matchCode: string;
    sportType: number;

    constructor(matchDetail: MatchDetail, isUndo: boolean, voidBetInfos: VoidBetInfo[]) {
        this.matchId = matchDetail.matchId;
        this.voidBetInfos = voidBetInfos;
        this.action = isUndo ? CalculateAction.unCalculate : CalculateAction.refund;
        this.homeId = matchDetail.homeId;
        this.awayId = matchDetail.awayId;
        this.matchCode = matchDetail.matchCode;
        this.sportType = matchDetail.sportType;
    }
}

export class CashOutResultUpdateQuery {
    matchId: number;
    betstatus: string;

    constructor(matchId: number, betstatus: string) {
        this.matchId = matchId;
        this.betstatus = betstatus;
    }
}


export class CashOutResultRefundQuery {
    matchId: number;
    half: number;
    betstatus: string;

    constructor(matchId: number, betstatus: string, half: number) {
        this.matchId = matchId;
        this.betstatus = betstatus;
        this.half = half;
    }
}