import { InputOption } from "./input-option.model";
import { GeneralResultDetail, ResultSettingModel } from "../index";
import { ExternalResultDetail } from "./external-result-detail.model";
import { MultipleSelect } from "../multiple-select.model";

export class ResultDetail extends GeneralResultDetail {
    public ticketStatus: string;
    public map: number;
    public groupBetType: number;
    public betType: string;
    public betTypeName: string;
    public homeName = '';
    public awayName = '';
    public checked: boolean;
    public isResultWarning: boolean;
    public isDurationWarning: boolean;
    public externalScores: ExternalResultDetail[];
    public isScoreMismatched: boolean;
    public isShow = true;
    public resultSettingData: ResultSettingModel;
    public originalHomeValue: string;
    public originalAwayValue: string;
    public className: string;
    public groupId: string;
    public resultName: string;
    public groupName: string;
    public inputType: number;
    public isSpecialBettype: boolean;
    public isDisplayedForMember: boolean;
    public inputOptions: InputOption[];
    public multipleResultSelect: MultipleSelect;
    public otherInfo: string;
    public isResultWarningByBetType: boolean;
}