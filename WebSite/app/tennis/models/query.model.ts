import { SportType } from './../../shared/constants/sport-type.native';
import { ResultDetail } from '../../shared/models/sportsbook-sop';
import { TennisApiKeys } from '../constants';

export class SettleQuery {
    matchId: number;
    selectedResources: ResultDetail[];
    actionName: string;
    apikey: string;
    isReSettledTickets: boolean;
    betStatus: string;
    isLeader: boolean;
    isDirectly: boolean;
    sportType = SportType.tennis;
    isHedgeMatch: boolean;
    parentId: number;
    isSettleRelated = false;

    constructor(
        matchId: number,
        selectedResources: ResultDetail[],
        actionName: string,
        isReSettledTickets: boolean,
        betStatus: string,
        parentId: number,
        isDirectly = false) {
        this.matchId = matchId;
        this.selectedResources = selectedResources;
        this.actionName = actionName;
        this.apikey = TennisApiKeys.Settle;
        this.isReSettledTickets = isReSettledTickets;
        this.betStatus = betStatus;
        this.isDirectly = isDirectly;
        this.parentId = parentId
    }
}