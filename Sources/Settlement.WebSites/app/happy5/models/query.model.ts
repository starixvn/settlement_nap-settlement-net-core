import { Ball } from './ball.model';
export class GetMatchesQuery {
    matchCode: string;
    status: string;
    fromDate: string;
    toDate: string;

    constructor(
        matchCode: string,
        status: string,
        fromDate: string,
        toDate: string) {
        this.matchCode = matchCode;
        this.status = status;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}

export class SettleQuery {
    matchId: number;
    balls: Ball[];
    action: string;

    constructor(matchId: number, balls: Ball[], action: string) {
        this.matchId = matchId;
        this.balls = balls;
        this.action = action;
    }
}
