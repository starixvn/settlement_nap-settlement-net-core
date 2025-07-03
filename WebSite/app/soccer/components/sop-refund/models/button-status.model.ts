export class MainRefundButtonStatus {
    isDisableRefundHT: boolean;
    isDisableRefundFT: boolean;
    isDisableRefundAll: boolean;
    constructor(refundHT: boolean, refundFT: boolean, refundAll:boolean ){
        this.isDisableRefundHT = refundHT;
        this.isDisableRefundFT = refundFT;
        this.isDisableRefundAll = refundAll;
    }
}

export class SubRefundFTButtonStatus {
    isDisableRefundFTSus: boolean;
    isDisableRefundFTNotSDT: boolean;
    constructor(refundFTSus: boolean, refundFTNotSDT: boolean){
        this.isDisableRefundFTNotSDT = refundFTNotSDT;
        this.isDisableRefundFTSus = refundFTSus;
    }
}

export class SubRefundAllButtonStatus {
    isDisableRefundAllSus: boolean;
    isDisableRefundAllPos: boolean;

    constructor(refundAllSus: boolean, refundAllPos: boolean){
        this.isDisableRefundAllSus = refundAllSus;
        this.isDisableRefundAllPos = refundAllPos;
    }
}

