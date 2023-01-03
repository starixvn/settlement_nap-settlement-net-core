export class ChangeSettingQuery {
    matchId: string;
    type: number;
    isEnabled: boolean;
}

export class SettingQuery{
    type: number;
    isEnable: boolean;
    text: string;
    sortText: string;
}