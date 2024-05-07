import { InputOption } from "./input-option.model";
import { GeneralResultDetail, ResultSettingModel } from "../index";
import { ExternalResultDetail } from "./external-result-detail.model";
import { MultipleSelect } from "../multiple-select.model";

export class ResultDetail extends GeneralResultDetail {
    ticketStatus: string;
    map: number;
    groupBetType: number;
    betType: string;
    betTypeName: string;
    homeName = '';
    homeId : string | null = null;
    awayId  : string | null = null;
    awayName = '';
    checked: boolean = false;
    isResultWarning: boolean;
    isDurationWarning: boolean;
    externalScores: ExternalResultDetail[];
    isScoreMismatched: boolean;
    isShow = true;
    disabled: boolean;
    resultSettingData: ResultSettingModel;
    originalHomeValue: string;
    originalAwayValue: string;
    className = '';
    groupId: string;
    resultName: string;
    groupName: string;
    inputType: number;
    isSpecialBettype: boolean;
    isDisplayedForMember: boolean;
    inputOptions: InputOption[];
    multipleResultSelect: MultipleSelect;
    otherInfo: string;
    isResultWarningByBetType: boolean;
    ordNo: number;
    intervalNo: number;

}