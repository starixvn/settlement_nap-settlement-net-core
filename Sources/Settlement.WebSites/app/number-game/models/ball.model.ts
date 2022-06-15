export class Ball {
    public matchId: number;
    public seq: number;
    public numberBall?: number;
    public color: string;
    public eventStatus: string;
    public isNA = false;
    public isDisableCheckbox = false;

    constructor(matchId: number, seq: number, numberBall: number) {
        this.matchId = matchId;
        this.seq = seq;
        this.numberBall = numberBall;
        this.isNA = false;
        this.isDisableCheckbox = false;
    }
}