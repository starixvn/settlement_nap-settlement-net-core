import { ResultSettingModel, GeneralResultDetail } from '../../shared/models';
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
    public isInvalidValue: boolean;
    public isNotTaken: boolean;
    public isSettleDetermined: boolean;
    public isSettleDeterminedOriginal: boolean;
    public isInvalidSelectedProceed: boolean;
    public isNotExistedValue: boolean;
    public resultSettingData: ResultSettingModel;
    public isMismatch: boolean;
    public resultState: string;
}