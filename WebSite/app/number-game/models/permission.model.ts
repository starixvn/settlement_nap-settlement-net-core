export class Permission {
    public canItAdmin: boolean;
    public canCalculate: boolean;
    public canViewSettlementLog: boolean;
    constructor(canCalculate: boolean, canItAdmin: boolean) {
        this.canCalculate = canCalculate;
        this.canItAdmin = canItAdmin;
    }
}