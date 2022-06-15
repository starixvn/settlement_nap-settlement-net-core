export class LogQuery {
    matchCode: string;
    productType: string;
    fromDate: string;
    toDate: string;
    apiUrl: string;

    constructor(
        matchCode: string,
        productType: string,
        fromDate: string,
        toDate: string,
        apiUrl: string) {
        this.matchCode = matchCode;
        this.productType = productType;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.apiUrl = apiUrl;
    }
}