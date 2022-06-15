export class Ball {
    public matchId: number;
    public seq: number;
    public numberBall?: number;

    constructor(matchId: number, seq: number, numberBall: number) {
        this.matchId = matchId;
        this.seq = seq;
        this.numberBall = numberBall;
    }
}