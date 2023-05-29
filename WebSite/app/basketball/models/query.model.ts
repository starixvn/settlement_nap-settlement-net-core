import { CalculateAction } from '../../shared/constants';
import { BasketballApiKeys } from '../constants';
import { MatchDetail, SettleQuery } from '../../shared/models/sportsbook-sop';
import { VoidBetInfo } from './void-bet-info.model';


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

    constructor(matchId: number, selectedResources: string[], isUndo: boolean) {
        this.matchId = matchId;
        this.selectedResources = selectedResources;
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
    betStatus: string;

    constructor(matchId: number, betStatus: string, half: number) {
        this.matchId = matchId;
        this.betStatus = betStatus;
        this.half = half;
    }
}