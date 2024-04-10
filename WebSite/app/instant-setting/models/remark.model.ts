export class Remark {
    public isPending: boolean;
    public isUndecided: boolean;
    public isUnderSettle: boolean;
    public isMtdHold: boolean;
    public isKeyHold: boolean;

    constructor() {
        this.isPending = false;
        this.isUndecided = false;
        this.isUnderSettle = false;
        this.isMtdHold = false;
        this.isKeyHold = false;
    }
}