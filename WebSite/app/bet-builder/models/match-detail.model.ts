import { AutoSetting } from './auto-setting.model';
import { MoreScore } from './more-score.model';
export class MatchDetail {
    public leagueName: string;
    public sportType: number;
    public sportName: string;
    public matchId: number;
    public matchCode: string;
    public homeName: string;
    public kickOffTime: string;
    public awayName: string;
    public eventStatus: string;
    public parlayStatus: string;
    public autoCalcSetting: AutoSetting;
    public queueStatus: number;
    public betStatus: string;
    public moreScores: MoreScore;
    public isShowLink: boolean;
}