import { ResultSettingModel } from "../../shared/models";

export class ChildMatch {
    public matchCode: string;

    public resourceId: string;

    public matchId: number;

    public eventStatus: string;

    public betStatus: string;

    public homeValue: string;

    public awayValue: string;

    public childMatchType: number;

    public resultStatusId: number;

    public confirmFT: number;

    public isHold: boolean;

    public checked: boolean;

    public relatedResourceId: string;

    public leagueName: string;

    public isNotConsistent: boolean;

    resultSettingData: ResultSettingModel;
}