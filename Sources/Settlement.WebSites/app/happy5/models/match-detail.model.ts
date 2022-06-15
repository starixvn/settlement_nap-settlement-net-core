import { Ball } from './index';
export class MatchDetail {
    public matchId: number;
    public leagueId: number;
    public matchCode: string;
    public kickOffTime: string;
    public eventDate: string;
    public eventName: string;
    public eventStatus: string;
    public balls: Ball[];
    public isYesterdayMatch: boolean;
    public totalBall: string;
    public bigSmall: string;
    public oddEven: string;
    public seasons: string;
    public moreOddEven: string;
    public combo: string;
}

export class PopupModel {
    public matchDetail: MatchDetail;
    public apiUrl: string;
    constructor(matchDetail: MatchDetail, apiUrl: string){
        this.matchDetail = matchDetail;
        this.apiUrl = apiUrl;
    }
}