export class MatchDetail {
    public matchId: number;
    public matchCode: string;
    public kickOffTime: string;
    public leagueName: string;
    public leagueId: number;
    public homeName: string;
    public awayName: string;
    public homeId: number;
    public awayId: number;
    public playTime: number;
    public bestOfMap: number;
    public map: MatchDetail;
    public isSavedScore: boolean;
    public betStatus: string;
    public confirmFT: number;
    public eventStatus: string;
    public sportName: string;
    public sportType: number;
    public exFTAwayScore?: number;
    public exFTHomeScore?: number;
    public externalSourceName: string;
    public leagueGroupId: number;
    public gameType: number;
    public parentId: number;
    public autoSetting: number;
    public isFantasy: boolean;
}