import * as _ from 'lodash';
import { ResultSettingModel, GeneralResultDetail } from '../../shared/models';
export class ResultDetail extends GeneralResultDetail{
    public map: number;
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
    public isInvalidSelectedProceed: boolean;
    public isNotExistedValue: boolean;
    public resultSettingData: ResultSettingModel;
}