export class Score {
    public home: string;
    public away: string;
    public background: string;
    public isConfirmed: boolean;
    public isNotSettled: boolean;
    public isSettled: boolean;

    constructor(home: string, away: string, background = '', isConfirmed = false, isNotSettled = false) {
        this.home = home;
        this.away = away;
        this.background = background;
        this.isConfirmed = isConfirmed;
        this.isNotSettled = isNotSettled;
    }
}