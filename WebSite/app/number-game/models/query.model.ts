import { Ball } from './ball.model';
export class GetMatchesQuery {
    matchCode: string;
    matchStatus: string;
    fromDate: string;
    toDate: string;

    constructor(
        matchCode: string,
        matchStatus: string,
        fromDate: string,
        toDate: string) {
        this.matchCode = matchCode;
        this.matchStatus  = matchStatus;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}

export class SettleQuery {
    matchId: number;
    balls: Ball[];
    action: string;

    constructor(matchId: number, balls: Ball[]) {
        this.matchId = matchId;
        this.balls = balls;
    }
}
