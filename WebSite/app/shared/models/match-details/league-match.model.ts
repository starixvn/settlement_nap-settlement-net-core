import { Match } from './match.model';
import { AutoSetting } from './auto-setting.model';

export class LeagueMatch {
    public leagueId: number;
    public name: string;
    public matches: Match[];
    public collapse = false;
    public autoCalcSetting: AutoSetting;
    public enabledAutoRefund: boolean;
}
