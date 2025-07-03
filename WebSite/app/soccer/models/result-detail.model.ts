import { ResultSettingModel, GeneralResultDetail } from '../../shared/models';
import { ExternalResultDetail } from '../../shared/models/sportsbook-sop';
export class ResultDetail extends GeneralResultDetail{
    public map: number;
    public sourceId : number;
    public ticketStatus: string;
    public betType: string;
    public betTypeName: string;
    public checked: boolean;
    public isResultWarning: boolean;
    public isHomeValueWarning: boolean;
    public isAwayValueWarning: boolean;
    public isNotTaken: boolean;
    public isSettleDetermined: boolean;
    public isSettleDeterminedOriginal: boolean;
    public isInvalidSelectedProceed: boolean;
    public isNotExistedValue: boolean;
    public traderScore: GeneralResultDetail;
    public externalScores: ExternalResultDetail[];
    public resultSettingData: ResultSettingModel = {
        isHoldResult: false,
        isConfirmedRefund: false,
        isConfirmedRefundSdt: false,
        isConfirmedRefundMercy: false,
        iconHoldResult: ''
    };
    public isMismatch: boolean;
    public resultState: string;
    public isShow = true;
    public isEnabled = false;
    
}