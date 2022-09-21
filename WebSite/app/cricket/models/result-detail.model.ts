import { ExternalResultDetail } from "../../shared/models/sportsbook-sop";
import { GeneralResultDetail, ResultSettingModel } from "../../shared/models";

export class ResultDetail extends GeneralResultDetail {
    public ticketStatus: string;
    public resultName: string;
    public checked: boolean;
    public groupName: string;
    public isResultWarning: boolean;
    public betTypeName: string;
    public isShow: boolean;
    public resultSettingData: ResultSettingModel;
    public inputType: number;
    public map: number;
    public groupBetType: number;
    public betType: string;
    public homeName = '';
    public awayName = '';
    public isDurationWarning: boolean;
    public externalScores: ExternalResultDetail[];
    public isScoreMismatched: boolean;
    public originalHomeValue: string;
    public originalAwayValue: string;
    public className: string;
    public groupId: string;
}