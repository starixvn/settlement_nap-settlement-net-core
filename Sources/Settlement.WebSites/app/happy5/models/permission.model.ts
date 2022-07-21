export class Permission {
    public canItAdmin: boolean;
    public canCalculate: boolean;
    public canRefund: boolean;
    public canViewSettlementLog: boolean;
    constructor(canCalculate: boolean, canRefund: boolean, canItAdmin: boolean) {
        this.canCalculate = canCalculate;
        this.canRefund = canRefund;
        this.canItAdmin = canItAdmin;
    }
}