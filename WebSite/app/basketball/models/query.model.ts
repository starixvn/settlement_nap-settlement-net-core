import { CalculateAction } from '../../shared/constants';
import { BasketballApiKeys } from '../constants';
import { MatchDetail, ResultDetail, SettleQuery } from '../../shared/models/sportsbook-sop';
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
    selectedResources: ResultDetail[];
    action: string;
    determinedType: number;

    constructor(matchId: number, selectedResources: ResultDetail[], action: string, determinedType: number) {
        this.matchId = matchId;
        this.selectedResources = selectedResources;
        this.action = action;
        this.determinedType = determinedType;
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

    constructor(matchDetail: MatchDetail, action: string, voidBetInfos: VoidBetInfo[]) {
        this.matchId = matchDetail.matchId;
        this.homeId = matchDetail.homeId;
        this.awayId = matchDetail.awayId;
        this.matchCode = matchDetail.matchCode;
        this.sportType = matchDetail.sportType;
        this.voidBetInfos = voidBetInfos;
        this.action = action;
    }
}

export class CashOutResultUpdateQuery {
    matchId: number;
    betstatus: string;
    lsHalf: number[];

    constructor(matchId: number, betstatus: string, lsHalf:number[]) {
        this.matchId = matchId;
        this.betstatus = betstatus;
        this.lsHalf = lsHalf;
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