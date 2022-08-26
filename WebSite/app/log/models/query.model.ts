export class LogQuery {
    matchCode: string;
    productType: string;
    fromDate: string;
    toDate: string;

    constructor(
        matchCode: string,
        productType: string,
        fromDate: string,
        toDate: string) {
        this.matchCode = matchCode;
        this.productType = productType;
        this.fromDate = fromDate;
        this.toDate = toDate;
    }
}