import { AutoSetting } from './../../shared/models/match-details/auto-setting.model';
import { Match } from './match.model';

export class LeagueMatch {
    public sportType: number;
    public leagueId: number;
    public name: string;
    public matches: Match[];
    public collapse = false;
    public autoWaitingTime: number;
    public autoMainWaitingTime: number;
    public autoEarlyWaitingTime: number;
    public autoRetryTime: number;
    public autoCalcSetting: AutoSetting;
    public refundWaitingTime: number;
}
